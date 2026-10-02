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

  const sectionTitle = "text-lg font-bold text-slate-900 border-b-2 border-slate-300 pb-1";

  return (
    <div className="space-y-6">
      <Header title={t("title.visit")} />

      <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-3 print:hidden">
        <label className="block space-y-2">
          <span className="text-base font-semibold text-slate-700">{t("visit.docLanguage")}</span>
          <select
            value={docLang}
            onChange={(e) => setDocLang(e.target.value as Language)}
            className="w-full px-4 py-3 min-h-[56px] rounded-xl border-2 border-slate-300 text-lg font-bold bg-white"
          >
            {(Object.keys(LANGUAGE_NATIVE_NAMES) as Language[]).map((l) => (
              <option key={l} value={l}>
                {LANGUAGE_NATIVE_NAMES[l]}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="py-3 px-4 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center gap-2 bg-blue-800 hover:bg-blue-900 text-white"
          >
            <Printer className="w-6 h-6" aria-hidden="true" />
            {t("visit.print")}
          </button>
          <button
            type="button"
            onClick={share}
            className="py-3 px-4 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center gap-2 border-2 border-blue-800 text-blue-900 bg-white hover:bg-blue-50"
          >
            <Share2 className="w-6 h-6" aria-hidden="true" />
            {t("visit.share")}
          </button>
        </div>
        {copied && (
          <p role="status" className="text-base font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            {t("visit.copied")}
          </p>
        )}
      </section>

      {/* The sheet itself, in the doctor's language. Plain styling so it prints cleanly. */}
      <article lang={docLang} className="bg-white p-5 rounded-2xl border-2 border-slate-300 space-y-5 print:border-0 print:p-0">
        <h2 className="text-2xl font-black text-slate-900">{d("visit.heading")}</h2>

        {summary.urgent.length > 0 && (
          <section className="p-3 rounded-xl border-2 border-red-500 bg-red-50">
            <h3 className="text-lg font-black text-red-900">⚠ {d("visit.urgent")}</h3>
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
            <p className="text-base text-slate-700">{d("visit.noMedicines")}</p>
          ) : (
            <ul className="space-y-1.5 text-base text-slate-900">
              {summary.medications.map((m) => (
                <li key={m.id}>
                  <span className="font-bold">{m.name}</span>
                  {m.genericName && <span className="text-slate-600"> ({m.genericName})</span>}:{" "}
                  {m.analysis.dosage || <em>{d("visit.doseUnknown")}</em>}
                  {m.schedule.length > 0 && (
                    <span className="text-slate-600">; {m.schedule.map((s) => d(`slot.${s}` as StringKey)).join(", ")}</span>
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
            <p className="text-base text-slate-700">{d("today.allNormal")}</p>
          )}
          {summary.outOfRange.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {summary.outOfRange.map(([name, m]) => (
                <li key={name} className="py-1.5 text-base">
                  <span className="font-semibold text-slate-900">{name}: </span>
                  <span className="font-bold whitespace-nowrap">
                    {m.value} {m.unit}
                  </span>{" "}
                  <span className="font-bold text-amber-900">{d(`status.${m.status}` as StringKey)}</span>
                  {m.referenceRange && (
                    <span className="block text-sm text-slate-600">{d("report.normalRange", { range: m.referenceRange })}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {summary.previousReport && summary.changes.length > 0 && (
          <section className="space-y-2">
            <h3 className={sectionTitle}>{d("visit.changes", { date: summary.previousReport.date })}</h3>
            <ul className="space-y-1 text-base text-slate-900">
              {summary.changes.map((c) => (
                <li key={c.key}>
                  <span className="font-semibold">{c.name}</span>: {c.previous.value} → {c.current.value} {c.current.unit}{" "}
                  <span className={c.change === "worse" ? "font-bold text-red-800" : "font-bold text-emerald-800"}>
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
            <ul className="text-base text-slate-900 font-semibold">
              {summary.interactions.map((k) => (
                <li key={k.medicines.join("+")}>{k.medicines.join(" + ")}</li>
              ))}
            </ul>
          </section>
        )}

        {questions.length > 0 && (
          <section className="space-y-2">
            <h3 className={sectionTitle}>{d("visit.questions")}</h3>
            <ol className="list-decimal pl-6 space-y-1.5 text-base text-slate-900">
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
            className="w-full p-3 border-2 border-slate-300 rounded-xl text-lg print:hidden"
          />
          <p className="hidden print:block text-base whitespace-pre-line">{notes}</p>
        </section>

        <p className="text-sm text-slate-500">{d("visit.prepared", { date: new Date().toISOString().slice(0, 10) })}</p>
      </article>
    </div>
  );
}
