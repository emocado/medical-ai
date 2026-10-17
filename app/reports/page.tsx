"use client";

import { useEffect, useState, useRef } from "react";
import { Header } from "@/components/Header";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { ReportView } from "@/components/ReportView";
import { ChatInterface } from "@/components/ChatInterface";
import {
  deleteReport,
  getAllMedications,
  getAllPillRecords,
  getAllReports,
  saveReport,
  sortReportsNewestFirst,
} from "@/lib/db";
import { errorMessageKey, fileToBase64, postJson } from "@/lib/api-client";
import { loadSampleFile, type SampleFile } from "@/lib/samples";
import { SampleChips } from "@/components/SampleChips";
import { FileUp, Loader2, Plus, AlertCircle, History } from "lucide-react";
import type { MedicationEntry, ReportRecord, PillRecord } from "@/types";

export default function ReportsPage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [knownPills, setKnownPills] = useState<PillRecord[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [reportRecords, pillRecords, meds] = await Promise.all([
        getAllReports(),
        getAllPillRecords(),
        getAllMedications(),
      ]);
      setReports(reportRecords);
      setKnownPills(pillRecords);
      setMedications(meds.filter((m) => m.active));
      if (reportRecords.length > 0 && !selectedReportId) {
        setSelectedReportId(reportRecords[0].id);
      }
    } catch (err) {
      console.error("Failed to load initial data from IndexedDB:", err);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    await analyzeFile(file);
  }

  async function handleSample(sample: SampleFile) {
    try {
      await analyzeFile(await loadSampleFile(sample));
    } catch {
      setErrorMessage(t("samples.loadError"));
    }
  }

  async function analyzeFile(file: File) {
    setErrorMessage(null);
    setIsUploading(true);

    try {
      const base64 = await fileToBase64(file);
      const analyzedReport = await postJson<ReportRecord>("/api/reports/analyze", {
        fileBase64: base64,
        mimeType: file.type || "application/octet-stream",
        fileName: file.name,
      });
      await saveReport(analyzedReport);

      setReports((prev) => sortReportsNewestFirst([analyzedReport, ...prev]));
      setSelectedReportId(analyzedReport.id);
    } catch (err) {
      console.error("Upload/analysis failed:", err);
      setErrorMessage(t(errorMessageKey(err, "reports.upload.error")));
    } finally {
      setIsUploading(false);
    }
  }

  const activeReport = reports.find((r) => r.id === selectedReportId) || reports[0];

  async function handleDeleteReport(id: string) {
    await deleteReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setSelectedReportId(null);
  }

  async function handleDateChange(report: ReportRecord, date: string) {
    const updated = { ...report, date };
    await saveReport(updated);
    setReports((prev) => sortReportsNewestFirst(prev.map((r) => (r.id === report.id ? updated : r))));
  }

  return (
    <div className="space-y-6">
      <Header title={t("title.reports")} />

      {/* Upload Action */}
      <section className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-bold text-ink flex items-center gap-2">
            <FileUp className="w-6 h-6 text-accent" aria-hidden="true" />
            {t("reports.upload.title")}
          </h2>
          <span className="text-base text-ink-tertiary font-medium">{t("reports.upload.formats")}</span>
        </div>

        <p className="text-base text-ink-secondary leading-relaxed">{t("reports.upload.desc")}</p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,application/pdf"
          onChange={handleFileSelect}
          className="hidden"
          id="report-file-input"
          disabled={isUploading}
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="btn btn-primary w-full lg:w-auto lg:px-8 min-h-[56px]"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
              <span>{t("reports.upload.analyzing")}</span>
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" aria-hidden="true" />
              <span>{t("reports.upload.button")}</span>
            </>
          )}
        </button>

        <SampleChips kind="report" onPick={handleSample} disabled={isUploading} />

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

      {/* Report History / Selector if multiple reports exist */}
      {reports.length > 1 && (
        <section aria-label={t("reports.history.aria")} className="space-y-2">
          <div className="flex items-center gap-2 eyebrow px-1">
            <History className="w-5 h-5" aria-hidden="true" />
            <span>{t("reports.history.label")}</span>
          </div>
          <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-1 -mx-1 px-1" role="tablist">
            {reports.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={r.id === activeReport?.id}
                onClick={() => setSelectedReportId(r.id)}
                className={`press px-4 py-2 rounded-full text-base font-semibold whitespace-nowrap min-h-[48px] border tabular ${
                  r.id === activeReport?.id
                    ? "border-accent bg-accent-soft text-accent-ink"
                    : "border-transparent bg-white text-ink-secondary shadow-card hover:text-ink"
                }`}
              >
                {r.fileName.length > 18 ? `${r.fileName.slice(0, 16)}...` : r.fileName} ({r.date})
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Display Active Report */}
      {activeReport ? (
        <ReportView
          report={activeReport}
          language={lang}
          onDelete={() => handleDeleteReport(activeReport.id)}
          onDateChange={(date) => handleDateChange(activeReport, date)}
        />
      ) : (
        !isUploading && (
          <div className="text-center py-10 px-4 rounded-3xl border-2 border-dashed border-black/15">
            <p className="text-lg font-medium text-ink-tertiary">{t("reports.empty")}</p>
          </div>
        )
      )}

      {/* Chat Interface (with injected report + pills context) */}
      <ChatInterface
        language={lang}
        latestReport={activeReport || null}
        knownPills={knownPills}
        medications={medications}
      />
    </div>
  );
}
