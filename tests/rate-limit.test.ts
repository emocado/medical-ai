import { describe, it, expect } from "vitest";
import { checkRateLimit, type RateLimitWindow } from "@/lib/rate-limit";

describe("API rate limiter", () => {
  it("allows requests up to the limit then blocks with a retry hint", () => {
    const store = new Map<string, RateLimitWindow>();
    expect(checkRateLimit(store, "a", 0, 2, 60_000).allowed).toBe(true);
    expect(checkRateLimit(store, "a", 1000, 2, 60_000).allowed).toBe(true);

    const blocked = checkRateLimit(store, "a", 2000, 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(58);
  });

  it("tracks clients independently and resets after the window", () => {
    const store = new Map<string, RateLimitWindow>();
    checkRateLimit(store, "a", 0, 1, 60_000);
    expect(checkRateLimit(store, "b", 0, 1, 60_000).allowed).toBe(true);
    expect(checkRateLimit(store, "a", 10, 1, 60_000).allowed).toBe(false);
    expect(checkRateLimit(store, "a", 60_000, 1, 60_000).allowed).toBe(true);
  });
});
