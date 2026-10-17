/**
 * Pure helpers for turning microphone samples into a WAV clip and deciding
 * when the patient has finished speaking. Kept free of browser APIs so they
 * can be unit tested.
 */

export const VOICE_SAMPLE_RATE = 16000;

export function computeRms(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

/** Averages input samples down to `outRate`. Returns the input when rates match. */
export function downsample(samples: Float32Array, inRate: number, outRate: number): Float32Array {
  if (outRate >= inRate) return samples;
  const ratio = inRate / outRate;
  const outLength = Math.floor(samples.length / ratio);
  const out = new Float32Array(outLength);
  for (let i = 0; i < outLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(samples.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += samples[j];
    out[i] = end > start ? sum / (end - start) : 0;
  }
  return out;
}

export function mergeChunks(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

/** Encodes mono float samples as a 16-bit PCM WAV file. */
export function encodeWav(samples: Float32Array, sampleRate: number): Uint8Array {
  const dataBytes = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const writeAscii = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
  };

  writeAscii(0, "RIFF");
  view.setUint32(4, 36 + dataBytes, true);
  writeAscii(8, "WAVE");
  writeAscii(12, "fmt ");
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  writeAscii(36, "data");
  view.setUint32(40, dataBytes, true);

  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Uint8Array(buffer);
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

export interface SilenceDetectorOptions {
  /** RMS level above which a frame counts as speech. */
  speechThreshold?: number;
  /** How long the patient must be quiet after speaking before the turn ends. */
  trailingSilenceMs?: number;
  /** Give up if nobody speaks within this long. */
  noSpeechTimeoutMs?: number;
  /** Hard cap on a single turn. */
  maxTurnMs?: number;
}

export type SilenceDecision = "continue" | "end-turn" | "no-speech";

/**
 * Feed it one RMS level per audio frame along with the elapsed time; it tells
 * the caller when the spoken turn is over.
 */
export function createSilenceDetector(opts: SilenceDetectorOptions = {}) {
  const speechThreshold = opts.speechThreshold ?? 0.02;
  const trailingSilenceMs = opts.trailingSilenceMs ?? 1400;
  const noSpeechTimeoutMs = opts.noSpeechTimeoutMs ?? 10000;
  const maxTurnMs = opts.maxTurnMs ?? 30000;

  let heardSpeech = false;
  let lastSpeechAt = 0;

  return {
    get heardSpeech() {
      return heardSpeech;
    },
    update(level: number, elapsedMs: number): SilenceDecision {
      if (level >= speechThreshold) {
        heardSpeech = true;
        lastSpeechAt = elapsedMs;
      }
      if (elapsedMs >= maxTurnMs) return heardSpeech ? "end-turn" : "no-speech";
      if (!heardSpeech) return elapsedMs >= noSpeechTimeoutMs ? "no-speech" : "continue";
      return elapsedMs - lastSpeechAt >= trailingSilenceMs ? "end-turn" : "continue";
    },
  };
}
