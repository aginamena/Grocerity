import { GoogleGenAI, Type } from "@google/genai";
import { generateCode, generateScript } from "./promts";
import { supabase } from "@/lib/supabase";
import {Opik} from "opik";

const genai = new GoogleGenAI({});
const client = new Opik()

export async function generateRemotionCode(design: string) {
    const response = await genai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Write the remotion code given the design: \n\n ${design}`,
        config: {
            systemInstruction: generateCode,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    code: { type: Type.STRING, description: "The complete remotion code implementing the design" },
                    durationInFrames: { type: Type.NUMBER, description: "Total duration of the video in frames" },
                },
                required: ["code", "durationInFrames"],
            },
        },
    });
    const result = response.text;
      // Trace logging into opik
  const trace = client.trace({
    name: "generateRemotionCode",
  input: {
    design,
  },
  output: {response:result},
  metadata:{model: "gemini-3-flash-preview"}
  })
  trace.end()
  await client.flush()
    return result
}

export async function AddVoiceoverURLsAndImageURLsToDesign(
  design: string,
  imageUrls: string[]
) {
  const convertVoiceoverTool = {
    name: "convertVoiceoverToPublicUrl",
    description: "Get the public url of a voiceover script.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        sceneScript: {
          type: Type.STRING,
          description: "The voiceover script for the scene",
        },
        voiceName: {
          type: Type.STRING,
          description:
            "Voice name (e.g. kore)",
        },
      },
      required: ["sceneScript"],
    },
  };

  const prompt = `
You are given:
- A design script that will contain one voiceover script
- An array of image URLs

Your task is to:
1. Identify the voiceover script in the design.
2. Call the tool convertVoiceoverToPublicUrl using the script text to generate a public voiceover URL.
3. Add the generated public voiceover URL directly next to the corresponding voiceover script.
4. Add the correct image URL directly next to each image reference in the design.

Image URL mapping rules:
- The first URL in the image URL array corresponds to Image 1.
- The second URL corresponds to Image 2.
- The third URL corresponds to Image 3.

Output requirements:
- Return the complete design script.
- Preserve wording and structure; only add URLs.

Inputs:
Design script:
${design}

Image URLs:
${imageUrls.join(", ")}
`;

  const chat = genai.chats.create({
    model: "gemini-3-flash-preview",
    config:{
    tools: [
      {
        functionDeclarations: [convertVoiceoverTool],
      },
    ],
    }

  });

  let response = await chat.sendMessage({ message: prompt });

  while (response.functionCalls?.length) {
    const toolResponses = [];

    for (const call of response.functionCalls) {
      if (call.name === "convertVoiceoverToPublicUrl") {
        const { sceneScript, voiceName } = call.args as {
          sceneScript: string;
          voiceName?: string;
        };

        const voiceoverUrl = await convertVoiceoverToPublicUrl(
          sceneScript,
          voiceName ?? "kore"
        );

        toolResponses.push({
          functionResponse: {
            name: call.name,
            response: {
              voiceoverUrl,
            },
          },
        });
      }
    }

    response = await chat.sendMessage({ message: toolResponses });
  }
  const result = response.text ?? "";

  // Trace logging into opik
  const trace = client.trace({
    name: "AddVoiceoverURLsAndImageURLsToDesign",
  input: {
    design,
    imageUrls
  },
  output: {response:result},
    metadata:{model: "gemini-3-flash-preview"}
  })
  trace.end()
  await client.flush()

  return result;
}

export async function generateDesign(prompt: string, imageUrls: string[]) {
      const response = await genai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            {
                role: "user",
                parts: [
                    ...imageUrls.map((imageUrl: string) => ({
                        fileData: {
                            fileUri: imageUrl,
                        },
                    })),
                    { text: prompt },
                ],
            },
        ],
        config: {
            systemInstruction: generateScript,
        },
    });
    const result =  response.text || ""
      // Trace logging into opik
  const trace = client.trace({
    name: "generateDesign",
  input: {
    prompt,
    imageUrls
  },
  output: {response:result},
    metadata:{model: "gemini-3-flash-preview"}
  })
  trace.end()
  await client.flush()

    return result
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

async function convertVoiceoverToPublicUrl(script: string, voiceName: string = 'Kore'): Promise<string> {
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

    return data.publicUrl;
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