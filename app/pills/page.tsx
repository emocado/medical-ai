"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/Header";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { errorMessageKey, fileToBase64, postJson } from "@/lib/api-client";
import { loadSampleFile, type SampleFile } from "@/lib/samples";
import { SampleChips } from "@/components/SampleChips";
import { MedicalDisclaimer } from "@/components/Disclaimer";
import { TranslationStatus } from "@/components/TranslationStatus";
import { localizedAnalysis, useAutoTranslate } from "@/components/useAutoTranslate";
import {
  deletePillRecord,
  getAllMedications,
  getAllPillRecords,
  getAllReports,
  saveMedication,
  savePillRecord,
} from "@/lib/db";
import { findSameMedication, medicationFromPill } from "@/lib/medications";
import Link from "next/link";
import {
  Pill,
  Camera,
  Loader2,
  AlertTriangle,
  Info,
  Utensils,
  History,
  Sparkles,
  ShieldAlert,
  Trash2,
  Plus,
  CheckCircle2,
} from "lucide-react";
import type { MedicationEntry, PillInfo, PillRecord, ReportRecord } from "@/types";

export default function PillsPage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [pillRecords, setPillRecords] = useState<PillRecord[]>([]);
  const [latestReport, setLatestReport] = useState<ReportRecord | null>(null);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [records, reports, meds] = await Promise.all([
        getAllPillRecords(),
        getAllReports(),
        getAllMedications(),
      ]);
      setPillRecords(records);
      setMedications(meds);
      if (reports.length > 0) {
        setLatestReport(reports[0]);
      }
      if (records.length > 0 && !selectedRecordId) {
        setSelectedRecordId(records[0].id);
      }
    } catch (err) {
      console.error("Failed to load records from IndexedDB:", err);
    }
  }

  async function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await analyzeImage(file);
  }

  async function handleSample(sample: SampleFile) {
    try {
      await analyzeImage(await loadSampleFile(sample));
    } catch {
      setErrorMessage(t("samples.loadError"));
    }
  }

  async function analyzeImage(file: File) {
    setErrorMessage(null);
    setIsAnalyzing(true);

    try {
      const base64 = await fileToBase64(file);
      const analyzedRecord = await postJson<PillRecord>("/api/pills/analyze", {
        imageBase64: base64,
        mimeType: file.type || "image/jpeg",
        latestReport,
        medications: medications.filter((m) => m.active),
        language: lang,
      });
      await savePillRecord(analyzedRecord);

      setPillRecords((prev) => [analyzedRecord, ...prev]);
      setSelectedRecordId(analyzedRecord.id);
    } catch (err) {
      console.error("Pill analysis failed:", err);
      setErrorMessage(t(errorMessageKey(err, "pills.error")));
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function addToMedicines(pill: PillInfo) {
    const med = medicationFromPill(pill, { scanId: activeRecord?.id, language: lang });
    await saveMedication(med);
    setMedications((prev) => [med, ...prev]);
  }

  async function handleDeleteScan(id: string) {
    await deletePillRecord(id);
    setPillRecords((prev) => prev.filter((r) => r.id !== id));
    setSelectedRecordId(null);
  }

  const activeRecord = pillRecords.find((r) => r.id === selectedRecordId) || pillRecords[0];
  const visibleRecords = useMemo(() => (activeRecord ? [activeRecord] : []), [activeRecord]);
  const translation = useAutoTranslate(visibleRecords, lang, savePillRecord, (updated) =>
    setPillRecords((prev) => prev.map((r) => updated.find((u) => u.id === r.id) ?? r))
  );
  const analysis = activeRecord ? localizedAnalysis(activeRecord, lang) ?? activeRecord.analysis : null;

  return (
    <div className="space-y-6">
      <Header title={t("title.pills")} />

      {/* Upload / Capture Section */}
      <section className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <Pill className="w-6 h-6 text-accent" aria-hidden="true" />
            {t("pills.check.title")}
          </h2>
          {latestReport && (
            <span className="chip text-sm bg-emerald-100 text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700" aria-hidden="true" />
              {t("pills.reportSynced")}
            </span>
          )}
        </div>

        <p className="text-base text-ink-secondary leading-relaxed">
          {t("pills.desc")}
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageSelect}
          className="hidden"
          id="pill-camera-input"
          disabled={isAnalyzing}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isAnalyzing}
          className="btn btn-primary w-full min-h-[56px]"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
              <span>{t("pills.analyzing")}</span>
            </>
          ) : (
            <>
              <Camera className="w-6 h-6" aria-hidden="true" />
              <span>{t("pills.button")}</span>
            </>
          )}
        </button>

        <SampleChips kind="pill" onPick={handleSample} disabled={isAnalyzing} />

        {errorMessage && (
          <div
            role="alert"
            className="p-4 rounded-2xl bg-red-50 ring-1 ring-inset ring-red-300 text-red-900 flex items-start gap-2"
          >
            <AlertTriangle className="w-6 h-6 text-red-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span className="text-base font-medium">{errorMessage}</span>
          </div>
        )}
      </section>

      {/* Pill Record History Selector */}
      {pillRecords.length > 1 && (
        <section
          aria-label={t("pills.history.aria")}
          className="card p-4 sm:p-5 space-y-2"
        >
          <div className="eyebrow flex items-center gap-2 mb-1">
            <History className="w-5 h-5" aria-hidden="true" />
            <span>{t("pills.history.label")}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1" role="tablist">
            {pillRecords.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={r.id === activeRecord?.id}
                onClick={() => setSelectedRecordId(r.id)}
                className={`px-4 py-2 rounded-full text-base font-semibold whitespace-nowrap min-h-[48px] border transition-colors duration-150 tabular ${
                  r.id === activeRecord?.id
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-transparent bg-canvas text-ink-secondary hover:bg-[#ececf0]"
                }`}
              >
                {r.analysis.pills.length === 1
                  ? t("pills.scanLabelOne", { date: r.date })
                  : t("pills.scanLabel", { date: r.date, count: r.analysis.pills.length })}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Active Pill Analysis Display */}
      {activeRecord && analysis ? (
        <div className="space-y-5">
          <TranslationStatus status={translation.status} onRetry={translation.retry} />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => window.confirm(t("confirm.deleteScan")) && handleDeleteScan(activeRecord.id)}
              aria-label={t("delete.scan.aria")}
              className="btn text-base px-5 bg-red-50 text-red-700 hover:bg-red-100"
            >
              <Trash2 className="w-5 h-5" aria-hidden="true" />
              {t("common.delete")}
            </button>
          </div>
          {/* Cross-reference alert */}
          {analysis.crossRefWithReports && (
            <div className="bg-accent-soft ring-1 ring-inset ring-accent/25 p-5 rounded-3xl space-y-1">
              <div className="flex items-center gap-2 text-accent-ink font-bold text-lg">
                <Sparkles className="w-5 h-5 text-accent" aria-hidden="true" />
                <span>{t("pills.connection")}</span>
              </div>
              <p className="text-base text-ink-secondary leading-relaxed font-medium">
                {analysis.crossRefWithReports}
              </p>
            </div>
          )}

          {/* Cards for each identified pill */}
          <div className={`grid gap-4 ${analysis.pills.length > 1 ? "xl:grid-cols-2 xl:items-start" : ""}`}>
            {analysis.pills.map((pill, idx) => (
              <article
                key={idx}
                className="card p-5 sm:p-6 space-y-5"
              >
                {pill.confidence === "low" && (
                  <div
                    role="note"
                    className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-base font-semibold flex items-start gap-2"
                  >
                    <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    {t("pills.lowConfidence")}
                  </div>
                )}
                <div className="border-b border-black/[0.08] pb-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-2xl font-bold text-ink">{pill.name}</h3>
                    {pill.genericName && (
                      <span className="text-base font-medium text-ink-tertiary italic">
                        ({pill.genericName})
                      </span>
                    )}
                  </div>
                </div>

                {/* Purpose */}
                <div className="space-y-1">
                  <span className="eyebrow flex items-center gap-1.5">
                    <Info className="w-5 h-5 text-accent" aria-hidden="true" />
                    {t("pills.purpose")}
                  </span>
                  <p className="well text-lg text-ink p-4 leading-relaxed">
                    {pill.purpose}
                  </p>
                </div>

                {/* Dosage */}
                <div className="space-y-1">
                  <span className="eyebrow flex items-center gap-1.5">
                    <Pill className="w-5 h-5 text-accent" aria-hidden="true" />
                    {t("pills.howToTake")}
                  </span>
                  {pill.dosageSource === "not-visible" ? (
                    <p className="text-lg font-semibold text-amber-950 bg-amber-50 p-4 rounded-2xl ring-1 ring-inset ring-amber-300 leading-relaxed">
                      {t("pills.dosageNotVisible")}
                    </p>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-accent-ink bg-accent-soft p-4 rounded-2xl leading-relaxed">
                        {pill.dosage}
                      </p>
                      {pill.dosageSource === "label" && (
                        <p className="text-sm font-medium text-ink-tertiary">{t("pills.fromLabel")}</p>
                      )}
                    </>
                  )}
                </div>

                {/* Side Effects */}
                {pill.sideEffects && pill.sideEffects.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="eyebrow flex items-center gap-1.5">
                      <AlertTriangle className="w-5 h-5 text-amber-600" aria-hidden="true" />
                      {t("pills.sideEffects")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.sideEffects.map((side, i) => (
                        <span
                          key={i}
                          className="chip bg-amber-50 text-amber-950 ring-1 ring-inset ring-amber-300"
                        >
                          {side}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Interactions */}
                {pill.foodInteractions && pill.foodInteractions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="eyebrow flex items-center gap-1.5">
                      <Utensils className="w-5 h-5 text-red-600" aria-hidden="true" />
                      {t("pills.foodInteractions")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.foodInteractions.map((food, i) => (
                        <span
                          key={i}
                          className="chip bg-red-50 text-red-950 ring-1 ring-inset ring-red-200"
                        >
                          {t("pills.avoid", { item: food })}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drug Interactions */}
                {pill.drugInteractions && pill.drugInteractions.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="eyebrow flex items-center gap-1.5">
                      <ShieldAlert className="w-5 h-5 text-ink-secondary" aria-hidden="true" />
                      {t("pills.drugInteractions")}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pill.drugInteractions.map((drug, i) => (
                        <span
                          key={i}
                          className="chip font-medium bg-canvas text-ink ring-1 ring-inset ring-black/[0.08]"
                        >
                          {drug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Adding is the patient's confirmation that the identification is right. */}
                <div className="border-t border-black/[0.08] pt-4 space-y-2">
                  {findSameMedication(medications, pill) ? (
                    <Link
                      href="/medicines"
                      className="btn w-full min-h-[56px] bg-emerald-50 text-emerald-900 ring-1 ring-inset ring-emerald-300"
                    >
                      <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
                      {t("meds.added")}
                    </Link>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => addToMedicines(pill)}
                        className="btn btn-primary w-full min-h-[56px]"
                      >
                        <Plus className="w-6 h-6" aria-hidden="true" />
                        {t("meds.add")}
                      </button>
                      <p className="text-sm font-medium text-ink-tertiary text-center">{t("meds.addHint")}</p>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>

          <MedicalDisclaimer />
        </div>
      ) : (
        !isAnalyzing && (
          <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-black/[0.12]">
            <p className="text-lg font-medium text-ink-tertiary">
              {t("pills.empty")}
            </p>
          </div>
        )
      )}
    </div>
  );
}
