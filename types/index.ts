export type Language = "en" | "bm" | "zh" | "ta";

/**
 * "unknown" means the report gave no flag or range to judge by. It must never
 * be shown as normal.
 */
export type MarkerStatus = "normal" | "high" | "low" | "abnormal" | "critical" | "unknown";

export interface KeyMarker {
  value: string | number;
  unit?: string;
  status?: MarkerStatus;
  /** Reference range exactly as printed on the report, e.g. "3.9 - 6.0". */
  referenceRange?: string;
}

export interface ReportRecord {
  id: string;
  date: string;
  fileName: string;
  fileType: string;
  rawBase64?: string;
  summary: {
    en: string;
    bm: string;
    zh: string;
    ta: string;
  };
  keyMarkers: Record<string, KeyMarker>;
  createdAt: number;
  /** The AI judged that something on the report needs same-day medical attention. */
  urgent?: boolean;
}

export interface PillInfo {
  name: string;
  genericName: string;
  purpose: string;
  dosage: string;
  sideEffects: string[];
  foodInteractions: string[];
  drugInteractions: string[];
}

export interface PillRecord {
  id: string;
  date: string;
  imageBase64?: string;
  analysis: {
    pills: PillInfo[];
    crossRefWithReports?: string;
  };
  createdAt: number;
  /** Language the analysis was written in. Missing on records made before this was tracked. */
  language?: Language;
  /** Cached translations of `analysis`, filled in when viewed in another language. */
  translations?: Partial<Record<Language, PillRecord["analysis"]>>;
}

export interface MealRecord {
  id: string;
  date: string;
  inputType: "photo" | "text";
  imageBase64?: string;
  textInput?: string;
  analysis: {
    dishes: string[];
    advice: string;
    healthScore: number;
  };
  createdAt: number;
  /** Language the analysis was written in. Missing on records made before this was tracked. */
  language?: Language;
  /** Cached translations of `analysis`, filled in when viewed in another language. */
  translations?: Partial<Record<Language, MealRecord["analysis"]>>;
}

export type DrAishaExpression = "neutral" | "speaking" | "smiling";

export interface GuideState {
  hasCompletedOnboarding: boolean;
  updatedAt?: number;
}

export interface OnboardingStep {
  id: string;
  title: Record<Language, string>;
  speech: Record<Language, string>;
  expression: DrAishaExpression;
}

export interface GuideChoice {
  id: string;
  label: string;
  reply: string;
  expression?: DrAishaExpression;
  isGlobal?: boolean;
}

export interface GuideHint {
  id: string;
  speech: string;
  index: number;
}
