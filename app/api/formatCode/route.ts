import { NextResponse } from "next/server";
import prettier from "prettier";

export async function POST(req: Request) {
  const { code } = await req.json();

  try {
    const formatted = await prettier.format(code, {
      parser: "babel-ts",
      filepath: "dynamic-animation.tsx", // enables config + JSX heuristics
      semi: true,
      trailingComma: "none",
      printWidth: 90,
    });

    return NextResponse.json({ formatted });
  } catch {
    return NextResponse.json({ formatted: code });
  }
}