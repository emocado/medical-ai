import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, type RateLimitWindow } from "@/lib/rate-limit";

/** Requests per client per minute across all AI-backed API routes. */
const API_REQUESTS_PER_MINUTE = 40;
/** Uploads are base64 JSON; 20 MB comfortably fits a phone photo or multi-page PDF. */
const MAX_BODY_BYTES = 20 * 1024 * 1024;

const windows = new Map<string, RateLimitWindow>();

function clientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0].trim() || req.ip || "local";
}

export function middleware(req: NextRequest) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "This file is too large. Please use a smaller photo or PDF (under 15 MB)." },
      { status: 413 }
    );
  }

  const result = checkRateLimit(windows, clientKey(req), Date.now(), API_REQUESTS_PER_MINUTE, 60_000);
  if (!result.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
