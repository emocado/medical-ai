"use client";

import { useEffect, useMemo, useState } from "react";
import { Printer, Share2, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/Header";
import { useT } from "@/components/LanguageProvider";
import { getAllMedications, getAllReports } from "@/lib/db";
import { LANGUAGE_NATIVE_NAMES, translate, type StringKey } from "@/lib/i18n";
import { buildVisitSummary, visitQuestions, visitSummaryText } from "@/lib/visit-summary";
import type { Language, MedicationEntry, ReportRecord } from "@/types";

const NOTES_KEY = "healthmate_visit_notes";

export default function VisitPage() {

  const t = useT();
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  // Doctors in Malaysia usually read English; the patient can change it.
  const [docLang, setDocLang] = useState<Language>("en");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([getAllReports(), getAllMedications()])
      .then(([r, m]) => {
        setReports(r);
        setMedications(m);
      })
      .catch((err) => console.error("Failed to load visit summary data:", err));
    try {
      setNotes(localStorage.getItem(NOTES_KEY) ?? "");
    } catch {
      // Notes are a convenience; the sheet works without them.
    }
  }, []);

  function updateNotes(value: string) {
    setNotes(value);
    try {
      localStorage.setItem(NOTES_KEY, value);
    } catch {
      // ignore
    }
  }

  const summary = useMemo(() => buildVisitSummary(reports, medications), [reports, medications]);
  const d = (key: StringKey, vars?: Record<string, string | number>) => translate(docLang, key, vars);
  const questions = visitQuestions(summary, docLang);

  async function share() {
    const text = visitSummaryText(summary, docLang, notes);
    if (navigator.share) {
      try {
        await navigator.share({ title: d("visit.heading"), text });
        return;
      } catch {
        // Cancelled or unsupported: fall back to copying.
      }
    }
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 4000);
  }

  const sectionTitle = "text-lg font-semibold text-ink border-b border-black/[0.08] pb-1.5 print:border-slate-400";

  return (
    <div className="space-y-6">
      <Header title={t("title.visit")} />

      <section className="card p-5 sm:p-6 grid gap-4 print:hidden">
        <label className="block space-y-2">
          <span className="text-base font-medium text-ink-secondary">{t("visit.docLanguage")}</span>
          <select
            value={docLang}
            onChange={(e) => setDocLang(e.target.value as Language)}
            className="field min-h-[56px] font-semibold"
          >
            {(Object.keys(LANGUAGE_NATIVE_NAMES) as Language[]).map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_NATIVE_NAMES[l]}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => window.print()}
            className="btn btn-primary min-h-[56px]"
          >
            <Printer className="w-6 h-6" aria-hidden="true" />
            {t("visit.print")}
          </button>
          <button
            type="button"
            onClick={share}
            className="btn btn-tinted min-h-[56px]"
          >
            <Share2 className="w-6 h-6" aria-hidden="true" />
            {t("visit.share")}
          </button>
        </div>
        {copied && (
          <p role="status" className="text-base font-semibold text-emerald-700 flex items-center gap-2 lg:col-span-2">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            {t("visit.copied")}
          </p>
        )}
      </section>

      {/* The sheet itself, in the doctor's language. Plain styling so it prints cleanly. */}
      <article lang={docLang} className="card p-5 sm:p-8 space-y-6 print:border-0 print:p-0 print:shadow-none print:rounded-none">
        <h2 className="text-2xl font-bold text-ink">{d("visit.heading")}</h2>

        {summary.urgent.length > 0 && (
          <section className="p-4 rounded-2xl border-2 border-red-500 bg-red-50">
            <h3 className="text-lg font-bold text-red-900">⚠ {d("visit.urgent")}</h3>
            <ul className="text-base text-red-950 font-semibold">
              {summary.urgent.map((u) => (
                <li key={u.marker}>
                  {u.marker}: {u.value}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-2">
          <h3 className={sectionTitle}>{d("visit.medicines")}</h3>
          {summary.medications.length === 0 ? (
            <p className="text-base text-ink-secondary">{d("visit.noMedicines")}</p>
          ) : (
            <ul className="space-y-1.5 text-base text-ink">
              {summary.medications.map((m) => (
                <li key={m.id}>
                  <span className="font-semibold">{m.name}</span>
                  {m.genericName && <span className="text-ink-tertiary"> ({m.genericName})</span>}:{" "}
                  {m.analysis.dosage || <em>{d("visit.doseUnknown")}</em>}
                  {m.schedule.length > 0 && (
                    <span className="text-ink-tertiary">; {m.schedule.map((s) => d(`slot.${s}` as StringKey)).join(", ")}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-2">
          <h3 className={sectionTitle}>
            {summary.latestReport ? d("visit.results", { date: summary.latestReport.date }) : d("visit.noResults")}
          </h3>
          {summary.latestReport && summary.outOfRange.length === 0 && (
            <p className="text-base text-ink-secondary">{d("today.allNormal")}</p>
          )}
          {summary.outOfRange.length > 0 && (
            <ul className="divide-y divide-black/[0.06]">
              {summary.outOfRange.map(([name, m]) => (
                <li key={name} className="py-2 text-base">
                  <span className="font-semibold text-ink">{name}: </span>
                  <span className="font-semibold whitespace-nowrap tabular">
                    {m.value} {m.unit}
                  </span>{" "}
                  <span className="font-semibold text-amber-800">{d(`status.${m.status}` as StringKey)}</span>
                  {m.referenceRange && (
                    <span className="block text-sm text-ink-tertiary tabular">{d("report.normalRange", { range: m.referenceRange })}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {summary.previousReport && summary.changes.length > 0 && (
          <section className="space-y-2">
            <h3 className={sectionTitle}>{d("visit.changes", { date: summary.previousReport.date })}</h3>
            <ul className="space-y-1.5 text-base text-ink tabular">
              {summary.changes.map((c) => (
                <li key={c.key}>
                  <span className="font-semibold">{c.name}</span>: {c.previous.value} → {c.current.value} {c.current.unit}{" "}
                  <span className={c.change === "worse" ? "font-semibold text-red-700" : "font-semibold text-emerald-700"}>
                    ({d(`change.${c.change}` as StringKey)})
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {summary.interactions.length > 0 && (
          <section className="space-y-2">
            <h3 className={sectionTitle}>{d("visit.interactions")}</h3>
            <ul className="text-base text-ink font-semibold">
              {summary.interactions.map((k) => (
                <li key={k.medicines.join("+")}>{k.medicines.join(" + ")}</li>
              ))}
            </ul>
          </section>
        )}

        {questions.length > 0 && (
          <section className="space-y-2">
            <h3 className={sectionTitle}>{d("visit.questions")}</h3>
            <ol className="list-decimal pl-6 space-y-1.5 text-base text-ink marker:text-ink-tertiary">
              {questions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ol>
          </section>
        )}

        <section className="space-y-2">
          <h3 className={sectionTitle}>{d("visit.myNotes")}</h3>
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            placeholder={t("visit.notesPlaceholder")}
            rows={3}
            className="field print:hidden"
          />
          <p className="hidden print:block text-base whitespace-pre-line">{notes}</p>
        </section>

        <p className="text-sm text-ink-tertiary tabular">{d("visit.prepared", { date: new Date().toISOString().slice(0, 10) })}</p>
      </article>
    </div>
  );
}
