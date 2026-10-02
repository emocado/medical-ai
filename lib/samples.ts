import type { StringKey } from "@/lib/i18n";

/** Fictional, watermarked demo files served from public/samples/. */
export interface SampleFile {
  id: string;
  kind: "report" | "pill" | "meal";
  path: string;
  fileName: string;
  mimeType: string;
  label: StringKey;
}

export const SAMPLE_FILES: SampleFile[] = [
  {
    id: "report-march",
    kind: "report",
    path: "/samples/report-2026-03-checkup.pdf",
    fileName: "report-2026-03-checkup.pdf",
    mimeType: "application/pdf",
    label: "samples.report.march",
  },
  {
    id: "report-september",
    kind: "report",
    path: "/samples/report-2026-09-followup.pdf",
    fileName: "report-2026-09-followup.pdf",
    mimeType: "application/pdf",
    label: "samples.report.september",
  },
  {
    id: "report-urgent",
    kind: "report",
    path: "/samples/report-2026-09-urgent.png",
    fileName: "report-2026-09-urgent.png",
    mimeType: "image/png",
    label: "samples.report.urgent",
  },
  {
    id: "pills-regimen",
    kind: "pill",
    path: "/samples/pills-daily-regimen.png",
    fileName: "pills-daily-regimen.png",
    mimeType: "image/png",
    label: "samples.pills.regimen",
  },
  {
    id: "pill-antibiotic",
    kind: "pill",
    path: "/samples/pill-clarithromycin.png",
    fileName: "pill-clarithromycin.png",
    mimeType: "image/png",
    label: "samples.pills.antibiotic",
  },
  {
    id: "meal-nasi-lemak",
    kind: "meal",
    path: "/samples/meal-nasi-lemak.jpg",
    fileName: "meal-nasi-lemak.jpg",
    mimeType: "image/jpeg",
    label: "samples.meal.nasiLemak",
  },
  {
    id: "meal-chicken-rice",
    kind: "meal",
    path: "/samples/meal-chicken-rice.jpg",
    fileName: "meal-chicken-rice.jpg",
    mimeType: "image/jpeg",
    label: "samples.meal.chickenRice",
  },
  {
    id: "meal-roti-canai",
    kind: "meal",
    path: "/samples/meal-roti-canai.jpg",
    fileName: "meal-roti-canai.jpg",
    mimeType: "image/jpeg",
    label: "samples.meal.rotiCanai",
  },
];

/** Typed meal descriptions; the third one triggers a grapefruit–statin warning. */
export const SAMPLE_MEAL_TEXTS: StringKey[] = ["samples.mealText.1", "samples.mealText.2", "samples.mealText.3"];

export const SAMPLE_QUESTIONS: StringKey[] = ["chat.suggest.1", "chat.suggest.2", "chat.suggest.3"];

export function samplesOfKind(kind: SampleFile["kind"]): SampleFile[] {
  return SAMPLE_FILES.filter((s) => s.kind === kind);
}

/** Fetches a sample so it can go through exactly the same upload path as a user's file. */
export async function loadSampleFile(sample: SampleFile): Promise<File> {
  const res = await fetch(sample.path);
  if (!res.ok) throw new Error(`Could not load sample ${sample.path}`);
  const blob = await res.blob();
  return new File([blob], sample.fileName, { type: sample.mimeType });
}
