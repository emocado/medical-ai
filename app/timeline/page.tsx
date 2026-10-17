"use client";

import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { errorMessageKey, postJson } from "@/lib/api-client";
import { MedicalDisclaimer } from "@/components/Disclaimer";
import { MealAdvisorModal } from "@/components/MealAdvisorModal";
import { MealScoreChip } from "@/components/MealScoreChip";
import { MarkerTrends } from "@/components/MarkerTrends";
import { BackupSection } from "@/components/BackupSection";
import { TranslationStatus } from "@/components/TranslationStatus";
import { localizedAnalysis, useAutoTranslate } from "@/components/useAutoTranslate";
import { ensureDisclaimer } from "@/lib/prompts";
import { deleteMealRecord, getAllReports, getAllMealRecords, getAllPillRecords, saveMealRecord } from "@/lib/db";
import {
  Clock,
  FileText,
  Utensils,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle,
  ArrowRight,
  GitCompare,
  Plus,
  Trash2,
} from "lucide-react";
import type { Language, ReportRecord, MealRecord, PillRecord } from "@/types";
import type { DeltaComparisonResult } from "@/lib/delta-comparator";
import { buildTrends, type ChangeVerdict } from "@/lib/trends";
import type { StringKey } from "@/lib/i18n";

type TimelineItem =
  | { type: "report"; item: ReportRecord; timestamp: number }
  | { type: "meal"; item: MealRecord; timestamp: number };

const CHANGE_STYLES: Record<ChangeVerdict, { label: StringKey; card: string; chip: string }> = {
  better: { label: "change.better", card: "border-emerald-300 bg-emerald-50/50", chip: "bg-emerald-100 text-emerald-950" },
  worse: { label: "change.worse", card: "border-red-300 bg-red-50/50", chip: "bg-red-100 text-red-950" },
  same: { label: "change.same", card: "border-slate-200 bg-slate-50", chip: "bg-slate-100 text-slate-900" },
  unknown: { label: "change.unknown", card: "border-slate-200 bg-slate-50", chip: "bg-blue-100 text-blue-950" },
};

