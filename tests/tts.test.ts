import { describe, it, expect, vi } from "vitest";
import { getTtsVoice, synthesizeSpeech } from "@/lib/tts";
import type { Language } from "@/types";

describe("Text-to-Speech Helper", () => {
  it("returns correct Neural2 / Wavenet voice configuration for each language", () => {
    const enVoice = getTtsVoice("en");
    expect(enVoice.languageCode).toBe("en-US");
    expect(enVoice.name).toContain("Neural2");

    const bmVoice = getTtsVoice("bm");
    expect(bmVoice.languageCode).toBe("ms-MY");
    expect(bmVoice.name).toContain("Wavenet");

    const zhVoice = getTtsVoice("zh");
    expect(zhVoice.languageCode).toBe("cmn-CN");
    expect(zhVoice.name).toContain("Wavenet");

    const taVoice = getTtsVoice("ta");
    expect(taVoice.languageCode).toBe("ta-IN");
    expect(taVoice.name).toContain("Wavenet");
  });

  it("handles synthesize speech call with audio content buffer", async () => {
    const mockClient = {
      synthesizeSpeech: vi.fn().mockResolvedValue([
        {
          audioContent: Buffer.from("mock-audio-bytes"),
        },
      ]),
    };

    const audioBuffer = await synthesizeSpeech(
      { text: "Test summary", language: "en" },
      mockClient as any
    );

    expect(mockClient.synthesizeSpeech).toHaveBeenCalledTimes(1);
    expect(audioBuffer).toBeDefined();
    expect(Buffer.isBuffer(audioBuffer)).toBe(true);
  });
});
