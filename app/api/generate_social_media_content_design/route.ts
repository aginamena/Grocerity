import { generateText, tool, experimental_generateSpeech as generateSpeech } from "ai";
import { prompt5 } from "@/app/prompt";
import { openai } from "@ai-sdk/openai";
import { NextResponse } from "next/server";
import { z } from "zod";
import { supabase } from "@/lib/supabase";



async function convertVoiceoverToPublicUrl(script: string, voiceName: string = 'alloy'): Promise<string> {
  try {
    // Generate speech using Vercel AI SDK
    const speechStream = await generateSpeech({
      model: openai.speech('tts-1'),
      text: script,
      voice: voiceName,
    });

    // Convert stream to buffer
    const chunks: Buffer[] = [];
    for await (const chunk of speechStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    // Upload to Supabase
    const filePath = `voiceovers/${crypto.randomUUID()}.wav`;

    const { error } = await supabase.storage
      .from('audio')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (err) {
    throw new Error(`Failed to generate voiceover: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

export async function POST(req: Request) {
    const {imageUrls} = await req.json()

  const prompt = `
Given the attached image(s), create a high-energy video advertising my products.
Return a clear visual design concept that can be converted into Remotion code.
`;

  const {text} = await generateText({
    model: "google/gemini-2.5-pro",
    system: prompt5,
          tools: {
        generateSceneVoiceover: tool({
          description: "Get the public url of a voice over script.",
          parameters: z.object({
            sceneScript: z.string().describe("The voiceover script for the scene"),
            voiceName: z.string().optional().describe("Voice name (e.g., 'Kore', 'Aoede')"),
          }),
          execute: async ({ sceneScript, voiceName = 'Kore' }: { sceneScript: string; voiceName?: string }) => {
            const voiceoverUrl = await convertVoiceoverToPublicUrl(sceneScript, voiceName);
            return {
              success: true,
              voiceoverUrl,
              message: `Voiceover generated and saved: ${voiceoverUrl}`,
            };
          },
        }),
      },
    messages: [
      {
        role: "user",
        content: [
          ...imageUrls.map((imageUrl: string) => ({
            type: "image",
            image:imageUrl
          })),
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  return NextResponse.json({
    design: text,
  })
}
