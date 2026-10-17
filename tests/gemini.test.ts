import { describe, it, expect } from "vitest";
import { getGeminiClient, GEMINI_FLASH_MODEL } from "@/lib/gemini";

describe("Gemini Client Wrapper", () => {
  it("initializes client when the OpenCode API key is set", () => {
    process.env.OPENCODE_API_KEY = "test-api-key";
    const client = getGeminiClient();
    expect(client).toBeDefined();
    expect(GEMINI_FLASH_MODEL).toBeDefined();
  });

  it("throws error when the OpenCode API key is missing", () => {
    const originalKey = process.env.OPENCODE_API_KEY;
    delete process.env.OPENCODE_API_KEY;

    expect(() => getGeminiClient()).toThrow(/OPENCODE_API_KEY/);

    if (originalKey) {
      process.env.OPENCODE_API_KEY = originalKey;
    }
  });

  it("ignores a leftover GEMINI_API_KEY so requests never go to Google directly", () => {
    const originalKey = process.env.OPENCODE_API_KEY;
    delete process.env.OPENCODE_API_KEY;
    process.env.GEMINI_API_KEY = "legacy-key";

    expect(() => getGeminiClient()).toThrow(/OPENCODE_API_KEY/);

    delete process.env.GEMINI_API_KEY;
    if (originalKey) {
      process.env.OPENCODE_API_KEY = originalKey;
    }
  });
});
