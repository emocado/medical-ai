"use client";

import React, { useState, useRef, useEffect } from "react";
import type { Language, MarkerStatus, ReportRecord } from "@/types";
import { MedicalDisclaimer } from "./Disclaimer";
import { useT } from "./LanguageProvider";
import { speakText } from "@/lib/speech";
import { findUrgentFindings, needsUrgentAttention } from "@/lib/red-flags";
import { UrgentAlert } from "./UrgentAlert";
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
  HelpCircle,
  Siren,
  Trash2,
} from "lucide-react";

interface ReportViewProps {
  report: ReportRecord;
  language: Language;
  onDelete?: () => void;
  /** Lets the patient correct a misread test date (YYYY-MM-DD). */
  onDateChange?: (date: string) => void;
}

const STATUS_STYLES: Record<
  MarkerStatus,
  { label: StringKey; card: string; chip: string; icon: typeof AlertTriangle }
> = {
  normal: {
    label: "status.normal",
    card: "border-transparent bg-canvas",
    chip: "text-emerald-900 bg-emerald-100",
    icon: CheckCircle2,
  },
  high: { label: "status.high", card: "border-amber-300 bg-amber-50", chip: "text-amber-900 bg-amber-200", icon: AlertTriangle },
  low: { label: "status.low", card: "border-amber-300 bg-amber-50", chip: "text-amber-900 bg-amber-200", icon: AlertTriangle },
  abnormal: {
    label: "status.abnormal",
    card: "border-amber-300 bg-amber-50",
    chip: "text-amber-900 bg-amber-200",
    icon: AlertTriangle,
  },
  critical: { label: "status.critical", card: "border-red-500 bg-red-50", chip: "text-white bg-red-700", icon: Siren },
  // No flag or range on the report: say so plainly instead of implying "normal".
  unknown: { label: "status.unknown", card: "border-black/[0.08] bg-white", chip: "text-ink-secondary bg-black/[0.06]", icon: HelpCircle },
};

export function ReportView({ report, language, onDelete, onDateChange }: ReportViewProps) {
  const t = useT();
  const summaryText = report.summary[language] || report.summary.en;
  const keyMarkerEntries = Object.entries(report.keyMarkers || {});
  const urgentFindings = findUrgentFindings(report);
  const isUrgent = needsUrgentAttention(report);

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
      className="card p-5 sm:p-6 space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.08] pb-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-11 h-11 rounded-[13px] bg-accent-soft flex items-center justify-center flex-shrink-0">
            <FileText className="w-6 h-6 text-accent" aria-hidden="true" />
          </span>
          <h3 className="text-xl font-bold text-ink break-all">{report.fileName}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-1.5 text-ink-secondary text-base font-medium">
            <Calendar className="w-5 h-5 text-ink-tertiary" aria-hidden="true" />
            <span className="sr-only">{t("report.testDate")}</span>
            {onDateChange ? (
              <input
                type="date"
                value={/^\d{4}-\d{2}-\d{2}$/.test(report.date) ? report.date : ""}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                title={t("report.testDate")}
                className="field !w-auto !py-1 !px-3 !rounded-xl text-base tabular"
              />
            ) : (
              <time dateTime={report.date}>{report.date}</time>
            )}
          </label>
          {onDelete && (
            <button
              type="button"
              onClick={() => window.confirm(t("confirm.deleteReport")) && onDelete()}
              aria-label={t("delete.report.aria")}
              className="btn !min-h-[48px] !px-4 !text-base bg-red-50 text-red-800 hover:bg-red-100"
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
              {t("common.delete")}
            </button>
          )}
        </div>
      </div>

      {isUrgent && <UrgentAlert findings={urgentFindings} />}

      {/* Summary Section with Read Aloud Button */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-bold text-ink">{t("report.summary")}</h4>

          <button
            onClick={handleToggleReadAloud}
            disabled={isLoadingAudio}
            aria-label={isPlaying ? t("report.stopReading.aria") : t("report.readAloud.aria")}
            className={`btn !min-h-[48px] !px-5 !text-base ${isPlaying ? "btn-danger" : "btn-tinted"}`}
          >
            {isLoadingAudio ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                <span>{t("report.preparingVoice")}</span>
              </>
            ) : isPlaying ? (
              <>
                <Square className="w-5 h-5 fill-current" aria-hidden="true" />
                <span>{t("report.stopReading")}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-5 h-5" aria-hidden="true" />
                <span>{t("report.readAloud")}</span>
              </>
            )}
          </button>
        </div>

        {ttsError && (
          <div
            role="alert"
            className="p-3 rounded-2xl bg-amber-50 ring-1 ring-inset ring-amber-300 text-amber-950 flex items-start gap-2 text-base"
          >
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{ttsError}</span>
          </div>
        )}

        <div className="well text-ink text-lg leading-relaxed whitespace-pre-line p-5">
          {summaryText}
        </div>
      </div>

      {/* Key Markers */}
      {keyMarkerEntries.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-lg font-bold text-ink">{t("report.keyMarkers")}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {keyMarkerEntries.map(([name, marker]) => {
              const style = STATUS_STYLES[marker.status ?? "unknown"] ?? STATUS_STYLES.unknown;
              const Icon = style.icon;

              return (
                <div
                  key={name}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-2 ${style.card}`}
                >
                  <div className="min-w-0">
                    <span className="text-base font-semibold text-ink-secondary block">{name}</span>
                    <span className="text-xl font-bold text-ink tabular">
                      {marker.value} {marker.unit || ""}
                    </span>
                    {marker.referenceRange && (
                      <span className="text-sm font-medium text-ink-tertiary block tabular">
                        {t("report.normalRange", { range: marker.referenceRange })}
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center text-sm font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${style.chip}`}
                  >
                    <Icon className="w-4 h-4 mr-1" aria-hidden="true" />
                    {t(style.label)}
                  </span>
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
