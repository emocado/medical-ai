import { NextRequest, NextResponse } from "next/server";
import { checkMedicationInteractions } from "@/lib/interaction-checker";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const { medications, latestReport, language } = await req.json();

    if (!Array.isArray(medications) || medications.length < 2) {
      return NextResponse.json(
        { error: "At least two medicines are needed for an interaction check." },
        { status: 400 }
      );
    }

    const result = await checkMedicationInteractions({ medications, latestReport, language: language || "en" });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error in medicine interaction route:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check medicine interactions." },
      { status: 500 }
    );
  }
}
