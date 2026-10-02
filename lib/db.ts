import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ReportRecord, PillRecord, MealRecord, GuideState, MedicationEntry, DoseLog } from "@/types";
import { requestPersistentStorage } from "./backup";

interface HealthMateDB extends DBSchema {
  reports: {
    key: string;
    value: ReportRecord;
    indexes: { "by-created": number };
  };
  pills: {
    key: string;
    value: PillRecord;
    indexes: { "by-created": number };
  };
  meals: {
    key: string;
    value: MealRecord;
    indexes: { "by-created": number };
  };
  medications: {
    key: string;
    value: MedicationEntry;
  };
  doses: {
    key: string;
    value: DoseLog;
    indexes: { "by-date": string };
  };
  guide: {
    key: string;
    value: GuideState;
  };
}

const DB_NAME = "healthmate_db";
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<HealthMateDB>> | null = null;

export function initDB(): Promise<IDBPDatabase<HealthMateDB>> {
  if (!dbPromise) {
    dbPromise = openDB<HealthMateDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("reports")) {
          const reportStore = db.createObjectStore("reports", { keyPath: "id" });
          reportStore.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("pills")) {
          const pillStore = db.createObjectStore("pills", { keyPath: "id" });
          pillStore.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("meals")) {
          const mealStore = db.createObjectStore("meals", { keyPath: "id" });
          mealStore.createIndex("by-created", "createdAt");
        }
        if (!db.objectStoreNames.contains("medications")) {
          db.createObjectStore("medications", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("doses")) {
          const doseStore = db.createObjectStore("doses", { keyPath: "key" });
          doseStore.createIndex("by-date", "date");
        }
        if (!db.objectStoreNames.contains("guide")) {
          db.createObjectStore("guide");
        }
      },
    });
  }
  return dbPromise;
}

/** Milliseconds for a YYYY-MM-DD report date, or NaN when it can't be read. */
function reportDateValue(report: ReportRecord): number {
  return new Date(report.date).getTime();
}

/**
 * Newest first by the date printed on the report (when the test was done),
 * not by when it was uploaded, so an old report uploaded today doesn't become
 * the "latest". Reports without a readable date go last.
 */
export function sortReportsNewestFirst(reports: ReportRecord[]): ReportRecord[] {
  return [...reports].sort((a, b) => {
    const da = reportDateValue(a);
    const db = reportDateValue(b);
    if (Number.isNaN(da) !== Number.isNaN(db)) return Number.isNaN(da) ? 1 : -1;
    if (!Number.isNaN(da) && da !== db) return db - da;
    return b.createdAt - a.createdAt;
  });
}

// Reports
export async function saveReport(report: ReportRecord): Promise<void> {
  const db = await initDB();
  await db.put("reports", report);
  void requestPersistentStorage();
}

export async function getReport(id: string): Promise<ReportRecord | undefined> {
  const db = await initDB();
  return db.get("reports", id);
}

export async function getAllReports(): Promise<ReportRecord[]> {
  const db = await initDB();
  return sortReportsNewestFirst(await db.getAll("reports"));
}

export async function deleteReport(id: string): Promise<void> {
  const db = await initDB();
  await db.delete("reports", id);
}

// Pills
export async function savePillRecord(pill: PillRecord): Promise<void> {
  const db = await initDB();
  await db.put("pills", pill);
  void requestPersistentStorage();
}

export async function getPillRecord(id: string): Promise<PillRecord | undefined> {
  const db = await initDB();
  return db.get("pills", id);
}

export async function getAllPillRecords(): Promise<PillRecord[]> {
  const db = await initDB();
  const all = await db.getAllFromIndex("pills", "by-created");
  return all.reverse(); // Newest first
}
export async function deletePillRecord(id: string): Promise<void> {
  const db = await initDB();
  await db.delete("pills", id);
}

