import { NextResponse } from "next/server";

const WAHA_URL = "https://34.75.49.98";
const WAHA_API_KEY = "b5d2364e1bcb47268dd820aa076c333f";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  
  try {
    const res = await fetch(`${WAHA_URL}/api/${path}`, {
      headers: { "X-Api-Key": WAHA_API_KEY },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  const body = await request.json();

  try {
    const res = await fetch(`${WAHA_URL}/api/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": WAHA_API_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}