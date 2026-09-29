import type { Language } from "@/types";

// In-memory cache for synthesized audio Object URLs: key is `${lang}:${text}`
const audioUrlCache = new Map<string, string>();

let currentAudio: HTMLAudioElement | null = null;

export function stopGuideAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
}

export async function playGuideAudio(
  text: string,
  language: Language,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): Promise<() => void> {
  // Cancel any running playback
  stopGuideAudio();

  const cacheKey = `${language}:${text}`;
  let audioUrl = audioUrlCache.get(cacheKey);

  try {
    if (!audioUrl) {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });

      if (!res.ok) {
        throw new Error(`TTS failed with status: ${res.status}`);
      }

      const blob = await res.blob();
      audioUrl = URL.createObjectURL(blob);
      audioUrlCache.set(cacheKey, audioUrl);
    }

    const audio = new Audio(audioUrl);
    currentAudio = audio;

    audio.onended = () => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      onEnd?.();
    };

    audio.onerror = (e) => {
      if (currentAudio === audio) {
        currentAudio = null;
      }
      onError?.(e);
    };

    await audio.play();
  } catch (err) {
    onError?.(err);
  }

  // Return cancel handle
  return () => {
    stopGuideAudio();
  };
}