// Meals
export async function saveMealRecord(meal: MealRecord): Promise<void> {
  const db = await initDB();
  await db.put("meals", meal);
  void requestPersistentStorage();
}

export async function getMealRecord(id: string): Promise<MealRecord | undefined> {
  const db = await initDB();
  return db.get("meals", id);
}

export async function getAllMealRecords(): Promise<MealRecord[]> {
  const db = await initDB();
  const all = await db.getAllFromIndex("meals", "by-created");
  return all.reverse(); // Newest first
}
export async function deleteMealRecord(id: string): Promise<void> {
  const db = await initDB();
  await db.delete("meals", id);
}

// Doctor Guide State
const GUIDE_STATE_KEY = "current_state";

export async function getGuideState(): Promise<GuideState | undefined> {
  const db = await initDB();
  return db.get("guide", GUIDE_STATE_KEY);
}

export async function saveGuideState(state: Partial<GuideState>): Promise<void> {
  const db = await initDB();
  const current = (await db.get("guide", GUIDE_STATE_KEY)) || {
    hasCompletedOnboarding: false,
  };
  await db.put("guide", {
    ...current,
    ...state,
    updatedAt: Date.now(),
  }, GUIDE_STATE_KEY);
}

export async function hasCompletedOnboarding(): Promise<boolean> {
  const state = await getGuideState();
  return Boolean(state?.hasCompletedOnboarding);
}

export async function setCompletedOnboarding(completed: boolean): Promise<void> {
  await saveGuideState({ hasCompletedOnboarding: completed });
}

// Backup & restore
export interface AllData {
  reports: ReportRecord[];
  pills: PillRecord[];
  meals: MealRecord[];
  medications: MedicationEntry[];
  doses: DoseLog[];
}

export async function exportAllData(): Promise<AllData> {
  const db = await initDB();
  const [reports, pills, meals, medications, doses] = await Promise.all([
    db.getAll("reports"),
    db.getAll("pills"),
    db.getAll("meals"),
    db.getAll("medications"),
    db.getAll("doses"),
  ]);
  return { reports, pills, meals, medications, doses };
}

/** Writes backup records into the database; records with the same id are replaced. Returns how many were written. */
export async function importAllData(data: AllData): Promise<number> {
  const db = await initDB();
  const tx = db.transaction(["reports", "pills", "meals", "medications", "doses"], "readwrite");
  await Promise.all([
    ...data.reports.map((r) => tx.objectStore("reports").put(r)),
    ...data.pills.map((p) => tx.objectStore("pills").put(p)),
    ...data.meals.map((m) => tx.objectStore("meals").put(m)),
    ...data.medications.map((m) => tx.objectStore("medications").put(m)),
    ...data.doses.map((d) => tx.objectStore("doses").put(d)),
    tx.done,
  ]);
  return data.reports.length + data.pills.length + data.meals.length + data.medications.length;
}

// Medications the patient has confirmed they take
export async function saveMedication(med: MedicationEntry): Promise<void> {
  const db = await initDB();
  await db.put("medications", med);
  void requestPersistentStorage();
}

/** Active medicines first, each group newest first. */
export async function getAllMedications(): Promise<MedicationEntry[]> {
  const db = await initDB();
  const all = await db.getAll("medications");
  return all.sort((a, b) => Number(b.active) - Number(a.active) || b.createdAt - a.createdAt);
}

export async function deleteMedication(id: string): Promise<void> {
  const db = await initDB();
  await db.delete("medications", id);
}

export async function getDoseLogsForDate(date: string): Promise<DoseLog[]> {
  const db = await initDB();
  return db.getAllFromIndex("doses", "by-date", date);
}

export async function setDoseTaken(log: Omit<DoseLog, "takenAt">, taken: boolean): Promise<void> {
  const db = await initDB();
  if (taken) {
    await db.put("doses", { ...log, takenAt: Date.now() });
  } else {
    await db.delete("doses", log.key);
  }
}
