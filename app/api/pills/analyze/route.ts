import { NextRequest, NextResponse } from "next/server";
import { analyzePillImage } from "@/lib/pill-analyzer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, latestReport, language, medications } = body;

    if (!imageBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Image data and mimeType are required." },
        { status: 400 }
      );
    }

    const pillRecord = await analyzePillImage({
      imageBase64,
      mimeType,
      latestReport,
      medications,
      language: language || "en",
    });

    return NextResponse.json(pillRecord);
  } catch (error: any) {
    console.error("Error in pill analyze route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze pills." },
      { status: 500 }
    );
  }
}
