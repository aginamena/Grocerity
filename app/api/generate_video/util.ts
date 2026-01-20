import { generateText, ToolLoopAgent, tool, Output } from "ai";
import { generateCode, generateScript } from "./promts";
import { supabase } from "@/lib/supabase";
import { GoogleGenAI } from '@google/genai';
import { z } from "zod";

export async function generateRemotionCode(design: string) {
    const {text} = await generateText({
        model: "google/gemini-2.5-pro",
        system: generateCode,
        output: Output.object({
          schema: z.object({
                     code: z.string().describe("The complete remotion code implementing the design"),
            durationInFrames: z.number().describe("Total duration of the video in frames"),
            fps: z.number().describe("Frames per second of the video"),
          
        })
        }),
        prompt: `Write the remotion code given the design: \n\n ${design}`,
    })
    return text;
}

export async function AddVoiceoverURLsAndImageURLsToDesign(design: string, imageUrls: string[]) {
      const agent = new ToolLoopAgent({
        model: "google/gemini-2.5-pro",
        tools: {
            convertVoiceoverToPublicUrl: tool({
              description: "Get the public url of a voiceover script.",
              inputSchema: z.object({
                sceneScript: z.string().describe("The voiceover script for the scene"),
                voiceName: z.string().optional().describe("Voice name (e.g., 'Kore', 'Aoede')"),
              }),
              execute: async ({ sceneScript, voiceName = 'Kore' }: { sceneScript: string; voiceName?: string }) => {
                const voiceoverUrl = await convertVoiceoverToPublicUrl(sceneScript, voiceName);
                return {
           
                  voiceoverUrl,
            
                };
              },
            }),
          },
      })
    const {text} = await agent.generate({
      prompt : `
      You are given:
    - A design script that may contain one or more voiceover scripts
    - An array of image URLs
    
    Your task is to:
    1. Identify every voiceover script in the design.
    2. For each voiceover script, call the tool convertVoiceoverToPublicUrl using the script text to generate a public voiceover URL.
    3. Add the generated public voiceover URL directly next to the corresponding voiceover script.
    4. Add the correct image URL directly next to each image reference in the design.
    
    Image URL mapping rules:
    - The first URL in the image URL array corresponds to Image 1.
    - The second URL corresponds to Image 2.
    - The third URL corresponds to Image 3.
    - Continue this pattern for all images.
    
    Output requirements:
    - Return the complete design script.
    - Each voiceover script must include its public voiceover URL.
    - Each image reference must include its image URL.
    - Preserve the original wording and structure of the design as much as possible, only adding URLs where required.
    
    Formatting example:
    
    Store Images:
    Image 1: Shelf with porridge, beans, and grains.
    [Image URL: https://...]
    
    Voiceover Script (Text):
    (0.5s–2.8s) "Looking to restock your pantry?"
    [Voiceover URL: https://...]
    
    Inputs:
    - Design script:
      ${design}
    
    - Image URLs:
      ${imageUrls.join(", ")}
      `
    });
    return text;
}

export async function generateDesign(prompt:string, imageUrls:string[]) {
      const {text} = await generateText({
        model: "google/gemini-2.5-pro",
        system: generateScript,
        messages: [
          {
            role: "user",
            content: [
              ...imageUrls.map((imageUrl: string) => ({
                type: "image" as const,
                image: imageUrl
              })),
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      });
        return text;
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
    const ai = new GoogleGenAI({});
    const response = await ai.models.generateContent({
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

  return Buffer.concat([wavHeader, pcmBuffer]);
}