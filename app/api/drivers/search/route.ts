import { NextRequest, NextResponse } from "next/server";
import { searchDrivers } from "@/lib/iracing-api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 },
    );
  }

  try {
    const results = await searchDrivers(q);
    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error("Driver search error:", error);
    return NextResponse.json(
      { error: "Failed to search drivers" },
      { status: 500 },
    );
  }
}
