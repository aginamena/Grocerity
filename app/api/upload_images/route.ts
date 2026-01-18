import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No images provided" },
        { status: 400 }
      );
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExtension = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExtension}`;
      const filePath = `images/${fileName}`;

      const buffer = await file.arrayBuffer();

      const { data, error } = await supabase.storage
        .from("images")
        .upload(filePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}` },
          { status: 500 }
        );
      }

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("images")
        .getPublicUrl(filePath);

      uploadedUrls.push(publicUrl.publicUrl);
    }

    return NextResponse.json({ imageUrls: uploadedUrls });
  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}