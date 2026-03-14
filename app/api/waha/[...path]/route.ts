import { NextResponse } from "next/server";

const WAHA_URL = "https://api.grocerity.org";
const WAHA_API_KEY = process.env.WAHA_API_KEY;

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;

  try {
    const res = await fetch(`${WAHA_URL}/api/${path.join('/')}`, {
      headers: { 
        "X-Api-Key": WAHA_API_KEY, 
         "accept": "application/json",
       },
    });
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const body = await request.json();

  try {
    const res = await fetch(`${WAHA_URL}/api/${path.join('/')}`, {
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