export default function TimelinePage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [knownPills, setKnownPills] = useState<PillRecord[]>([]);
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [deltaResult, setDeltaResult] = useState<DeltaComparisonResult | null>(null);
  const [deltaLanguage, setDeltaLanguage] = useState<Language>("en");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMealModalOpen, setIsMealModalOpen] = useState(false);

  useEffect(() => {
    loadTimelineData();
  }, []);

  async function loadTimelineData() {
    try {
      const [allReports, allMeals, allPills] = await Promise.all([
        getAllReports(),
        getAllMealRecords(),
        getAllPillRecords(),
      ]);
      setReports(allReports);
      setMeals(allMeals);
      setKnownPills(allPills);
    } catch (err) {
      console.error("Failed to load timeline items:", err);
    }
  }

  function handleMealSaved(newMeal: MealRecord) {
    setMeals((prev) => [newMeal, ...prev]);
  }

  async function handleDeleteMeal(id: string) {
    await deleteMealRecord(id);
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function toggleReportSelection(id: string) {
    setSelectedReportIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((rId) => rId !== id);
      }
      if (prev.length >= 2) {
        return [prev[1], id];
      }
      return [...prev, id];
    });
  }

  async function handleCompare() {
    if (selectedReportIds.length !== 2) return;
    const rA = reports.find((r) => r.id === selectedReportIds[0]);
    const rB = reports.find((r) => r.id === selectedReportIds[1]);
    if (!rA || !rB) return;

    setIsComparing(true);
    setErrorMessage(null);
    setDeltaResult(null);

    try {
      const result = await postJson<DeltaComparisonResult>("/api/timeline/compare", {
        reportA: rA,
        reportB: rB,
        language: lang,
      });
      setDeltaResult(result);
      setDeltaLanguage(lang);
    } catch (err) {
      console.error("Comparison failed:", err);
      setErrorMessage(t(errorMessageKey(err, "timeline.compareError")));
    } finally {
      setIsComparing(false);
    }
  }

  const timelineItems: TimelineItem[] = [
    ...reports.map((r): TimelineItem => ({
      type: "report",
      item: r,
      // Place reports by when the test was done, falling back to upload time.
      timestamp: Number.isNaN(new Date(r.date).getTime()) ? r.createdAt : new Date(r.date).getTime(),
    })),
    ...meals.map((m): TimelineItem => ({
      type: "meal",
      item: m,
      timestamp: m.createdAt || new Date(m.date).getTime(),
    })),
  ].sort((a, b) => b.timestamp - a.timestamp);

  const latestReport = reports.length > 0 ? reports[0] : null;
  const trends = useMemo(() => buildTrends(reports), [reports]);

  const mealTranslation = useAutoTranslate(
    meals,
    lang,
    saveMealRecord,
    (updated) => setMeals((prev) => prev.map((m) => updated.find((u) => u.id === m.id) ?? m)),
    (analysis) => ({ ...analysis, advice: ensureDisclaimer(analysis.advice, lang) })
  );

  // A comparison is not stored, so when the language changes we translate the one on screen.
  const [deltaTranslation, setDeltaTranslation] = useState<"idle" | "translating" | "error">("idle");
  const [deltaRetry, setDeltaRetry] = useState(0);
  useEffect(() => {
    if (!deltaResult || deltaLanguage === lang) {
      setDeltaTranslation("idle");
      return;
    }
    let cancelled = false;
    setDeltaTranslation("translating");
    const { progression, ...text } = deltaResult;
    postJson<{ content: typeof text }>("/api/translate", { content: text, targetLanguage: lang })
      .then(({ content }) => {
        if (cancelled) return;
        setDeltaResult({ progression, ...content, summary: ensureDisclaimer(content.summary, lang) });
        setDeltaLanguage(lang);
        setDeltaTranslation("idle");
      })
      .catch(() => !cancelled && setDeltaTranslation("error"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, deltaLanguage, deltaRetry]);

  return (
    <div className="space-y-6">
      <Header title={t("title.timeline")} />

      {/* Overview & Actions */}
      <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-800" aria-hidden="true" />
            {t("timeline.journey")}
          </h2>
          <button
            onClick={() => setIsMealModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base min-h-[48px] flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-5 h-5" />
            <Utensils className="w-5 h-5" />
            <span>{t("timeline.logMeal")}</span>
          </button>
        </div>

        <p className="text-base text-slate-700 leading-relaxed">
          {t("timeline.desc")}
        </p>

        {reports.length >= 2 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <span className="text-base font-bold text-blue-950">
              {t("timeline.selectedCount", { count: selectedReportIds.length })}
            </span>
            <button
              onClick={handleCompare}
              disabled={selectedReportIds.length !== 2 || isComparing}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl min-h-[48px] font-bold text-base flex items-center justify-center space-x-2 transition-colors ${
                selectedReportIds.length === 2 && !isComparing
                  ? "bg-blue-800 text-white hover:bg-blue-900 shadow-sm"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  <span>{t("timeline.comparing")}</span>
                </>
              ) : (
                <>
                  <GitCompare className="w-5 h-5" aria-hidden="true" />
                  <span>{t("timeline.compare")}</span>
                </>
              )}
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-xl bg-red-50 border-2 border-red-300 text-red-900 flex items-start space-x-2"
          >
            <AlertCircle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-base font-medium">{errorMessage}</span>
          </div>
        )}
      </section>

      {trends.length > 0 && <MarkerTrends trends={trends} />}

      <TranslationStatus status={deltaTranslation} onRetry={() => setDeltaRetry((n) => n + 1)} />

      {/* Delta Comparison Result Display */}
      {deltaResult && (
        <section
          aria-label={t("timeline.comparison.aria")}
          className="bg-white rounded-2xl border-2 border-blue-400 p-5 shadow-md space-y-4 animate-in fade-in duration-300"
        >
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-blue-800" aria-hidden="true" />
              {t("timeline.comparisonTitle")}
            </h3>

            <span
              className={`px-3 py-1.5 rounded-full text-base font-black flex items-center gap-1.5 ${
                deltaResult.progression === "improving"
                  ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                  : deltaResult.progression === "declining"
                  ? "bg-red-100 text-red-950 border border-red-300"
                  : deltaResult.progression === "mixed"
                  ? "bg-purple-100 text-purple-950 border border-purple-300"
                  : "bg-blue-100 text-blue-950 border border-blue-300"
              }`}
            >
              {deltaResult.progression === "improving" && <TrendingUp className="w-5 h-5 text-emerald-700" />}
              {deltaResult.progression === "declining" && <TrendingDown className="w-5 h-5 text-red-700" />}
              {deltaResult.progression === "stable" && <Minus className="w-5 h-5 text-blue-700" />}
              {t(`progression.${deltaResult.progression}`)}
            </span>
          </div>

          <div className="text-lg text-slate-800 leading-relaxed whitespace-pre-line bg-blue-50/50 p-4 rounded-xl border border-blue-200 font-medium">
            {deltaResult.summary}
          </div>

          {deltaResult.markerDeltas && deltaResult.markerDeltas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-bold text-slate-900">{t("timeline.markerChanges")}</h4>
              <div className="space-y-2.5">
                {deltaResult.markerDeltas.map((delta, i) => {
                  const style = CHANGE_STYLES[delta.change ?? "unknown"];
                  return (
                  <div
                    key={i}
                    className={`p-3.5 rounded-xl border-2 space-y-2 ${style.card}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-lg font-bold text-slate-900">{delta.markerName}</span>
                      <span className={`text-base font-bold px-2.5 py-0.5 rounded-md flex-shrink-0 ${style.chip}`}>
                        {delta.change ? t(style.label) : delta.statusChange}
                      </span>
                    </div>
                    {delta.previousStatus && delta.currentStatus && (
                      <p className="text-sm font-semibold text-slate-600">
                        {t(`status.${delta.previousStatus}`)} → {t(`status.${delta.currentStatus}`)}
                      </p>
                    )}
                    <div className="flex items-center space-x-3 text-base font-semibold text-slate-700">
                      <span>{t("timeline.previous", { value: delta.previousValue })}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" aria-hidden="true" />
                      <span className="text-blue-900 font-bold">{t("timeline.latest", { value: delta.currentValue })}</span>
                    </div>
                    {delta.interpretation && (
                      <p className="text-base text-slate-600 leading-snug">
                        {delta.interpretation}
                      </p>
                    )}
                  </div>
                  );
                })}
              </div>
            </div>
          )}

          <MedicalDisclaimer />
        </section>
      )}

      {/* Timeline Entries List */}
      <section aria-label={t("timeline.history.aria")} className="space-y-4">
        <TranslationStatus status={mealTranslation.status} onRetry={mealTranslation.retry} />
        {timelineItems.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-lg font-medium text-slate-600">
              {t("timeline.empty")}
            </p>
          </div>
        ) : (
          timelineItems.map((entry) => {
            if (entry.type === "report") {
              const r = entry.item;
              const isSelected = selectedReportIds.includes(r.id);
              const summarySnippet =
                (r.summary[lang] || r.summary.en).slice(0, 140) + "...";

              return (
                <article
                  key={r.id}
                  className={`bg-white rounded-2xl border-2 p-5 shadow-sm space-y-3 transition-colors ${
                    isSelected ? "border-blue-800 bg-blue-50/40 ring-2 ring-blue-800" : "border-slate-300"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-6 h-6 text-blue-800 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{r.fileName}</h3>
                        <time className="text-sm font-semibold text-slate-500" dateTime={r.date}>
                          {r.date}
                        </time>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleReportSelection(r.id)}
                      aria-pressed={isSelected}
                      className={`px-4 py-2 rounded-xl text-base font-bold min-h-[48px] border-2 transition-colors flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-blue-800 text-white border-blue-800 shadow"
                          : "bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${isSelected ? "text-white" : "text-slate-400"}`}
                        aria-hidden="true"
                      />
                      <span>{isSelected ? t("timeline.selected") : t("timeline.selectToCompare")}</span>
                    </button>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed">{summarySnippet}</p>

                  {r.keyMarkers && Object.keys(r.keyMarkers).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(r.keyMarkers).slice(0, 4).map(([name, marker]) => (
                        <span
                          key={name}
                          className="text-sm font-medium bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg border border-slate-200"
                        >
                          {name}: {marker.value} {marker.unit || ""}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            } else {
              const m = entry.item;
              const mealAnalysis = localizedAnalysis(m, lang) ?? m.analysis;
              return (
                <article
                  key={m.id}
                  className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-6 h-6 text-amber-700 flex-shrink-0" aria-hidden="true" />
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {t("timeline.meal", { dishes: mealAnalysis.dishes.join(", ") })}
                        </h3>
                        <time className="text-sm font-semibold text-slate-500" dateTime={m.date}>
                          {m.date}
                        </time>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <MealScoreChip score={mealAnalysis.healthScore} />
                      <button
                        type="button"
                        onClick={() => window.confirm(t("confirm.deleteMeal")) && handleDeleteMeal(m.id)}
                        aria-label={t("delete.meal.aria")}
                        className="px-3 py-2 rounded-xl min-h-[48px] min-w-[48px] flex items-center gap-1.5 text-base font-bold text-red-800 border-2 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {mealAnalysis.advice}
                  </p>
                </article>
              );
            }
          })
        )}
      </section>

      <BackupSection onRestored={loadTimelineData} />

      {/* Meal Advisor Modal */}
      <MealAdvisorModal
        isOpen={isMealModalOpen}
        onClose={() => setIsMealModalOpen(false)}
        language={lang}
        latestReport={latestReport}
        knownPills={knownPills}
        onMealSaved={handleMealSaved}
      />
    </div>
  );
}
