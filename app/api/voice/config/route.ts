import { NextRequest, NextResponse } from "next/server";
import { buildLiveSessionConfig } from "@/lib/voice-session";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, latestReport, knownPills } = body;

    const apiKey =
      process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const config = buildLiveSessionConfig({
      language,
      latestReport,
      knownPills,
    });

    return NextResponse.json({
      apiKey,
      ...config,
    });
  } catch (error: any) {
    console.error("Error in voice config route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to configure voice session." },
      { status: 500 }
    );
  }
}
