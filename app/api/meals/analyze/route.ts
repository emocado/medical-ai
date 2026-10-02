import { NextRequest, NextResponse } from "next/server";
import { analyzeMealWithGemini } from "@/lib/meal-advisor";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      inputType,
      imageBase64,
      mimeType,
      textInput,
      latestReport,
      medications,
      knownPills,
      language,
    } = body;

    if (inputType === "photo" && !imageBase64) {
      return NextResponse.json(
        { error: "Image data is required for photo meal analysis." },
        { status: 400 }
      );
    }

    if (inputType === "text" && (!textInput || !textInput.trim())) {
      return NextResponse.json(
        { error: "Text description is required for typed meal analysis." },
        { status: 400 }
      );
    }

    const mealRecord = await analyzeMealWithGemini({
      inputType,
      imageBase64,
      mimeType,
      textInput,
      latestReport,
      medications,
      knownPills,
      language: language || "en",
    });

    return NextResponse.json(mealRecord);
  } catch (error: any) {
    console.error("Error in meal analyze route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze meal." },
      { status: 500 }
    );
  }
}
