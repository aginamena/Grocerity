import { supabase } from "@/lib/supabase";
import { GoogleGenAI } from "@google/genai";
import { Opik } from "opik";

import { Design, DesignWithUrls } from "../Types";
import { editVideoIntelligence } from "./prompt";

const genai = new GoogleGenAI({});
const client = new Opik();

export async function reEnhanceSpecificImages(
  design: Design, 
  indices: number[], 
  existingUrls: string[], 
  instruction: string
): Promise<string[]> {
  const updatedUrls = [...existingUrls];
  let result = null;

  for (const index of indices) {
    const imageUrl = existingUrls[index];
    const script = design.segments[index]?.voSegment || "";

    try {
      // 1. Fetch current image
      const imgRes = await fetch(imageUrl);
      const buffer = await imgRes.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      // 2. Specialized Edit Command
      result = await genai.models.generateContent({
        model: "gemini-3-pro-image-preview",
        contents: [
          { text: `Modify this image. Task: ${instruction}. Context: This segment says "${script}". Important: Keep the main subject recognizable.` },
          { inlineData: { mimeType: "image/jpeg", data: base64 } }
        ],
        config: {
          systemInstruction: "You are a professional video editor. Clean up, fix lighting, or remove text as instructed while keeping the original product as the star.",
          responseModalities: ['IMAGE'],
          imageConfig: { aspectRatio: "9:16" }
        }
      });

      const imagePart = result.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
      if (imagePart?.inlineData?.data) {
        const cleanedBuffer = Buffer.from(imagePart.inlineData.data, "base64");
        const filePath = `cleaned/edit-${Date.now()}-${index}.jpg`;
        await supabase.storage.from("images").upload(filePath, cleanedBuffer, { contentType: "image/jpeg" });
        const { data } = supabase.storage.from("images").getPublicUrl(filePath);
        updatedUrls[index] = data.publicUrl;
      }
    } catch (e) {
      console.error(`Failed to re-enhance image index ${index}`);
    }
  }

   const inputCosts = ((result?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.3;
  const outputCosts = (((result?.usageMetadata?.totalTokenCount || 0) - (result?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 2.5;
  const totalCost = inputCosts + outputCosts;

  // Trace logging into opik
  const trace = client.trace({
    name: "reEnhanceSpecificImages",
    input: {
      design,
        indices,
        instruction,
        existingUrls
    },
    output: { response: updatedUrls },
    metadata: {
      model: "gemini-3-pro-image-preview",
      tokens: {
        inputTokens: result?.usageMetadata?.promptTokenCount || 0,
        outputTokens: result?.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result?.usageMetadata?.totalTokenCount || 0,
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

  return updatedUrls;
}


/**
 * Intelligent Router for Edits
 * Analyze prompt and decide which parts of the video pipeline to re-run.
 */
export async function getEditActionPlan(currentDesign: DesignWithUrls, editPrompt: string) {
  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `
Current Design JSON:
${JSON.stringify(currentDesign, null, 2)}

User Request:
"${editPrompt}"
`,
    config: {
      systemInstruction: editVideoIntelligence,
      responseMimeType: "application/json",
    },
  });

  const result = JSON.parse(response.text || "{}") as {
    toolsToCall: string[];
    targetImageIndices: number[];
    imageFixInstructions: string;
    updatedDesign?: Design;
  };

     const inputCosts = ((response?.usageMetadata?.promptTokenCount || 0) / 1000000) * 0.3;
  const outputCosts = (((response?.usageMetadata?.totalTokenCount || 0) - (response?.usageMetadata?.promptTokenCount || 0)) / 1000000) * 2.5;
  const totalCost = inputCosts + outputCosts;

  // Trace logging into opik
  const trace = client.trace({
    name: "getEditActionPlan",
    input: {
        currentDesign,
        editPrompt
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
  
  return result 
}