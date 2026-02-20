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
    if (!tasks || tasks.length === 0) return NextResponse.json({ processed: 0 });

    // 2. Process all tasks in parallel
    await Promise.all(
      tasks.map(async (task) => {
        try {
          const formData = new FormData();
          formData.append("prompt", task.prompt);

          // Download each image in parallel for this specific task
          const imageResults = await Promise.all(
            task.image_urls.map(async (url: string) => {
              try {
                const res = await fetch(url);
                const blob = await res.blob();
                const filename = url.split("/").pop() || "image.jpg";
                return { blob, filename };
              } catch (err) {
                console.error(`Failed image download: ${url}`, err);
                return null;
              }
            })
          );

          // Append successfully downloaded images
          imageResults.forEach((img) => {
            if (img) {
              formData.append("images", img.blob, img.filename);
            }
          });

          // Trigger the generation API
          const response = await fetch(`${process.env.BASE_URL}/api/generateVideo`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`Generation API returned ${response.status}`);
          }
        } catch (taskError) {
          // Log individual task failure but don't stop the whole process
          console.error(`Error processing task for ${task.email}:`, taskError);
        }
      })
    );

    return NextResponse.json({ processed: tasks.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}