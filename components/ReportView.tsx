"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Language, ReportRecord } from "@/types";
import { MedicalDisclaimer } from "./Disclaimer";
import {
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  Square,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface ReportViewProps {
  report: ReportRecord;
  language: Language;
}

export function ReportView({ report, language }: ReportViewProps) {
  const summaryText = report.summary[language] || report.summary.en;
  const keyMarkerEntries = Object.entries(report.keyMarkers || {});

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Stop audio if report or language changes
  useEffect(() => {
    stopAudio();
  }, [report.id, language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  function stopAudio() {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsLoadingAudio(false);
  }

  async function handleToggleReadAloud() {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setTtsError(null);
    setIsLoadingAudio(true);

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: summaryText,
          language,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `TTS failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setTtsError("Audio playback error.");
      };

      await audio.play();
      setIsPlaying(true);
    } catch (err: any) {
      console.error("TTS playback error:", err);
      setTtsError(
        err.message ||
          "Could not read aloud at this moment. Please check network or TTS credentials."
      );
    } finally {
      setIsLoadingAudio(false);
    }
  }

  return (
    <article
      aria-label={`Report Summary for ${report.fileName}`}
      className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-6 h-6 text-blue-800" aria-hidden="true" />
          <h3 className="text-xl font-bold text-slate-900 break-all">{report.fileName}</h3>
        </div>
        <div className="flex items-center text-slate-700 text-base font-medium space-x-1">
          <Calendar className="w-5 h-5 text-slate-500" aria-hidden="true" />
          <time dateTime={report.date}>{report.date}</time>
        </div>
      </div>

      {/* Summary Section with Read Aloud Button */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-bold text-slate-900">Summary</h4>

          {/* Accessible Read Aloud Button */}
          <button
            onClick={handleToggleReadAloud}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? "Stop reading report summary aloud" : "Read report summary aloud"}
            className={`px-4 py-2 rounded-xl text-base font-bold min-h-[48px] flex items-center gap-2 transition-colors shadow-sm ${
              isPlaying
                ? "bg-red-700 hover:bg-red-800 text-white"
                : "bg-blue-100 hover:bg-blue-200 text-blue-950 border border-blue-300"
            }`}
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-900" aria-hidden="true" />
                <span>Preparing voice...</span>
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>Stop Reading</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-blue-800" aria-hidden="true" />
                <span>Read Aloud</span>
              </>
            )}
          </button>
        </div>

        {ttsError && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex items-start space-x-2 text-base"
          >
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{ttsError}</span>
          </div>
        )}

        <div className="text-slate-800 text-lg leading-relaxed whitespace-pre-line bg-blue-50/40 p-4 rounded-xl border border-blue-200 font-medium">
          {summaryText}
        </div>
      </div>

      {/* Key Markers */}
      {keyMarkerEntries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-slate-900">Key Health Markers</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyMarkerEntries.map(([name, marker]) => {
              const isAbnormal =
                marker.status === "high" ||
                marker.status === "low" ||
                marker.status === "abnormal";

              return (
                <div
                  key={name}
                  className={`p-3 rounded-xl border-2 flex items-start justify-between ${
                    isAbnormal
                      ? "border-amber-400 bg-amber-50/60"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div>
                    <span className="text-base font-bold text-slate-900 block">{name}</span>
                    <span className="text-lg font-extrabold text-blue-950">
                      {marker.value} {marker.unit || ""}
                    </span>
                  </div>
                  {isAbnormal ? (
                    <span className="inline-flex items-center text-sm font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-4 h-4 mr-1 text-amber-800" />
                      {marker.status ? marker.status.toUpperCase() : "CHECK"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-700" />
                      NORMAL
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <MedicalDisclaimer />
    </article>
  );
}
