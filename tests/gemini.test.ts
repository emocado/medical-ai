import { describe, it, expect } from "vitest";
import { getGeminiClient, GEMINI_FLASH_MODEL } from "@/lib/gemini";

describe("Gemini Client Wrapper", () => {
  it("initializes client when API key is set", () => {
    process.env.GEMINI_API_KEY = "test-api-key";
    const client = getGeminiClient();
    expect(client).toBeDefined();
    expect(GEMINI_FLASH_MODEL).toBeDefined();
  });

  it("throws error when API key is missing", () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.NEXT_PUBLIC_GEMINI_API_KEY;

    expect(() => getGeminiClient()).toThrow(/GEMINI_API_KEY/);

    if (originalKey) {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });
});
