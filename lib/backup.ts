import type { MealRecord, PillRecord, ReportRecord } from "@/types";

export const BACKUP_FORMAT = "healthmate-backup";
export const BACKUP_VERSION = 1;

export interface HealthMateBackup {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: string;
  reports: ReportRecord[];
  pills: PillRecord[];
  meals: MealRecord[];
}

export function createBackup(data: {
  reports: ReportRecord[];
  pills: PillRecord[];
  meals: MealRecord[];
}): HealthMateBackup {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    ...data,
  };
}

const hasId = (r: unknown): r is { id: string } =>
  typeof r === "object" && r !== null && typeof (r as { id?: unknown }).id === "string";

/**
 * Validates a backup file's text. Throws on anything that isn't a HealthMate
 * backup; records without an id are dropped rather than imported broken.
 */
export function parseBackup(text: string): HealthMateBackup {
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Not valid JSON");
  }
  if (!data || data.format !== BACKUP_FORMAT || typeof data.version !== "number") {
    throw new Error("Not a HealthMate backup");
  }
  if (data.version > BACKUP_VERSION) {
    throw new Error("Backup was made by a newer version of HealthMate");
  }

  const list = (value: unknown) => (Array.isArray(value) ? value.filter(hasId) : []);
  return {
    format: BACKUP_FORMAT,
    version: data.version,
    exportedAt: String(data.exportedAt ?? ""),
    reports: list(data.reports) as ReportRecord[],
    pills: list(data.pills) as PillRecord[],
    meals: list(data.meals) as MealRecord[],
  };
}

/**
 * Asks the browser not to evict this site's data under storage pressure
 * (Safari can clear unused sites after seven days otherwise). Safe to call
 * repeatedly; a no-op where unsupported.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) return false;
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}
