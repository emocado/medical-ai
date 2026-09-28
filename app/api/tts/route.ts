import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/tts";
import type { Language } from "@/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: "Text is required for TTS synthesis." },
        { status: 400 }
      );
    }

    const lang: Language = ["en", "bm", "zh", "ta"].includes(language)
      ? language
      : "en";

    const audioBuffer = await synthesizeSpeech({ text, language: lang });

    return new Response(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Error in TTS route:", error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Could not generate speech audio. Please verify Google Cloud TTS credentials.",
      },
      { status: 500 }
    );
  }
}
