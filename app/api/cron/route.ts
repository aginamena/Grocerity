import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

const WAHA_URL = "https://api.grocerity.org";
const WAHA_API_KEY = process.env.WAHA_API_KEY ?? "";

export async function GET(request: Request) {
  try {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = days[new Date().getDay()];

    const { data: posts, error } = await supabase
      .from("posts")
      .select("*")
      .contains("days", [today]);

    if (error) throw error;
    if (!posts || posts.length === 0) {
      return NextResponse.json({ message: `No posts scheduled for ${today}` });
    }

    // Map to store unique sessions and the count of unique groups processed for each
    const sessionGroupCounts = new Map<string, Set<string>>();

    // 1. Process all posts
    for (const post of posts) {
      const { selected_groups, general_text, images, session } = post;

      if (!sessionGroupCounts.has(session)) {
        sessionGroupCounts.set(session, new Set());
      }

      for (const group of selected_groups) {
        const chatId = group.id;
        sessionGroupCounts.get(session)?.add(chatId);
        
        // Send images
        for (const img of images) {
          await fetch(`${WAHA_URL}/api/sendImage`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
            body: JSON.stringify({
              chatId: chatId,
              session: session,
              file: { url: img.url, filename: "image.jpeg", mimetype: "image/jpeg" },
              caption: img.caption
            }),
          });
        }

        // Send General Text if provided
        if (general_text) {
          await fetch(`${WAHA_URL}/api/sendText`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
            body: JSON.stringify({ chatId: chatId, text: general_text, session: session }),
          });
        }
      }
    }

    // 2. Notify each owner once per session
    for (const [session, groupIds] of sessionGroupCounts.entries()) {
      try {
        const meRes = await fetch(`${WAHA_URL}/api/sessions/${session}/me`, {
          headers: { "X-Api-Key": WAHA_API_KEY },
        });
        
        if (meRes.ok) {
          const meData = await meRes.json();
          await fetch(`${WAHA_URL}/api/sendText`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "X-Api-Key": WAHA_API_KEY },
            body: JSON.stringify({
              chatId: meData.id, 
              text: `✅ Your posts for today have been successfully sent to ${groupIds.size} groups.`,
              session: session
            }),
          });
        }
      } catch (confirmError) {
        console.error(`Failed to notify owner for session ${session}:`, confirmError);
      }
    }

    return NextResponse.json({ status: "success", day: today, processed_posts: posts.length });

  } catch (error: any) {
    console.error("Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}