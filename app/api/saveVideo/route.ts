import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";


export async function POST(req: Request) {
  try {
    const { design, code, durationInFrames } = await req.json();
    const { error } = await supabase
      .from("created_videos")
      .insert({
        email: "agian@example.com",
        design,
        code,
        durationInFrames,
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}