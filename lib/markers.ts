/**
 * Canonical lab markers. Labs and the AI name the same test differently
 * ("FBS", "Fasting Plasma Glucose", "Glucose, fasting"), so every marker is
 * mapped to a stable id before it is compared, trended or safety-checked.
 */

export type MarkerId =
  | "hba1c"
  | "fasting_glucose"
  | "random_glucose"
  | "glucose"
  | "ldl"
  | "hdl"
  | "total_cholesterol"
  | "triglycerides"
  | "egfr"
  | "creatinine"
  | "urea"
  | "sodium"
  | "potassium"
  | "haemoglobin"
  | "wbc"
  | "platelets"
  | "blood_pressure"
  | "bmi";

/**
 * Lower is better for most markers; for these, higher is better. Used to
 * describe a change as improving or worsening.
 */
export const HIGHER_IS_BETTER: ReadonlySet<MarkerId> = new Set<MarkerId>(["hdl", "egfr", "haemoglobin"]);

/** Ordered: more specific patterns must come before generic ones (e.g. HbA1c before Hb). */
const PATTERNS: [MarkerId, RegExp][] = [
  ["hba1c", /\bhba1c\b|\ba1c\b|glycated|glycosylated/],
  ["fasting_glucose", /fasting.*(glucose|sugar)|(glucose|sugar).*fasting|\bfpg\b|\bfbs\b|\bfbg\b/],
  ["random_glucose", /random.*(glucose|sugar)|(glucose|sugar).*random|\brbs\b|\brpg\b|\brbg\b/],
  ["glucose", /glucose|blood sugar/],
  ["ldl", /\bldl\b|low density/],
  ["hdl", /\bhdl\b|high density/],
  ["total_cholesterol", /cholesterol|\btc\b/],
  ["triglycerides", /triglycerid|\btg\b/],
  ["egfr", /\begfr\b|glomerular/],
  ["creatinine", /creatinine/],
  ["urea", /\burea\b|\bbun\b/],
  ["sodium", /sodium|\bna\b/],
  ["potassium", /potassium|\bk\b/],
  ["haemoglobin", /ha?emoglobin|\bhb\b|\bhgb\b/],
  ["wbc", /white (blood )?cell|\bwbc\b|leucocyte|leukocyte/],
  ["platelets", /platelet|\bplt\b/],
  ["blood_pressure", /blood pressure|\bbp\b/],
  ["bmi", /\bbmi\b|body mass/],
];

export function normalizeMarkerName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function canonicalMarkerId(name: string): MarkerId | null {
  const normalized = normalizeMarkerName(name);
  for (const [id, pattern] of PATTERNS) {
    if (pattern.test(normalized)) return id;
  }
  return null;
}

/** First number in a value such as "7.8", "6.4 mmol/L" or "<5.2". */
export function numericValue(value: string | number): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
  return match ? parseFloat(match[0]) : null;
}

/** "148/92" → { systolic: 148, diastolic: 92 }. */
export function parseBloodPressure(value: string | number): { systolic: number; diastolic: number } | null {
  const match = String(value).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
  return match ? { systolic: Number(match[1]), diastolic: Number(match[2]) } : null;
}

/**
 * Converts a value to the unit the app reasons in (mmol/L for glucose and
 * lipids, g/dL for haemoglobin, µmol/L for creatinine). Unknown units pass
 * through unchanged.
 */
export function toStandardUnit(id: MarkerId, value: number, unit = ""): number {
  const u = unit.toLowerCase().replace(/\s/g, "");
  if (u.includes("mg/dl")) {
    if (id === "fasting_glucose" || id === "random_glucose" || id === "glucose") return value / 18;
    if (id === "ldl" || id === "hdl" || id === "total_cholesterol") return value / 38.67;
    if (id === "triglycerides") return value / 88.57;
    if (id === "creatinine") return value * 88.4;
  }
  if (id === "haemoglobin" && (u === "g/l" || value > 25)) return value / 10;
  return value;
}

/**
 * Reads a printed reference range such as "3.9 - 6.0", "< 5.2" or "> 90".
 * Returns null for anything ambiguous (e.g. separate male/female ranges) so
 * callers never draw a misleading band.
 */
export function parseReferenceRange(range?: string): { low?: number; high?: number } | null {
  if (!range) return null;
  const text = range.replace(/,/g, "").trim();
  const numbers = text.match(/\d+(\.\d+)?/g);
  if (!numbers) return null;

  const between = text.match(/^(\d+(?:\.\d+)?)\s*[-–—~]\s*(\d+(?:\.\d+)?)(?:\s|$)/);
  if (between) return { low: parseFloat(between[1]), high: parseFloat(between[2]) };
  if (numbers.length !== 1) return null;

  const value = parseFloat(numbers[0]);
  if (/^[<≤]/.test(text)) return { high: value };
  if (/^[>≥]/.test(text)) return { low: value };
  return null;
}
