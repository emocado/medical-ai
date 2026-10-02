"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Volume2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import type { Language, ReportRecord, PillRecord } from "@/types";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-300 flex flex-col items-center space-y-6 text-center">
        <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-lg">
            <Mic className="w-6 h-6 text-blue-700" />
            <span>{t("voice.title")}</span>
          </div>
          {latestReport && (
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
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
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              status === "listening"
                ? "bg-blue-100 ring-8 ring-blue-300 animate-pulse text-blue-900"
                : status === "speaking"
                ? "bg-emerald-100 ring-8 ring-emerald-300 text-emerald-900"
                : status === "thinking"
                ? "bg-slate-100 ring-4 ring-slate-200 text-slate-500"
                : status === "error"
                ? "bg-red-100 ring-4 ring-red-300 text-red-900"
                : "bg-blue-50 ring-4 ring-blue-200 text-blue-800 hover:bg-blue-100"
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
          <h4 className="text-2xl font-black text-slate-900">{headline}</h4>
          {hint && <p className="text-base text-slate-600 font-medium">{hint}</p>}
        </div>

        {(lastTranscript || lastReply) && (
          <div className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-base text-slate-700 text-left max-h-40 overflow-y-auto leading-relaxed space-y-2">
            {lastTranscript && (
              <p>
                <span className="font-bold text-slate-900">{t("voice.you")}: </span>
                {lastTranscript}
              </p>
            )}
            {lastReply && (
              <p>
                <span className="font-bold text-blue-900">HealthMate: </span>
                {lastReply}
              </p>
            )}
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="w-full p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-2 text-left"
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
            className="w-full py-4 px-6 rounded-2xl min-h-[56px] text-lg font-bold flex items-center justify-center space-x-2 bg-red-700 hover:bg-red-800 text-white shadow-md active:bg-red-900 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
            <span>{t("voice.end")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
