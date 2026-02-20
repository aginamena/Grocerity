import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const email = formData.get("email") as string;
    const days = formData.getAll("days") as string[];

    // 1. Process all selected days in parallel
    await Promise.all(
      days.map(async (day) => {
        const prompt = formData.get(`prompt_${day}`) as string;
        const images = formData.getAll(`images_${day}`) as File[];

        // 2. Upload all images for this specific day in parallel
        const imageUrls = await Promise.all(
          images.map(async (image) => {
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${image.name}`;
            const { data, error } = await supabase.storage
              .from("images")
              .upload(`${email}/${day}/${fileName}`, image);

            if (error) throw error;
            
            const { data: { publicUrl } } = supabase.storage
              .from("images")
              .getPublicUrl(data.path);
              
            return publicUrl;
          })
        );

        // 3. Save the day's config to the database
        const { error: dbError } = await supabase
          .from("scheduled_videos")
          .insert({
            email,
            day_of_week: day,
            prompt,
            image_urls: imageUrls,
          });

        if (dbError) throw dbError;
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Schedule Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}