import { describe, it, expect } from "vitest";
import {
  computeRms,
  createSilenceDetector,
  downsample,
  encodeWav,
  mergeChunks,
} from "@/lib/audio-capture";

describe("Audio capture helpers", () => {
  it("encodes a valid mono 16-bit WAV header", () => {
    const wav = encodeWav(new Float32Array([0, 0.5, -0.5, 1]), 16000);
    const view = new DataView(wav.buffer);
    const ascii = (o: number) => String.fromCharCode(...Array.from(wav.slice(o, o + 4)));

    expect(ascii(0)).toBe("RIFF");
    expect(ascii(8)).toBe("WAVE");
    expect(ascii(36)).toBe("data");
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(40, true)).toBe(8); // 4 samples * 2 bytes
    expect(view.getInt16(44 + 6, true)).toBe(0x7fff); // full-scale sample clipped correctly
    expect(wav.length).toBe(52);
  });

  it("downsamples 48 kHz audio to 16 kHz by averaging", () => {
    const input = new Float32Array([0.3, 0.3, 0.3, 0.6, 0.6, 0.6]);
    const out = downsample(input, 48000, 16000);
    expect(out.length).toBe(2);
    expect(out[0]).toBeCloseTo(0.3);
    expect(out[1]).toBeCloseTo(0.6);
  });

  it("merges chunks in order and measures loudness", () => {
    const merged = mergeChunks([new Float32Array([1, 2]), new Float32Array([3])]);
    expect(Array.from(merged)).toEqual([1, 2, 3]);
    expect(computeRms(new Float32Array([0.5, -0.5]))).toBeCloseTo(0.5);
    expect(computeRms(new Float32Array([]))).toBe(0);
  });

  describe("silence detector", () => {
    it("ends the turn after trailing silence following speech", () => {
      const d = createSilenceDetector({ trailingSilenceMs: 1000 });
      expect(d.update(0.001, 0)).toBe("continue");
      expect(d.update(0.2, 500)).toBe("continue");
      expect(d.update(0.001, 1200)).toBe("continue");
      expect(d.update(0.001, 1600)).toBe("end-turn");
    });

    it("reports no speech when nobody talks before the timeout", () => {
      const d = createSilenceDetector({ noSpeechTimeoutMs: 3000 });
      expect(d.update(0.001, 2000)).toBe("continue");
      expect(d.update(0.001, 3100)).toBe("no-speech");
      expect(d.heardSpeech).toBe(false);
    });

    it("caps very long turns", () => {
      const d = createSilenceDetector({ maxTurnMs: 5000 });
      d.update(0.3, 100);
      expect(d.update(0.3, 5000)).toBe("end-turn");
    });
  });
});
