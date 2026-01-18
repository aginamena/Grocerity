import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { ToolLoopAgent, stepCountIs, tool } from "ai";
import { z } from "zod";
// ---- Supabase client ----
const supabase = createClient(
  "https://vxfpglnrdktcbfmitjqk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4ZnBnbG5yZGt0Y2JmbWl0anFrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODY2MzE4MSwiZXhwIjoyMDg0MjM5MTgxfQ.VeQDuKlg1SEE5JAUHvI8bE3R4TkloPmiCasffNzJbIs"
);

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


export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text' },
        { status: 400 }
      );
    }

    // ---- Gemini TTS ----
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-tts',
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
            
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
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

    // ---- Upload to Supabase ----
    const filePath = `tts/${crypto.randomUUID()}.wav`;

    const { error } = await supabase.storage
      .from('audio')
      .upload(filePath, wavBuffer, {
        contentType: 'audio/wav',
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from('audio')
      .getPublicUrl(filePath);

    return NextResponse.json({
      url: data.publicUrl,
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 }
    );
  }
}
