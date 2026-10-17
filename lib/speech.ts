import type { Language } from "@/types";

/** BCP-47 tags for the browser's built-in speech engines. */
export const BROWSER_SPEECH_LANG: Record<Language, string> = {
  en: "en-US",
  bm: "ms-MY",
  zh: "zh-CN",
  ta: "ta-IN",
};

/**
 * Speaks text aloud using the Cloud TTS endpoint, falling back to the
 * browser's own speech engine when TTS credentials are not configured.
 * Returns a function that stops playback.
 */
export function speakText(
  text: string,
  language: Language,
  handlers: { onStart?: () => void; onEnd?: () => void; onError?: (err: unknown) => void } = {}
): () => void {
  let stopped = false;
  let audio: HTMLAudioElement | null = null;
  let audioUrl: string | null = null;

  const finish = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    audioUrl = null;
    if (!stopped) handlers.onEnd?.();
  };

  const speakWithBrowser = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      handlers.onError?.(new Error("Speech playback is not available on this device."));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = BROWSER_SPEECH_LANG[language];
    utterance.rate = 0.95;
    utterance.onstart = () => handlers.onStart?.();
    utterance.onend = finish;
    utterance.onerror = (e) => {
      if (!stopped) handlers.onError?.(e);
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  (async () => {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      });
      if (!res.ok) throw new Error(`TTS failed with status ${res.status}`);
      const blob = await res.blob();
      if (stopped) return;
      audioUrl = URL.createObjectURL(blob);
      audio = new Audio(audioUrl);
      audio.onended = finish;
      audio.onerror = () => {
        if (!stopped) speakWithBrowser();
      };
      await audio.play();
      handlers.onStart?.();
    } catch {
      if (!stopped) speakWithBrowser();
    }
  })();

  return () => {
    stopped = true;
    if (audio) {
      audio.pause();
      audio = null;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  };
}
