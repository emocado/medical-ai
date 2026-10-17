"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Volume2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import type { Language, ReportRecord, PillRecord, MedicationEntry } from "@/types";
import {
  VOICE_SAMPLE_RATE,
  bytesToBase64,
  computeRms,
  createSilenceDetector,
  downsample,
  encodeWav,
  mergeChunks,
} from "@/lib/audio-capture";
import { speakText } from "@/lib/speech";
import { stopGuideAudio } from "@/lib/guide-audio";
import type { StringKey } from "@/lib/i18n";
import { useT } from "./LanguageProvider";

export interface VoiceTurn {
  transcript: string;
  reply: string;
}

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  medications?: MedicationEntry[] | null;
  /** Prior chat messages, sent so spoken questions keep the conversation's context. */
  history?: { role: "user" | "assistant"; content: string }[];
  /** Called after each completed spoken exchange so it can join the text chat thread. */
  onTurn?: (turn: VoiceTurn) => void;
}

type VoiceStatus = "idle" | "listening" | "thinking" | "speaking" | "error";

export function VoiceChatModal({
  isOpen,
  onClose,
  language,
  latestReport,
  knownPills,
  medications,
  history = [],
  onTurn,
}: VoiceChatModalProps) {
  const t = useT();
  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<StringKey | null>(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastReply, setLastReply] = useState("");

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const stopSpeechRef = useRef<(() => void) | null>(null);
  const sessionActiveRef = useRef(false);
  const historyRef = useRef(history);
  historyRef.current = history;

  useEffect(() => {
    if (isOpen) {
      sessionActiveRef.current = true;
      stopGuideAudio();
      setErrorMessage(null);
      setLastTranscript("");
      setLastReply("");
      startListening();
    }
    return () => {
      sessionActiveRef.current = false;
      teardown();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  function stopRecording() {
    processorRef.current?.disconnect();
    processorRef.current = null;
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
  }

  function teardown() {
    stopRecording();
    stopSpeechRef.current?.();
    stopSpeechRef.current = null;
    setStatus("idle");
  }

  async function startListening() {
    stopSpeechRef.current?.();
    stopSpeechRef.current = null;

    if (
      typeof window === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !(window.AudioContext || (window as any).webkitAudioContext)
    ) {
      setStatus("error");
      setErrorMessage("voice.error.unsupported");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      if (!sessionActiveRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const processor = ctx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      const chunks: Float32Array[] = [];
      const detector = createSilenceDetector();
      const startedAt = performance.now();
      let finished = false;

      processor.onaudioprocess = (e) => {
        if (finished) return;
        const frame = new Float32Array(e.inputBuffer.getChannelData(0));
        chunks.push(frame);
        const decision = detector.update(computeRms(frame), performance.now() - startedAt);
        if (decision === "continue") return;

        finished = true;
        const sampleRate = ctx.sampleRate;
        stopRecording();
        if (decision === "no-speech") {
          setStatus("idle");
          return;
        }
        const clip = downsample(mergeChunks(chunks), sampleRate, VOICE_SAMPLE_RATE);
        sendTurn(bytesToBase64(encodeWav(clip, VOICE_SAMPLE_RATE)));
      };

      source.connect(processor);
      processor.connect(ctx.destination);
      setErrorMessage(null);
      setStatus("listening");
    } catch (err: any) {
      console.error("Failed to start voice chat:", err);
      stopRecording();
      setStatus("error");
      setErrorMessage(
        err?.name === "NotAllowedError"
          ? "voice.error.permission"
          : "voice.error.unavailable"
      );
    }
  }

  async function sendTurn(audioBase64: string) {
    setStatus("thinking");
    try {
      const res = await fetch("/api/voice/turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          mimeType: "audio/wav",
          history: historyRef.current,
          language,
          latestReport,
          knownPills,
          medications,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }
      const turn: VoiceTurn = await res.json();
      if (!sessionActiveRef.current) return;

      setLastTranscript(turn.transcript);
      setLastReply(turn.reply);
      if (turn.transcript) onTurn?.(turn);

      setStatus("speaking");
      stopSpeechRef.current = speakText(turn.reply, language, {
        onEnd: () => {
          stopSpeechRef.current = null;
          // Hands-free: listen for the next question once the reply finishes.
          if (sessionActiveRef.current) startListening();
        },
        onError: () => {
          stopSpeechRef.current = null;
          if (sessionActiveRef.current) setStatus("idle");
        },
      });
    } catch (err: any) {
      console.error("Voice turn failed:", err);
      if (!sessionActiveRef.current) return;
      setStatus("error");
      setErrorMessage("voice.error.turn");
    }
  }

  function handleMainButton() {
    if (status === "listening" || status === "thinking") return;
    // Tapping while the assistant speaks interrupts it and starts listening.
    startListening();
  }

  function handleClose() {
    sessionActiveRef.current = false;
    teardown();
    onClose();
  }

  if (!isOpen) return null;

  const headline =
    status === "listening"
      ? t("voice.listening")
      : status === "thinking"
      ? t("voice.thinking")
      : status === "speaking"
      ? t("voice.speaking")
      : status === "error"
      ? t("voice.unavailable")
      : t("voice.tapToTalk");

  const hint =
    status === "listening"
      ? t("voice.hint.listening")
      : status === "speaking"
      ? t("voice.hint.speaking")
      : status === "idle"
      ? t("voice.hint.idle")
      : "";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t("voice.aria")}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center scrim p-3 sm:p-4 overflow-y-auto overscroll-contain"
    >
      <div className="sheet max-w-md w-full p-6 flex flex-col items-center space-y-6 text-center">
        <div className="w-full flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-ink font-bold text-lg">
            <Mic className="w-6 h-6 text-accent" />
            <span>{t("voice.title")}</span>
          </div>
          {latestReport && (
            <span className="text-xs font-semibold bg-accent-soft text-accent-ink px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              {t("voice.reportActive")}
            </span>
          )}
        </div>

        <div className="relative py-4 flex items-center justify-center">
          <button
            type="button"
            onClick={handleMainButton}
            disabled={status === "listening" || status === "thinking"}
            aria-label={status === "speaking" ? t("voice.interrupt.aria") : t("voice.start.aria")}
            className={`press w-28 h-28 rounded-full flex items-center justify-center transition-[background-color,box-shadow,color,scale] duration-300 ease-fluid ${
              status === "listening"
                ? "bg-accent-soft ring-8 ring-accent/25 motion-safe:animate-pulse text-accent-ink"
                : status === "speaking"
                ? "bg-emerald-50 ring-8 ring-emerald-300/70 text-emerald-800"
                : status === "thinking"
                ? "bg-canvas ring-4 ring-black/5 text-ink-tertiary"
                : status === "error"
                ? "bg-red-50 ring-4 ring-red-200 text-red-800"
                : "bg-accent text-white ring-8 ring-accent/15 shadow-button hover:bg-accent-hover"
            }`}
          >
            {status === "speaking" ? (
              <Volume2 className="w-14 h-14" />
            ) : status === "thinking" ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : status === "error" ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-14 h-14" />
            )}
          </button>
        </div>

        <div className="space-y-1" aria-live="polite">
          <h4 className="text-2xl font-bold text-ink">{headline}</h4>
          {hint && <p className="text-base text-ink-tertiary font-medium">{hint}</p>}
        </div>

        {(lastTranscript || lastReply) && (
          <div className="well w-full p-4 text-base text-ink-secondary text-left max-h-40 overflow-y-auto overscroll-contain leading-relaxed space-y-2">
            {lastTranscript && (
              <p>
                <span className="font-semibold text-ink">{t("voice.you")}: </span>
                {lastTranscript}
              </p>
            )}
            {lastReply && (
              <p>
                <span className="font-semibold text-accent-ink">HealthMate: </span>
                {lastReply}
              </p>
            )}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="w-full p-4 rounded-2xl bg-red-50 ring-1 ring-inset ring-red-200 text-red-900 flex items-start space-x-2 text-left"
          >
            <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-base">
              <p className="font-bold">{t("voice.errorTitle")}</p>
              <p className="mt-0.5">{t(errorMessage)}</p>
            </div>
          </div>
        )}

        <div className="w-full pt-2 flex flex-col gap-2">
          <button
            onClick={handleClose}
            className="btn btn-danger w-full min-h-[56px]"
          >
            <PhoneOff className="w-6 h-6" />
            <span>{t("voice.end")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
