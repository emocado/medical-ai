import type { DoseSlot, Language, MedicationEntry, PillInfo } from "@/types";

export const DOSE_SLOTS: DoseSlot[] = ["morning", "afternoon", "evening", "night"];

/**
 * Suggests when a medicine is taken from its label wording. It is only a
 * starting point: the patient can change the times before saving.
 */
export function inferSchedule(dosage: string): DoseSlot[] {
  const text = dosage.toLowerCase();
  const slots = new Set<DoseSlot>();

  if (/morning|breakfast|pagi|sarapan|早上|早晨|早餐|காலை/.test(text)) slots.add("morning");
  if (/afternoon|lunch|tengah hari|petang|中午|午餐|下午|மதிய/.test(text)) slots.add("afternoon");
  if (/evening|dinner|supper|makan malam|晚餐|傍晚|மாலை|இரவு உணவு/.test(text)) slots.add("evening");
  if (/night|bedtime|before sleep|waktu malam|sebelum tidur|睡前|晚上|இரவு/.test(text) && !slots.has("evening")) {
    slots.add("night");
  }
  if (slots.size > 0) return DOSE_SLOTS.filter((s) => slots.has(s));

  if (/four times|4 times|qid|4 kali|每日四次|四次/.test(text)) return ["morning", "afternoon", "evening", "night"];
  if (/three times|3 times|\btds\b|\btid\b|3 kali|每日三次|三次/.test(text)) return ["morning", "afternoon", "evening"];
  if (/twice|two times|2 times|\bbd\b|\bbid\b|2 kali|每日两次|两次|இரண்டு/.test(text)) return ["morning", "evening"];
  return ["morning"];
}

export function medicationFromPill(pill: PillInfo, opts: { scanId?: string; language?: Language } = {}): MedicationEntry {
  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `med-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: pill.name,
    genericName: pill.genericName,
    analysis: {
      purpose: pill.purpose,
      dosage: pill.dosageSource === "not-visible" ? "" : pill.dosage,
      sideEffects: pill.sideEffects,
      foodInteractions: pill.foodInteractions,
      drugInteractions: pill.drugInteractions,
    },
    schedule: inferSchedule(pill.dosageSource === "not-visible" ? "" : pill.dosage),
    active: true,
    sourceScanId: opts.scanId,
    language: opts.language,
    createdAt: Date.now(),
  };
}

/** Same medicine already on the list? Compared by generic name, then brand name. */
export function findSameMedication(meds: MedicationEntry[], pill: Pick<PillInfo, "name" | "genericName">) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const generic = norm(pill.genericName || "");
  const name = norm(pill.name || "");
  return meds.find(
    (m) => m.active && ((generic && norm(m.genericName).includes(generic)) || (name && norm(m.name) === name))
  );
}

export function doseKey(date: string, medicationId: string, slot: DoseSlot): string {
  return `${date}|${medicationId}|${slot}`;
}

/** Local calendar date as YYYY-MM-DD (not UTC, so "today" matches the patient's day). */
export function localDate(d = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface KnownInteraction {
  medicines: [string, string];
  severity: "serious";
  /** Key into the interface translations describing what to do. */
  adviceKey: "interaction.statinMacrolide" | "interaction.warfarinNsaid" | "interaction.potassium" | "interaction.nitrate";
}

/** Generic-name fragments for each group in the rules below. */
const GROUPS: Record<string, string[]> = {
  macrolide: ["clarithromycin", "erythromycin"],
  statin: ["simvastatin", "atorvastatin", "lovastatin"],
  anticoagulant: ["warfarin"],
  nsaid: ["aspirin", "ibuprofen", "diclofenac", "naproxen", "mefenamic", "celecoxib", "etoricoxib"],
  raasBlocker: ["pril", "sartan"],
  potassiumRaiser: ["spironolactone", "eplerenone", "amiloride", "potassium chloride", "triamterene"],
  nitrate: ["nitroglycerin", "glyceryl trinitrate", "isosorbide"],
  pde5: ["sildenafil", "tadalafil", "vardenafil"],
};

/**
 * A deliberately small table of well-established, dangerous combinations.
 * It backs up the AI check so these are flagged even if the model misses them.
 */
const RULES: { a: string; b: string; adviceKey: KnownInteraction["adviceKey"] }[] = [
  { a: "macrolide", b: "statin", adviceKey: "interaction.statinMacrolide" },
  { a: "anticoagulant", b: "nsaid", adviceKey: "interaction.warfarinNsaid" },
  { a: "raasBlocker", b: "potassiumRaiser", adviceKey: "interaction.potassium" },
  { a: "nitrate", b: "pde5", adviceKey: "interaction.nitrate" },
];

function inGroup(med: Pick<MedicationEntry, "name" | "genericName">, group: string): boolean {
  const text = `${med.genericName} ${med.name}`.toLowerCase();
  return GROUPS[group].some((fragment) =>
    fragment === "pril" || fragment === "sartan" ? new RegExp(`[a-z]${fragment}\\b`).test(text) : text.includes(fragment)
  );
}

export function findKnownInteractions(meds: Pick<MedicationEntry, "name" | "genericName">[]): KnownInteraction[] {
  const found: KnownInteraction[] = [];
  for (const rule of RULES) {
    for (const a of meds.filter((m) => inGroup(m, rule.a))) {
      for (const b of meds.filter((m) => inGroup(m, rule.b))) {
        found.push({ medicines: [a.name, b.name], severity: "serious", adviceKey: rule.adviceKey });
      }
    }
  }
  return found;
}
