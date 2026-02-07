import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { fixCodePrompt } from "./promts";
import { Opik } from "opik";

const client = new Opik();
const genai = new GoogleGenAI({});

export async function POST(req: Request) {
  try {
    const { code, error } = await req.json();

    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Code to fix:\n${code}\n\nError:\n${error}`,
      config: {
        systemInstruction: fixCodePrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            code: {
              type: Type.STRING,
              description: "The complete remotion code implementing the design to fix",
            },
            explanation: {
              type: Type.STRING,
              description: "Brief explanation of what was fixed",
            },
          },
          required: ["code", "explanation"],
        },
      },
    });

    const result = response.text;

    // Trace logging into opik
    const trace = client.trace({
      name: "FixRemotionCode",
      input: {
        code,
        error,
      },
      output: { response: result },
      metadata: { model: "gemini-2.5-flash" },
    });
    trace.end();
    await client.flush();

    return NextResponse.json({
      result,
    });
  } catch (err) {
    console.error("Fix API Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error occurred" },
      { status: 500 }
    );
  }
}