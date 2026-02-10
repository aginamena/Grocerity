import { GoogleGenAI, Type } from "@google/genai";
import { generateCode, generateScript } from "./promts";
import { supabase } from "@/lib/supabase";
import {Opik} from "opik";

const genai = new GoogleGenAI({});
const client = new Opik()

export async function generateRemotionCode(design: DesignWithUrls) {
  const designStr = JSON.stringify(design, null, 2);
  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `Write the remotion code given the design JSON: \n\n ${designStr}`,
    config: {
      systemInstruction: generateCode,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          code: {
            type: Type.STRING,
            description: "The complete remotion code implementing the design",
          },
          durationInFrames: {
            type: Type.NUMBER,
            description: "Total duration of the video in frames",
          },
        },
        required: ["code", "durationInFrames"],
      },
    },
  });
  const result = response.text;

  const inputCosts = ((response?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.3;
  const outputCosts = (((response?.usageMetadata?.totalTokenCount || 0) - (response?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 2.5;
  const totalCost = inputCosts + outputCosts;

  // Trace logging into opik
  const trace = client.trace({
    name: "generateRemotionCode",
    input: {
      design: designStr,
    },
    output: { response: result },
    metadata: {
      model: "gemini-2.5-flash",
      tokens: {
        inputTokens: response?.usageMetadata?.promptTokenCount || 0,
        outputTokens: response?.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response?.usageMetadata?.totalTokenCount || 0,
      },
      costs: {
        inputCosts: inputCosts,
        outputCosts: outputCosts,
        totalCosts: totalCost
      },
    },
  });
  trace.end();
  client.flush();
  return {code: result, cost: totalCost};
}

export async function AddVoiceoverURLsAndImageURLsToDesign(
  design: Design,
  imageUrls: string[]
): Promise<DesignWithUrls> {
  // 1. Generate Voiceover URL
  const { url: voiceoverUrl } = await convertVoiceoverToPublicUrl(design.voiceover);

  // 2. Map Image URLs to segments
  const updatedSegments = design.segments.map((segment, index) => ({
    ...segment,
    imageUrl: imageUrls[index] || imageUrls[0], // Fallback to first if mismatch
  }));

  const result: DesignWithUrls = {
    ...design,
    voiceoverUrl,
    segments: updatedSegments,
  };
  return result;
}

/**
 * Refines the generated image to fix spelling, grammatical, or styling errors.
 */
async function fixVisualErrors(imageBase64: string, mimeType: string, script : string): Promise<{ data: string, cost: number }> {
  const result = await genai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      { text: `Carefully inspect this image. This image was generated based on this voiceover segment: "${script}". Fix any spelling mistakes in labels, grammatical errors on packaging, or unnatural styling artifacts. Ensure the final image is polished, professional, and accurately reflects the provided context.` },
      { inlineData: { mimeType, data: imageBase64 } }
    ],
    config: {
      systemInstruction: `
Role: Quality Control Specialist for Global Advertising.
Task: Identify and fix visual defects in the product image.
Directives:
1. Grammar & Spelling: Correct any mangled text, typos, or nonsensical characters on products or backgrounds.
2. Styling Integrity: Fix unnatural proportions, weird reflections, orAI artifacts (e.g., extra fingers if people are present, warped textures).
3. Consistency: Maintain the high-end "Hero" aesthetic while ensuring technical perfection.
Output: Return ONLY the corrected high-fidelity 9:16 visual.
`,
      responseModalities: ['IMAGE'],
    }
  });

  const inputCosts = ((result?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.3;
  const outputCosts = (((result?.usageMetadata?.totalTokenCount || 0) - (result?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 30.0;
  
  const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  return { 
    data: imagePart?.inlineData?.data || imageBase64, 
    cost: inputCosts + outputCosts 
  };
}


/**
 * Enhances images based on VO and uploads ONLY the cleaned versions to storage.
 */
export async function enhanceAndUploadImages(design: Design, files: File[]): Promise<{urls:string[], cost:number}> {
  const cleanedUrls: string[] = [];
  let result = null;
  let totalCost = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const script = 
    design.segments[i]?.voSegment || "Fresh and high quality product.";

    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      result = await genai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: [
          { text: `Enhance this image to perfectly match this voiceover segment: "${script}". Make it scroll-stopping, jaw dropping, attention grabbing, go now to the store to buy this product. If you include any words, it should be 3 words maximum on an image, that's if you choose to include any.` },
          { inlineData: { mimeType: file.type, data: base64 } }
        ],
        config: {
          systemInstruction: `
Role: Elite Master of Retail Consumer Psychology.
Task: Transform this image into a premium 9:16 commercial "Hero" visual that triggers an immediate urge to buy.
Directives:
1. Luminous Clarity: Use extremely bright, clean, and high-key lighting. Ensure every detail is razor-sharp and colors are hyper-vibrant for a polished, professional look.
2. Impactful Simplicity: Use text overlays or minimal diagrams ONLY when critical to highlight a key benefit. Text MUST be 1-3 words maximum (e.g., "75% More Power", "Instant Results", "100% Organic").
3. Irresistibility: Elevate textures and focus to make the product look exceptionally high-end, polished, and jaw-dropping.
Output: Return ONLY the transformed high-fidelity 9:16 visual.
`,
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: "9:16" }
        }
      });

      const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        const { data: fixedBase64, cost:fixCost } = await fixVisualErrors(imagePart.inlineData.data, file.type, script);
        totalCost += fixCost;

        const cleanedBuffer = Buffer.from(fixedBase64, "base64");
        const filePath = `cleaned/${Date.now()}-${i}.${file.type.split('/')[1]}`;
        
        await supabase.storage.from("images").upload(filePath, cleanedBuffer, { contentType: file.type });
        const { data } = supabase.storage.from("images").getPublicUrl(filePath);
        cleanedUrls.push(data.publicUrl);
        continue;
      }
    } catch (e) {
      console.error(`Enhancement failed for image ${i}, uploading original as fallback.`);
    }

    // Fallback: If enhancement fails, upload original now to ensure we have a URL
    const [fallbackUrl] = await uploadImages([file]);
    cleanedUrls.push(fallbackUrl);
  }

    const inputCosts = ((result?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.3;
    const outputCosts = (((result?.usageMetadata?.totalTokenCount || 0) - (result?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 30.0;
    totalCost += (inputCosts + outputCosts);

  // Trace logging into opik
  const trace = client.trace({
    name: "enhanceAndUploadImages",
  output: {response:cleanedUrls},
    metadata:{
      model: "gemini-2.5-flash-image",
        tokens: {
          inputTokens: result?.usageMetadata?.promptTokenCount,
          outputTokens: result?.usageMetadata?.candidatesTokenCount,
          totalTokens: result?.usageMetadata?.totalTokenCount,
        },
       costs:{
             // Prompt tokens are billed at input rate
        inputCosts: inputCosts,
        // Everything else (Generated Content + Thoughts) is billed at the high output rate for images
        outputCosts: outputCosts,
        totalCosts: totalCost,
       }
    }
 
  })
  trace.end()
   client.flush()

  return {urls: cleanedUrls, cost:totalCost};
}

export async function generateDesign(prompt: string, files: File[]) {
    const imageParts = await Promise.all(files.map(async (file) => {
    const buffer = await file.arrayBuffer();
    return {
      inlineData: {
        data: Buffer.from(buffer).toString("base64"),
        mimeType: file.type
      }
    };
  }));

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [...imageParts, { text: prompt }],
      },
    ],
    config: { 
      systemInstruction: generateScript,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          concept: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              vibe: { type: Type.STRING },
              duration: { type: Type.NUMBER },
              imageCount: { type: Type.NUMBER }
            },
            required: ["title", "vibe", "duration", "imageCount"]
          },
          voiceover: { type: Type.STRING },
          segments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                imageId: { type: Type.STRING },
                voSegment: { type: Type.STRING },
                duration: { type: Type.NUMBER },
                animation: { type: Type.STRING }
              },
              required: ["imageId", "voSegment", "duration", "animation"]
            }
          },
          timingSummary: {
            type: Type.OBJECT,
            properties: {
              durations: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              totalDuration: { type: Type.NUMBER }
            },
            required: ["durations", "totalDuration"]
          }
        },
        required: ["concept", "voiceover", "segments", "timingSummary"]
      }
     },
  });
     const result = JSON.parse(response.text || "{}") as Design;
  const inputCosts = ((response?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.3;
  const outputCosts = (((response?.usageMetadata?.totalTokenCount || 0) - (response?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 2.5;
  const totalCost = inputCosts + outputCosts;

  // Trace logging into opik
  const trace = client.trace({
    name: "generateDesign",
  input: {
   prompt,
   files,
  },
  output: {response:result},
    metadata:{
      model: "gemini-2.5-flash",
        tokens: {
          inputTokens: response?.usageMetadata?.promptTokenCount,
          outputTokens: response?.usageMetadata?.candidatesTokenCount,
          totalTokens: response?.usageMetadata?.totalTokenCount,
        },
       costs:{
             // Prompt tokens are billed at input rate
        inputCosts: inputCosts,
        // Everything else (Generated Content + Thoughts) is billed at the high output rate for images
        outputCosts: outputCosts,
        totalCosts: totalCost,
       }
    }
 
  })
  trace.end()
   client.flush()
    return {design: result, cost: totalCost};
}

export async function uploadImages(files: File[]){
        const uploadedUrls: string[] = [];
    
        for (const file of files) {
          const fileExtension = file.name.split(".").pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExtension}`;
          const filePath = `images/${fileName}`;
    
          const buffer = await file.arrayBuffer();
    
          const { data, error } = await supabase.storage
            .from("images")
            .upload(filePath, buffer, {
              contentType: file.type,
              upsert: false,
            });
          // Get public URL
          const { data: publicUrl } = supabase.storage
            .from("images")
            .getPublicUrl(filePath);
    
          uploadedUrls.push(publicUrl.publicUrl);
        }
        return uploadedUrls;
}

async function convertVoiceoverToPublicUrl(script: string, voiceName: string = 'Kore'): Promise<{url: string, cost: number}> {
  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text: script }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

     const inputCosts = ((response?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.5;
    const outputCosts = (((response?.usageMetadata?.totalTokenCount || 0) - (response?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 10.0;
    const totalCost = inputCosts + outputCosts;

    const part = response.candidates?.[0]?.content?.parts?.[0];
    const audioData = part?.inlineData?.data;

    if (!audioData) {
      throw new Error('No audio returned from Gemini');
    }

    const pcmBuffer = Buffer.from(audioData, 'base64');
    const wavBuffer = pcmToWav(pcmBuffer, 24000);

    // Upload to Supabase
    const filePath = `voiceovers/${crypto.randomUUID()}.wav`;

    const { error } = await supabase.storage
      .from('audios')
      .upload(filePath, wavBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('audios')
      .getPublicUrl(filePath);

      // Trace logging into opik
  const trace = client.trace({
    name: "convertVoiceoverToPublicUrl",
  input: {
 script,
 voiceName
  },
  output: {response:data.publicUrl},
    metadata:{
      model: "gemini-2.5-flash-preview-tts",
        tokens: {
          inputTokens: response?.usageMetadata?.promptTokenCount,
          outputTokens: response?.usageMetadata?.candidatesTokenCount,
          totalTokens: response?.usageMetadata?.totalTokenCount,
        },
       costs:{
             // Prompt tokens are billed at input rate
        inputCosts: inputCosts,
        // Everything else (Generated Content + Thoughts) is billed at the high output rate for images
        outputCosts: outputCosts,
        totalCosts: totalCost
       }
    }
 
  })
  trace.end()
  client.flush()
    return {url: data.publicUrl, cost: totalCost};
  } catch (err) {
    console.error('convertVoiceoverToPublicUrl error:', err);
    throw new Error(`Failed to generate voiceover: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;

  const wavHeader = Buffer.alloc(44);

  wavHeader.write('RIFF', 0);
  wavHeader.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavHeader.write('WAVE', 8);
  wavHeader.write('fmt ', 12);
  wavHeader.writeUInt32LE(16, 16);
  wavHeader.writeUInt16LE(1, 20); // PCM
  wavHeader.writeUInt16LE(numChannels, 22);
  wavHeader.writeUInt32LE(sampleRate, 24);
  wavHeader.writeUInt32LE(byteRate, 28);
  wavHeader.writeUInt16LE(blockAlign, 32);
  wavHeader.writeUInt16LE(bitsPerSample, 34);
  wavHeader.write('data', 36);
  wavHeader.writeUInt32LE(pcmBuffer.length, 40);

  return Buffer.concat([wavHeader, pcmBuffer])
}


// Define the structured design interface
interface Design {
  concept: {
    title: string;
    vibe: string;
    duration: number;
    imageCount: number;
  };
  voiceover: string;
  segments: Array<{
    imageId: string;
    voSegment: string;
    duration: number;
    animation: string;
  }>;
  timingSummary: {
    durations: number[];
    totalDuration: number;
  };
}

interface DesignWithUrls extends Design {
  voiceoverUrl: string;
  segments: Array<{
    imageId: string;
    voSegment: string;
    duration: number;
    animation: string;
    imageUrl: string;
  }>;
}