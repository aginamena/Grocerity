import { NextResponse } from "next/server";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Opik } from "opik";
import { generateCode } from "./util"; // Assuming generateCode is exported from util

const genai = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
const client = new Opik();

export async function POST(req: Request) {
  try {
    const { design } = await req.json();

    if (!design) {
      return NextResponse.json({ error: "Design is required" }, { status: 400 });
    }

    const designStr = JSON.stringify(design, null, 2);
    const model = genai.getGenerativeModel({
      model: "gemini-2.0-flash-exp", // Updated to a valid model name or use your specific version
      systemInstruction: generateCode,
    });

    const response = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `Write the remotion code given the design JSON: \n\n ${designStr}` }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            code: {
              type: SchemaType.STRING,
              description: "The complete remotion code implementing the design",
            },
            durationInFrames: {
              type: SchemaType.NUMBER,
              description: "Total duration of the video in frames",
            },
          },
          required: ["code", "durationInFrames"],
        },
      },
    });

    const result = response.response.text();
    const usage = response.response.usageMetadata;

    const inputCosts = ((usage?.promptTokenCount || 0) / 1000000) * 0.3;
    const outputCosts =
      (((usage?.totalTokenCount || 0) - (usage?.promptTokenCount || 0)) / 1000000) * 2.5;
    const totalCost = inputCosts + outputCosts;

    // Trace logging into opik
    const trace = client.trace({
      name: "generateRemotionCode",
      input: {
        design: designStr,
      },
      output: { response: result },
      metadata: {
        model: "gemini-2.0-flash-exp",
        tokens: {
          inputTokens: usage?.promptTokenCount || 0,
          outputTokens: (usage?.totalTokenCount || 0) - (usage?.promptTokenCount || 0),
          totalTokens: usage?.totalTokenCount || 0,
        },
        costs: {
          inputCosts: inputCosts,
          outputCosts: outputCosts,
          totalCosts: totalCost,
        },
      },
    });
    trace.end();
    await client.flush();

    return NextResponse.json({ result, cost: totalCost });
  } catch (error: any) {
    console.error("Error in generateRemotionCode:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate Remotion code" },
      { status: 500 }
    );
  }
}