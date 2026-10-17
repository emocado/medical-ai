import { NextRequest, NextResponse } from "next/server";
import { processVoiceTurn } from "@/lib/voice-session";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audioBase64, mimeType, history, language, latestReport, knownPills, medications } = body;

    if (!audioBase64 || !mimeType) {
      return NextResponse.json(
        { error: "Missing required fields: audioBase64, mimeType" },
        { status: 400 }
      );
    }

    const result = await processVoiceTurn({
      audioBase64,
      mimeType,
      history: Array.isArray(history) ? history : [],
      language: language || "en",
      latestReport,
      medications,
      knownPills,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in voice turn route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process voice message." },
      { status: 500 }
    );
  }
}
