import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { session, selectedGroups, images, generalText, selectedDays } = body;

    const uploadedImages = [];

    // 1. Upload each image to Supabase Storage
    for (const img of images) {
      const fileName = `${Date.now()}-${img.id}.jpg`;
      const imageBuffer = Buffer.from(img.base64, "base64");

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post_images")
        .upload(fileName, imageBuffer, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("post_images")
        .getPublicUrl(fileName);

      uploadedImages.push({
        url: urlData.publicUrl,
        caption: img.caption,
      });
    }

    // 3. Insert into DB with Public URLs instead of Base64
    const { data, error } = await supabase.from("posts").insert([
      {
        session,
        selected_groups: selectedGroups,
        images: uploadedImages, // Array of {url, caption}
        general_text: generalText,
        days: selectedDays,
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ message: "Post scheduled successfully", data });
  } catch (error: any) {
    console.error("Storage/DB Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}