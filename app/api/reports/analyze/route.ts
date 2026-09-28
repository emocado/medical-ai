import { NextRequest, NextResponse } from "next/server";
import { analyzeReportWithGemini } from "@/lib/report-analyzer";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileBase64, mimeType, fileName } = body;

    if (!fileBase64 || !mimeType || !fileName) {
      return NextResponse.json(
        { error: "Missing required fields: fileBase64, mimeType, fileName" },
        { status: 400 }
      );
    }

    const reportRecord = await analyzeReportWithGemini({
      fileBase64,
      mimeType,
      fileName,
    });

    return NextResponse.json(reportRecord);
  } catch (error: any) {
    console.error("Error analyzing medical report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze report" },
      { status: 500 }
    );
  }
}
