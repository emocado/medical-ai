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
import {
  deleteMealRecord,
  getAllMealRecords,
  getAllMedications,
  getAllPillRecords,
  getAllReports,
  saveMealRecord,
} from "@/lib/db";
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
import type { Language, MedicationEntry, ReportRecord, MealRecord, PillRecord } from "@/types";
import type { DeltaComparisonResult } from "@/lib/delta-comparator";
import { buildTrends, type ChangeVerdict } from "@/lib/trends";
import type { StringKey } from "@/lib/i18n";

type TimelineItem =
  | { type: "report"; item: ReportRecord; timestamp: number }
  | { type: "meal"; item: MealRecord; timestamp: number };

const CHANGE_STYLES: Record<ChangeVerdict, { label: StringKey; card: string; chip: string }> = {
  better: { label: "change.better", card: "bg-emerald-50 ring-1 ring-inset ring-emerald-200", chip: "bg-emerald-100 text-emerald-900" },
  worse: { label: "change.worse", card: "bg-red-50 ring-1 ring-inset ring-red-200", chip: "bg-red-100 text-red-900" },
  same: { label: "change.same", card: "bg-canvas", chip: "bg-black/[0.06] text-ink" },
  unknown: { label: "change.unknown", card: "bg-canvas", chip: "bg-accent-soft text-accent-ink" },
};

export default function TimelinePage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [knownPills, setKnownPills] = useState<PillRecord[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
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
      const [allReports, allMeals, allPills, meds] = await Promise.all([
        getAllReports(),
        getAllMealRecords(),
        getAllPillRecords(),
        getAllMedications(),
      ]);
      setReports(allReports);
      setMeals(allMeals);
      setKnownPills(allPills);
      setMedications(meds.filter((m) => m.active));
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
      <section className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Clock className="w-6 h-6 text-accent" aria-hidden="true" />
            {t("timeline.journey")}
          </h2>
          <button
            onClick={() => setIsMealModalOpen(true)}
            className="btn bg-amber-600 text-white shadow-button hover:bg-amber-700 text-base px-5"
          >
            <Plus className="w-5 h-5" />
            <Utensils className="w-5 h-5" />
            <span>{t("timeline.logMeal")}</span>
          </button>
        </div>

        <p className="text-base text-ink-secondary leading-relaxed">
          {t("timeline.desc")}
        </p>

        {reports.length >= 2 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-accent-soft rounded-2xl">
            <span className="text-base font-semibold text-accent-ink tabular">
              {t("timeline.selectedCount", { count: selectedReportIds.length })}
            </span>
            <button
              onClick={handleCompare}
              disabled={selectedReportIds.length !== 2 || isComparing}
              className="btn btn-primary w-full sm:w-auto text-base"
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
            className="p-4 rounded-2xl bg-red-50 ring-1 ring-inset ring-red-300 text-red-900 flex items-start gap-2"
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
          className="card p-5 sm:p-6 space-y-4 ring-2 ring-accent/30"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.08] pb-3">
            <h3 className="text-2xl font-bold text-ink flex items-center gap-2">
              <TrendingUp className="w-7 h-7 text-accent" aria-hidden="true" />
              {t("timeline.comparisonTitle")}
            </h3>

            <span
              className={`chip ${
                deltaResult.progression === "improving"
                  ? "bg-emerald-100 text-emerald-900"
                  : deltaResult.progression === "declining"
                  ? "bg-red-100 text-red-900"
                  : deltaResult.progression === "mixed"
                  ? "bg-violet-100 text-violet-900"
                  : "bg-accent-soft text-accent-ink"
              }`}
            >
              {deltaResult.progression === "improving" && <TrendingUp className="w-5 h-5 text-emerald-700" />}
              {deltaResult.progression === "declining" && <TrendingDown className="w-5 h-5 text-red-700" />}
              {deltaResult.progression === "stable" && <Minus className="w-5 h-5 text-accent" />}
              {t(`progression.${deltaResult.progression}`)}
            </span>
          </div>

          <div className="well text-lg text-ink-secondary leading-relaxed whitespace-pre-line p-4 font-medium">
            {deltaResult.summary}
          </div>

          {deltaResult.markerDeltas && deltaResult.markerDeltas.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-ink">{t("timeline.markerChanges")}</h4>
              <div className="grid gap-2.5 lg:grid-cols-2">
                {deltaResult.markerDeltas.map((delta, i) => {
                  const style = CHANGE_STYLES[delta.change ?? "unknown"];
                  return (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl space-y-2 ${style.card}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-lg font-semibold text-ink">{delta.markerName}</span>
                      <span className={`chip flex-shrink-0 ${style.chip}`}>
                        {delta.change ? t(style.label) : delta.statusChange}
                      </span>
                    </div>
                    {delta.previousStatus && delta.currentStatus && (
                      <p className="text-sm font-medium text-ink-tertiary">
                        {t(`status.${delta.previousStatus}`)} → {t(`status.${delta.currentStatus}`)}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-medium text-ink-secondary tabular">
                      <span>{t("timeline.previous", { value: delta.previousValue })}</span>
                      <ArrowRight className="w-4 h-4 text-ink-tertiary" aria-hidden="true" />
                      <span className="text-accent-ink font-semibold">{t("timeline.latest", { value: delta.currentValue })}</span>
                    </div>
                    {delta.interpretation && (
                      <p className="text-base text-ink-tertiary leading-snug">
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
          <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-black/15">
            <p className="text-lg font-medium text-ink-tertiary">
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
                  className={`card p-5 sm:p-6 space-y-3 transition-[box-shadow,background-color] duration-150 ${
                    isSelected ? "!border-accent ring-2 ring-accent !bg-accent-soft/40" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-[13px] bg-accent-soft flex items-center justify-center flex-shrink-0">
                        <FileText className="w-6 h-6 text-accent" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-ink break-words">{r.fileName}</h3>
                        <time className="text-sm font-medium text-ink-tertiary tabular" dateTime={r.date}>
                          {r.date}
                        </time>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleReportSelection(r.id)}
                      aria-pressed={isSelected}
                      className={`btn text-base px-4 ${isSelected ? "btn-primary" : "btn-secondary"}`}
                    >
                      <CheckCircle2
                        className={`w-5 h-5 ${isSelected ? "text-white" : "text-ink-tertiary"}`}
                        aria-hidden="true"
                      />
                      <span>{isSelected ? t("timeline.selected") : t("timeline.selectToCompare")}</span>
                    </button>
                  </div>

                  <p className="text-base text-ink-secondary leading-relaxed">{summarySnippet}</p>

                  {r.keyMarkers && Object.keys(r.keyMarkers).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Object.entries(r.keyMarkers).slice(0, 4).map(([name, marker]) => (
                        <span
                          key={name}
                          className="chip text-sm font-medium bg-canvas text-ink-secondary tabular"
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
                  className="card p-5 sm:p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-11 h-11 rounded-[13px] bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Utensils className="w-6 h-6 text-amber-700" aria-hidden="true" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="text-xl font-semibold text-ink break-words">
                          {t("timeline.meal", { dishes: mealAnalysis.dishes.join(", ") })}
                        </h3>
                        <time className="text-sm font-medium text-ink-tertiary tabular" dateTime={m.date}>
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
                        className="btn text-base px-4 bg-transparent text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                        {t("common.delete")}
                      </button>
                    </div>
                  </div>

                  <p className="text-base text-ink-secondary leading-relaxed whitespace-pre-line">
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
        medications={medications}
        onMealSaved={handleMealSaved}
      />
    </div>
  );
}
