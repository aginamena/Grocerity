import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";


const WAHA_URL = "https://api.grocerity.org";
const WAHA_API_KEY = process.env.WAHA_API_KEY ?? "";

export async function GET(request: Request) {
  try {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];

    // 1. Fetch posts scheduled for today
    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .contains("days", [today]);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: `No posts scheduled for ${today}` });
    }

    for (const post of posts) {
      const { selected_groups, general_text, images, session } = post;

      for (const group of selected_groups) {
        const chatId = group.id;
          for (const img of images) {
           await fetch(`${WAHA_URL}/api/sendImage`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Api-Key": WAHA_API_KEY,
              },
              body: JSON.stringify({
                chatId: chatId,
                session: session,
                file: {
                  url: img.url,
                  filename: "image.jpeg",
                  mimetype: "image/jpeg",
                },
                caption:img.caption
              }),
            });
          }

        // 3. Send General Text if provided
        if (general_text) {
          await fetch(`${WAHA_URL}/api/sendText`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: JSON.stringify({
              chatId: chatId,
              text: general_text,
              session: session
            }),
          });
        }
      }
      // 4. Send a single confirmation to the owner after all groups are processed
      try {
        const meRes = await fetch(`${WAHA_URL}/api/sessions/${session}/me`, {
          headers: { "X-Api-Key": WAHA_API_KEY },
        });
        
        if (meRes.ok) {
          const meData = await meRes.json();
          const ownerChatId = meData.id;
          const groupNames = selected_groups.map((g: any) => g.name).join(", ");

          await fetch(`${WAHA_URL}/api/sendText`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Api-Key": WAHA_API_KEY,
            },
            body: JSON.stringify({
              chatId: ownerChatId, 
              text: `✅ Your post has been posted in your selected groups: ${groupNames}!`,
              session: session
            }),
          });
        }
      } catch (confirmError) {
        console.error("Failed to send confirmation to owner:", confirmError);
      }
    }

    return NextResponse.json({ 
      status: "success", 
      day: today, 
      processed_posts: posts.length,
    });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}