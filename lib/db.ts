import { openDB, DBSchema, IDBPDatabase } from "idb";
import type { ReportRecord, PillRecord, MealRecord } from "@/types";

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
}

const DB_NAME = "healthmate_db";
const DB_VERSION = 1;

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
      },
    });
  }
  return dbPromise;
}

// Reports
export async function saveReport(report: ReportRecord): Promise<void> {
  const db = await initDB();
  await db.put("reports", report);
}

export async function getReport(id: string): Promise<ReportRecord | undefined> {
  const db = await initDB();
  return db.get("reports", id);
}

export async function getAllReports(): Promise<ReportRecord[]> {
  const db = await initDB();
  const all = await db.getAllFromIndex("reports", "by-created");
  return all.reverse(); // Newest first
}

export async function deleteReport(id: string): Promise<void> {
  const db = await initDB();
  await db.delete("reports", id);
}

// Pills
export async function savePillRecord(pill: PillRecord): Promise<void> {
  const db = await initDB();
  await db.put("pills", pill);
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

// Meals
export async function saveMealRecord(meal: MealRecord): Promise<void> {
  const db = await initDB();
  await db.put("meals", meal);
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
