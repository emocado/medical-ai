import { NextRequest, NextResponse } from "next/server";
import { processChatMessage } from "@/lib/chat";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, language, latestReport, knownPills } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages array is required." },
        { status: 400 }
      );
    }

    const reply = await processChatMessage({
      messages,
      language: language || "en",
      latestReport,
      knownPills,
    });

    return NextResponse.json({
      role: "assistant",
      content: reply,
    });
  } catch (error: any) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process chat message." },
      { status: 500 }
    );
  }
}
