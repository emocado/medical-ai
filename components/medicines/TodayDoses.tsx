"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle2, Circle, Sun, Sunrise, Sunset, Moon } from "lucide-react";
import { useT } from "@/components/LanguageProvider";
import { getDoseLogsForDate, setDoseTaken } from "@/lib/db";
import { DOSE_SLOTS, doseKey, localDate } from "@/lib/medications";
import type { DoseSlot, MedicationEntry } from "@/types";

const SLOT_ICONS: Record<DoseSlot, typeof Sun> = {
  morning: Sunrise,
  afternoon: Sun,
  evening: Sunset,
  night: Moon,
};

/** Today's doses grouped by time of day, each a large tap-to-tick button. */
export function TodayDoses({ medications }: { medications: MedicationEntry[] }) {
  const t = useT();
  const today = localDate();
  const [taken, setTaken] = useState<Set<string>>(new Set());

  useEffect(() => {
    getDoseLogsForDate(today)
      .then((logs) => setTaken(new Set(logs.map((l) => l.key))))
      .catch((err) => console.error("Failed to load dose log:", err));
  }, [today]);

  const active = medications.filter((m) => m.active && m.schedule.length > 0);
  const total = active.reduce((n, m) => n + m.schedule.length, 0);
  if (total === 0) return null;

  async function toggle(med: MedicationEntry, slot: DoseSlot) {
    const key = doseKey(today, med.id, slot);
    const nowTaken = !taken.has(key);
    setTaken((prev) => {
      const next = new Set(prev);
      if (nowTaken) next.add(key);
      else next.delete(key);
      return next;
    });
    await setDoseTaken({ key, medicationId: med.id, date: today, slot }, nowTaken);
  }

  const takenCount = active.reduce(
    (n, m) => n + m.schedule.filter((s) => taken.has(doseKey(today, m.id, s))).length,
    0
  );

  return (
    <section className="bg-white p-5 rounded-2xl border-2 border-slate-300 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-900">{t("meds.today")}</h2>
        <span
          className={`px-3 py-1 rounded-full text-base font-bold ${
            takenCount === total ? "bg-emerald-100 text-emerald-950" : "bg-blue-100 text-blue-950"
          }`}
        >
          {t("meds.takenCount", { taken: takenCount, total })}
        </span>
      </div>
      <p className="text-base text-slate-600">{t("meds.tickHint")}</p>

      {DOSE_SLOTS.map((slot) => {
        const due = active.filter((m) => m.schedule.includes(slot));
        if (due.length === 0) return null;
        const Icon = SLOT_ICONS[slot];
        return (
          <div key={slot} className="space-y-2">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Icon className="w-5 h-5 text-amber-600" aria-hidden="true" />
              {t(`slot.${slot}`)}
            </h3>
            {due.map((med) => {
              const isTaken = taken.has(doseKey(today, med.id, slot));
              return (
                <button
                  key={med.id}
                  type="button"
                  onClick={() => toggle(med, slot)}
                  aria-pressed={isTaken}
                  aria-label={t("meds.markTaken", { name: med.name, slot: t(`slot.${slot}`) })}
                  className={`w-full p-3 rounded-xl min-h-[56px] border-2 flex items-center gap-3 text-left transition-colors ${
                    isTaken
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950"
                      : "border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {isTaken ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <Circle className="w-8 h-8 text-slate-400 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-lg font-bold">{med.name}</span>
                </button>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
