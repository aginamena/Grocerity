import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = days[new Date().getDay()];

  try {
    // 1. Fetch all scheduled videos for today
    const { data: tasks, error } = await supabase
      .from("scheduled_videos")
      .select("*")
      .eq("day_of_week", currentDay);

    if (error) throw error;

    // 2. Process each task (In a real app, you might use a queue or background worker)
    for (const task of tasks) {
      const formData = new FormData();
      formData.append("prompt", task.prompt);
      // formData.append("email", task.email);
      // formData.append("day", task.day_of_week);

      // Download each image and append as a file
      for (const url of task.image_urls) {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const filename = url.split("/").pop() || "image.jpg";
          formData.append("images", blob, filename);
        } catch (downloadError) {
          console.error(`Failed to download image: ${url}`, downloadError);
        }
      }

      await fetch(`${process.env.BASE_URL}/api/generateVideo`, {
        method: "POST",
        body: formData,
      });
    }

    return NextResponse.json({ processed: tasks.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}