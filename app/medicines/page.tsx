"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Pill, Trash2, PauseCircle, PlayCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { useLanguage, useT } from "@/components/LanguageProvider";
import { MedicalDisclaimer } from "@/components/Disclaimer";
import { TranslationStatus } from "@/components/TranslationStatus";
import { localizedAnalysis, useAutoTranslate } from "@/components/useAutoTranslate";
import { TodayDoses } from "@/components/medicines/TodayDoses";
import { InteractionCheck } from "@/components/medicines/InteractionCheck";
import { deleteMedication, getAllMedications, getAllReports, saveMedication } from "@/lib/db";
import { DOSE_SLOTS } from "@/lib/medications";
import type { DoseSlot, MedicationEntry, ReportRecord } from "@/types";

export default function MedicinesPage() {
  const { language: lang } = useLanguage();
  const t = useT();
  const [medications, setMedications] = useState<MedicationEntry[]>([]);
  const [latestReport, setLatestReport] = useState<ReportRecord | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([getAllMedications(), getAllReports()])
      .then(([meds, reports]) => {
        setMedications(meds);
        setLatestReport(reports[0] ?? null);
      })
      .catch((err) => console.error("Failed to load medicines:", err))
      .finally(() => setLoaded(true));
  }, []);

  const translation = useAutoTranslate(medications, lang, saveMedication, (updated) =>
    setMedications((prev) => prev.map((m) => updated.find((u) => u.id === m.id) ?? m))
  );

  async function update(med: MedicationEntry) {
    await saveMedication(med);
    setMedications((prev) => prev.map((m) => (m.id === med.id ? med : m)));
  }

  function toggleSlot(med: MedicationEntry, slot: DoseSlot) {
    const schedule = med.schedule.includes(slot)
      ? med.schedule.filter((s) => s !== slot)
      : DOSE_SLOTS.filter((s) => s === slot || med.schedule.includes(s));
    update({ ...med, schedule });
  }

  async function remove(id: string) {
    await deleteMedication(id);
    setMedications((prev) => prev.filter((m) => m.id !== id));
  }

  const active = medications.filter((m) => m.active);
  const stopped = medications.filter((m) => !m.active);

  function renderCard(med: MedicationEntry) {
    const details = localizedAnalysis(med, lang) ?? med.analysis;
    return (
      <article key={med.id} className="bg-white rounded-2xl border-2 border-slate-300 p-5 shadow-sm space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl font-black text-blue-950">{med.name}</h3>
          {med.genericName && <span className="text-base font-medium text-slate-600 italic">({med.genericName})</span>}
        </div>
        {details.purpose && <p className="text-lg text-slate-800">{details.purpose}</p>}
        <p
          className={`text-lg font-semibold p-3 rounded-xl border ${
            details.dosage ? "text-blue-950 bg-blue-50 border-blue-200" : "text-amber-950 bg-amber-50 border-amber-300"
          }`}
        >
          {details.dosage || t("pills.dosageNotVisible")}
        </p>

        {med.active && (
          <fieldset>
            <legend className="text-base font-bold text-slate-900 mb-2">{t("meds.whenTaken")}</legend>
            <div className="grid grid-cols-2 gap-2">
              {DOSE_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(med, slot)}
                  aria-pressed={med.schedule.includes(slot)}
                  className={`px-3 py-2 rounded-xl min-h-[48px] text-base font-bold border-2 ${
                    med.schedule.includes(slot)
                      ? "border-blue-800 bg-blue-100 text-blue-950"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {t(`slot.${slot}`)}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => update({ ...med, active: !med.active, stoppedAt: med.active ? Date.now() : undefined })}
            className="px-3 py-2 rounded-xl min-h-[48px] flex items-center gap-1.5 text-base font-bold text-slate-800 border-2 border-slate-300 hover:bg-slate-50"
          >
            {med.active ? (
              <PauseCircle className="w-5 h-5" aria-hidden="true" />
            ) : (
              <PlayCircle className="w-5 h-5" aria-hidden="true" />
            )}
            {med.active ? t("meds.stop") : t("meds.restart")}
          </button>
          <button
            type="button"
            onClick={() => window.confirm(t("confirm.deleteMedicine")) && remove(med.id)}
            className="px-3 py-2 rounded-xl min-h-[48px] flex items-center gap-1.5 text-base font-bold text-red-800 border-2 border-red-200 hover:bg-red-50"
          >
            <Trash2 className="w-5 h-5" aria-hidden="true" />
            {t("common.delete")}
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <Header title={t("title.medicines")} />

      <Link
        href="/pills"
        className="w-full py-4 px-6 rounded-xl min-h-[56px] text-lg font-bold flex items-center justify-center gap-3 bg-blue-800 hover:bg-blue-900 text-white shadow-sm"
      >
        <Camera className="w-6 h-6" aria-hidden="true" />
        {t("meds.scan")}
      </Link>

      <TodayDoses medications={medications} />
      <InteractionCheck medications={medications} latestReport={latestReport} />

      <section className="space-y-4" aria-label={t("meds.list")}>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Pill className="w-6 h-6 text-blue-800" aria-hidden="true" />
          {t("meds.list")}
        </h2>
        <TranslationStatus status={translation.status} onRetry={translation.retry} />
        {loaded && active.length === 0 && (
          <div className="text-center py-8 px-4 bg-white rounded-2xl border-2 border-dashed border-slate-300">
            <p className="text-lg font-medium text-slate-600">{t("meds.empty")}</p>
          </div>
        )}
        {active.map(renderCard)}
      </section>

      {stopped.length > 0 && (
        <details className="space-y-3">
          <summary className="text-lg font-bold text-slate-700 cursor-pointer min-h-[48px] flex items-center">
            {t("meds.stopped")} ({stopped.length})
          </summary>
          <div className="space-y-3 pt-2">{stopped.map(renderCard)}</div>
        </details>
      )}

      <MedicalDisclaimer />
    </div>
  );
}
