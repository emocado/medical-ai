import { NextRequest, NextResponse } from "next/server";
import { compareReportsWithGemini } from "@/lib/delta-comparator";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reportA, reportB, language } = body;

    if (!reportA || !reportB) {
      return NextResponse.json(
        { error: "Both reportA and reportB are required for comparison." },
        { status: 400 }
      );
    }

    const deltaResult = await compareReportsWithGemini({
      reportA,
      reportB,
      language: language || "en",
    });

    return NextResponse.json(deltaResult);
  } catch (error: any) {
    console.error("Error comparing reports:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare reports." },
      { status: 500 }
    );
  }
}
