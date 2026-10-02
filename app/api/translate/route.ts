import { NextRequest, NextResponse } from "next/server";
import { translateContent } from "@/lib/translate";

export const maxDuration = 60;

const LANGUAGES = ["en", "bm", "zh", "ta"];
const MAX_CONTENT_CHARS = 100_000;

export async function POST(req: NextRequest) {
  try {
    const { content, targetLanguage } = await req.json();

    if (!content || typeof content !== "object" || !LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json(
        { error: "Required: content (object or array) and a supported targetLanguage." },
        { status: 400 }
      );
    }
    if (JSON.stringify(content).length > MAX_CONTENT_CHARS) {
      return NextResponse.json({ error: "Content is too long to translate." }, { status: 413 });
    }

    const translated = await translateContent(content, targetLanguage);
    return NextResponse.json({ content: translated });
  } catch (error: any) {
    console.error("Error in translate route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to translate." },
      { status: 500 }
    );
  }
}
