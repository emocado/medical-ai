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
      <article key={med.id} className="card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-2xl font-bold text-ink">{med.name}</h3>
          {med.genericName && <span className="text-base font-medium text-ink-tertiary italic">({med.genericName})</span>}
        </div>
        {details.purpose && <p className="text-lg text-ink-secondary">{details.purpose}</p>}
        <p
          className={`text-lg font-semibold p-4 rounded-2xl ${
            details.dosage ? "text-accent-ink bg-accent-soft" : "text-amber-950 bg-amber-50 ring-1 ring-inset ring-amber-300"
          }`}
        >
          {details.dosage || t("pills.dosageNotVisible")}
        </p>

        {med.active && (
          <fieldset>
            <legend className="eyebrow mb-2">{t("meds.whenTaken")}</legend>
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 gap-2">
              {DOSE_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleSlot(med, slot)}
                  aria-pressed={med.schedule.includes(slot)}
                  className={`press px-3 py-2 rounded-2xl min-h-[52px] text-base font-semibold border ${
                    med.schedule.includes(slot)
                      ? "border-accent bg-accent-soft text-accent-ink"
                      : "border-transparent bg-canvas text-ink-secondary hover:bg-[#ececf0]"
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
            className="btn btn-secondary text-base px-5"
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
            className="btn text-base px-5 bg-red-50 text-red-700 hover:bg-red-100"
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
        className="btn btn-primary w-full lg:w-auto min-h-[56px]"
      >
        <Camera className="w-6 h-6" aria-hidden="true" />
        {t("meds.scan")}
      </Link>

      <div className="grid gap-6 xl:grid-cols-2 xl:items-start">
        <TodayDoses medications={medications} />
        <InteractionCheck medications={medications} latestReport={latestReport} />
      </div>

      <section className="space-y-4" aria-label={t("meds.list")}>
        <h2 className="text-xl font-bold text-ink flex items-center gap-2">
          <Pill className="w-6 h-6 text-accent" aria-hidden="true" />
          {t("meds.list")}
        </h2>
        <TranslationStatus status={translation.status} onRetry={translation.retry} />
        {loaded && active.length === 0 && (
          <div className="text-center py-10 px-4 rounded-3xl border-2 border-dashed border-black/[0.12]">
            <p className="text-lg font-medium text-ink-tertiary">{t("meds.empty")}</p>
          </div>
        )}
        <div className="grid gap-4 xl:grid-cols-2 xl:items-start">{active.map(renderCard)}</div>
      </section>

      {stopped.length > 0 && (
        <details className="space-y-3">
          <summary className="text-lg font-semibold text-ink-secondary cursor-pointer min-h-[48px] flex items-center rounded-xl">
            {t("meds.stopped")} ({stopped.length})
          </summary>
          <div className="grid gap-4 pt-2 xl:grid-cols-2 xl:items-start">{stopped.map(renderCard)}</div>
        </details>
      )}

      <MedicalDisclaimer />
    </div>
  );
}
