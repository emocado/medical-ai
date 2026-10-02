export type Language = "en" | "bm" | "zh" | "ta";

export interface KeyMarker {
  value: string | number;
  unit?: string;
  status?: "normal" | "high" | "low" | "abnormal" | string;
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
