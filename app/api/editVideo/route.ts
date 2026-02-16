import { NextResponse } from "next/server";
import { Opik } from "opik";

import { convertVoiceoverToPublicUrl, generateRemotionCode } from "../generateVideo/util";
import { DesignWithUrls } from "../Types";
import { getEditActionPlan, reEnhanceSpecificImages } from "./util";

export async function POST(req: Request) {
  const client = new Opik();
  try {
    const { design: currentDesign, editPrompt } = await req.json();
    let designState: DesignWithUrls = JSON.parse(JSON.stringify(currentDesign));
    let totalCost = 0;

    // 1. Ask AI to decide which tools to run
    const plan = await getEditActionPlan(currentDesign, editPrompt);
    const { toolsToCall, targetImageIndices, imageFixInstructions, updatedDesign } = plan;

    // 2. Tool: updateDesign
    if (toolsToCall.includes("updateDesign") && updatedDesign) {
      // Merge updated fields while preserving URLs
      designState = {
        ...designState,
        ...updatedDesign,
        voiceoverUrl: designState.voiceoverUrl, // keep old url until re-generated
        segments: designState.segments.map((s, i) => ({
          ...updatedDesign.segments[i],
          imageUrl: s.imageUrl // preserve existing image URLs
        }))
      };
    }
    
    // 3. Tool: fixVisuals
    if (toolsToCall.includes("fixVisuals")) {
      const indices = targetImageIndices.includes(-1) 
        ? designState.segments.map((_, i) => i) 
        : targetImageIndices;
      
      const existingUrls = designState.segments.map(s => s.imageUrl);
      // Calls Gemini to re-process the images using their public URLs
      const newUrls = await reEnhanceSpecificImages(designState, indices, existingUrls, imageFixInstructions);
      
      designState.segments = designState.segments.map((s, i) => ({
        ...s,
        imageUrl: newUrls[i] || s.imageUrl
      }));
    }
    // 4. Tool: reGenerateVO
    if (toolsToCall.includes("reGenerateVO")) {
      const { url: newVoUrl, cost: voCost } = await convertVoiceoverToPublicUrl(designState.voiceover);
      designState.voiceoverUrl = newVoUrl;
      totalCost += voCost;
    }

    // 5. Final Step: Generate the code for the modified design
    const { code: remotionResult, cost: remotionCost } = await generateRemotionCode(designState);
    totalCost += remotionCost;

  const trace = client.trace({
    name: "EditVideo API - Total Cost",
    metadata:{
      totalCost: totalCost.toFixed(4)
    }
 
  })
  trace.end()
  client.flush()
        return NextResponse.json({
      result: remotionResult,
    design: designState,
    });
  } catch (error) {
    console.error("Video Edit Error:", error);
    return NextResponse.json({ error: "Failed to edit video" }, { status: 500 });
  }
}