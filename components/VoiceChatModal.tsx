"use client";

import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, PhoneOff, Volume2, Loader2, AlertCircle, Sparkles } from "lucide-react";
import type { Language, ReportRecord, PillRecord } from "@/types";

interface VoiceChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
}

export function VoiceChatModal({
  isOpen,
  onClose,
  language,
  latestReport,
  knownPills,
}: VoiceChatModalProps) {
  const [status, setStatus] = useState<
    "idle" | "connecting" | "connected" | "listening" | "speaking" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [spokenTranscript, setSpokenTranscript] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const playbackQueueRef = useRef<Float32Array[]>([]);
  const isPlayingRef = useRef<boolean>(false);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isOpen) {
      startVoiceSession();
    } else {
      endVoiceSession();
    }

    return () => {
      endVoiceSession();
    };
  }, [isOpen]);

  async function startVoiceSession() {
    setStatus("connecting");
    setErrorMessage(null);
    setSpokenTranscript("");

    // Fallback check: Browser support
    if (
      typeof window === "undefined" ||
      !window.WebSocket ||
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      setStatus("error");
      setErrorMessage(
        "Voice chat is not supported on this browser. Please use text chat instead."
      );
      return;
    }

    try {
      // 1. Fetch credentials and session configuration
      const configRes = await fetch("/api/voice/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, latestReport, knownPills }),
      });

      if (!configRes.ok) {
        throw new Error("Failed to initialize voice configuration.");
      }

      const { apiKey, model, systemPrompt, voiceName } = await configRes.json();

      // 2. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 3. Setup WebSocket connection to Gemini Live API
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // Send initial setup frame
        const setupMessage = {
          setup: {
            model: `models/${model}`,
            generationConfig: {
              responseModalities: ["AUDIO"],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: voiceName || "Aoede",
                  },
                },
              },
            },
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
          },
        };
        ws.send(JSON.stringify(setupMessage));
        setStatus("listening");

        // Start streaming microphone PCM
        startMicrophoneStreaming(stream, ws);
      };

      ws.onmessage = async (event) => {
        try {
          const rawData =
            event.data instanceof Blob ? await event.data.text() : event.data;
          const msg = JSON.parse(rawData);

          // Handle server content
          const parts = msg.serverContent?.modelTurn?.parts;
          if (parts && parts.length > 0) {
            for (const part of parts) {
              if (part.text) {
                setSpokenTranscript((prev) => `${prev} ${part.text}`);
              }
              if (part.inlineData && part.inlineData.data) {
                setStatus("speaking");
                playPcmChunk(part.inlineData.data);
              }
            }
          }

          if (msg.serverContent?.turnComplete) {
            setStatus("listening");
          }
        } catch (parseErr) {
          console.error("Error parsing Live API message:", parseErr);
        }
      };

      ws.onerror = (e) => {
        console.error("Gemini Live WebSocket error:", e);
        setStatus("error");
        setErrorMessage(
          "Voice chat connection interrupted. You can continue speaking via text chat."
        );
      };

      ws.onclose = () => {
        if (status !== "error") {
          setStatus("idle");
        }
      };
    } catch (err: any) {
      console.error("Failed to start voice chat:", err);
      setStatus("error");
      setErrorMessage(
        err.message ||
          "Microphone permission was denied or voice chat is temporarily unavailable."
      );
    }
  }

  function startMicrophoneStreaming(stream: MediaStream, ws: WebSocket) {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      // 4096 buffer size
      const processor = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (ws.readyState !== WebSocket.OPEN) return;

        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32Array to 16-bit PCM Int16Array
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert to base64
        const buffer = pcm16.buffer;
        let binary = "";
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Pcm = btoa(binary);

        const realTimeMessage = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: "audio/pcm;rate=16000",
                data: base64Pcm,
              },
            ],
          },
        };

        ws.send(JSON.stringify(realTimeMessage));
      };

      source.connect(processor);
      processor.connect(audioCtx.destination);
    } catch (micErr) {
      console.error("Microphone streaming error:", micErr);
    }
  }

  function playPcmChunk(base64Data: string) {
    try {
      if (!playbackContextRef.current) {
        playbackContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)({
          sampleRate: 24000, // Gemini Live audio returns 24kHz PCM
        });
        nextStartTimeRef.current = playbackContextRef.current.currentTime;
      }

      const binaryStr = atob(base64Data);
      const len = binaryStr.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const ctx = playbackContextRef.current;
      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + audioBuffer.duration;
    } catch (playErr) {
      console.error("Audio playback error:", playErr);
    }
  }

  function endVoiceSession() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (playbackContextRef.current) {
      playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }
    setStatus("idle");
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice Conversation Assistant"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-slate-300 flex flex-col items-center space-y-6 text-center">
        {/* Header */}
        <div className="w-full flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center space-x-2 text-blue-900 font-bold text-lg">
            <Mic className="w-6 h-6 text-blue-700" />
            <span>HealthMate Live Voice</span>
          </div>
          {latestReport && (
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              Report Context Active
            </span>
          )}
        </div>

        {/* Pulsing Voice Avatar Indicator */}
        <div className="relative py-4 flex items-center justify-center">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all ${
              status === "listening"
                ? "bg-blue-100 ring-8 ring-blue-300 animate-pulse text-blue-900"
                : status === "speaking"
                ? "bg-emerald-100 ring-8 ring-emerald-300 animate-bounce text-emerald-900"
                : status === "connecting"
                ? "bg-slate-100 ring-4 ring-slate-200 text-slate-500"
                : status === "error"
                ? "bg-red-100 ring-4 ring-red-300 text-red-900"
                : "bg-blue-50 text-blue-800"
            }`}
          >
            {status === "speaking" ? (
              <Volume2 className="w-14 h-14" />
            ) : status === "connecting" ? (
              <Loader2 className="w-12 h-12 animate-spin" />
            ) : status === "error" ? (
              <MicOff className="w-12 h-12" />
            ) : (
              <Mic className="w-14 h-14" />
            )}
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-1">
          <h4 className="text-2xl font-black text-slate-900">
            {status === "connecting" && "Connecting to HealthMate Voice..."}
            {status === "listening" && "Listening... Speak naturally"}
            {status === "speaking" && "HealthMate is speaking..."}
            {status === "error" && "Voice Unavailable"}
            {status === "idle" && "Ready to talk"}
          </h4>

          <p className="text-base text-slate-600 font-medium">
            {status === "listening" &&
              "Ask about your medical report, pills, or dietary advice."}
            {status === "speaking" && "Listen closely to HealthMate's guidance."}
            {status === "connecting" && "Setting up bidirectional audio stream..."}
          </p>
        </div>

        {/* Spoken Transcript preview if any */}
        {spokenTranscript && (
          <div className="w-full bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-base text-slate-700 text-left max-h-28 overflow-y-auto leading-relaxed">
            {spokenTranscript}
          </div>
        )}

        {/* Error Fallback Banner */}
        {errorMessage && (
          <div
            role="alert"
            className="w-full p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-2 text-left"
          >
            <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" />
            <div className="text-base">
              <p className="font-bold">Voice Session Error</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Button: End Call & Return to Text Chat */}
        <div className="w-full pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              endVoiceSession();
              onClose();
            }}
            className="w-full py-4 px-6 rounded-2xl min-h-[56px] text-lg font-bold flex items-center justify-center space-x-2 bg-red-700 hover:bg-red-800 text-white shadow-md active:bg-red-900 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
            <span>End Voice Chat (Return to Text)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
