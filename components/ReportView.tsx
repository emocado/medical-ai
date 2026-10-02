"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Language, ReportRecord } from "@/types";
import { MedicalDisclaimer } from "./Disclaimer";
import { useT } from "./LanguageProvider";
import { speakText } from "@/lib/speech";
import type { StringKey } from "@/lib/i18n";
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

const STATUS_KEYS: Record<string, StringKey> = {
  high: "status.high",
  low: "status.low",
  abnormal: "status.abnormal",
};

export function ReportView({ report, language }: ReportViewProps) {
  const t = useT();
  const summaryText = report.summary[language] || report.summary.en;
  const keyMarkerEntries = Object.entries(report.keyMarkers || {});

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [ttsError, setTtsError] = useState<string | null>(null);
  const stopRef = useRef<(() => void) | null>(null);

  // Stop audio if report or language changes, and on unmount
  useEffect(() => {
    return () => stopAudio();
  }, [report.id, language]);

  function stopAudio() {
    stopRef.current?.();
    stopRef.current = null;
    setIsPlaying(false);
    setIsLoadingAudio(false);
  }

  function handleToggleReadAloud() {
    if (isPlaying) {
      stopAudio();
      return;
    }

    setTtsError(null);
    setIsLoadingAudio(true);
    stopRef.current = speakText(summaryText, language, {
      onStart: () => {
        setIsLoadingAudio(false);
        setIsPlaying(true);
      },
      onEnd: () => {
        stopRef.current = null;
        setIsPlaying(false);
      },
      onError: (err) => {
        console.error("TTS playback error:", err);
        stopRef.current = null;
        setIsPlaying(false);
        setIsLoadingAudio(false);
        setTtsError(t("report.ttsError"));
      },
    });
  }

  return (
    <article
      aria-label={t("report.aria", { name: report.fileName })}
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
          <h4 className="text-lg font-bold text-slate-900">{t("report.summary")}</h4>

          <button
            onClick={handleToggleReadAloud}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? t("report.stopReading.aria") : t("report.readAloud.aria")}
            className={`px-4 py-2 rounded-xl text-base font-bold min-h-[48px] flex items-center gap-2 transition-colors shadow-sm ${
              isPlaying
                ? "bg-red-700 hover:bg-red-800 text-white"
                : "bg-blue-100 hover:bg-blue-200 text-blue-950 border border-blue-300"
            }`}
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-900" aria-hidden="true" />
                <span>{t("report.preparingVoice")}</span>
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>{t("report.stopReading")}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5 text-blue-800" aria-hidden="true" />
                <span>{t("report.readAloud")}</span>
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
          <h4 className="text-lg font-bold text-slate-900">{t("report.keyMarkers")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keyMarkerEntries.map(([name, marker]) => {
              const statusKey = marker.status ? STATUS_KEYS[marker.status] : undefined;
              const isAbnormal = Boolean(statusKey);

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
                  {statusKey ? (
                    <span className="inline-flex items-center text-sm font-bold text-amber-900 bg-amber-200 px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-4 h-4 mr-1 text-amber-800" />
                      {t(statusKey)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-700" />
                      {t("status.normal")}
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
