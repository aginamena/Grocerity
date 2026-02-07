import { NextResponse } from "next/server";
import { AddVoiceoverURLsAndImageURLsToDesign, generateDesign, generateRemotionCode, uploadImages } from "./util";

export async function POST(req: Request) {

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const prompt = formData.get("prompt") as string;

    const imageUrls = await uploadImages(files);
    
const design = await generateDesign(prompt, imageUrls)
const designWithUrls = await AddVoiceoverURLsAndImageURLsToDesign(design, imageUrls)
const remotionCode = await generateRemotionCode(designWithUrls)

  return NextResponse.json({
    result: remotionCode,
  })
  } catch (error) {
    
    return NextResponse.json(
      { error: (error as Error).message || "Unknown error occurred" },
      { status: 500 }
    );

  }
}
