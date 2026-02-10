import { NextResponse } from "next/server";
import { 
  AddVoiceoverURLsAndImageURLsToDesign, 
  enhanceAndUploadImages, 
  generateDesign, 
  generateRemotionCode 
} from "./util";
import {Opik} from "opik";


export async function POST(req: Request) {
  const client = new Opik()
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const prompt = formData.get("prompt") as string;
    let totalCost = 0;

    // 1. Generate design directly using raw image data (no upload yet)
    const {design, cost: designCost} = await generateDesign(prompt, files);
    totalCost += designCost;
    // 2. Enhance images based on the design and upload ONLY the cleaned versions
    const {urls: cleanedImageUrls, cost: enhancementCost} = await enhanceAndUploadImages(design, files);
    totalCost += enhancementCost;
    // 3. Map URLs to the design
    const designWithUrls = await AddVoiceoverURLsAndImageURLsToDesign(design, cleanedImageUrls);
    
    // 4. Generate final Remotion code
    const {code: remotionCode, cost: remotionCost} = await generateRemotionCode(designWithUrls);
    totalCost += remotionCost;

      // Trace logging into opik
  const trace = client.trace({
    name: "generateVideo API - Total Cost",
    metadata:{
      totalCost: totalCost.toFixed(4)
    }
 
  })
  trace.end()
  await client.flush()

    return NextResponse.json({
      result: remotionCode,
    });
  } catch (error) {
    console.error("Video Generation Error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error occurred" },
      { status: 500 }
    );
  }
}