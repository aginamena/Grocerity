import { NextResponse } from "next/server";
import { AddVoiceoverURLsAndImageURLsToDesign, generateDesign, generateRemotionCode, uploadImages } from "./util";

export async function POST(req: Request) {

  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];
    const imageUrls = await uploadImages(files);

const prompt = `
these are new products that arrived today. create a high-energy video ad concept showcasing these products 
and telling people to visit our store, Toby Authentic Afro-Caribbean foods, at 1339 viking drive ottawa
or call us at 613-733-232
`
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
