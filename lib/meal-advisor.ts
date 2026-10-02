import { getGeminiClient, GEMINI_FLASH_MODEL } from "./gemini";
import { buildHealthMatePrompt, ensureDisclaimer } from "./prompts";
import { cleanJsonText } from "./report-analyzer";
import type { Language, MealRecord, PillRecord, ReportRecord, MedicationEntry } from "@/types";

export function parseMealResponse(
  rawText: string,
  inputType: "photo" | "text",
  extra?: { imageBase64?: string; textInput?: string },
  language: Language = "en"
): MealRecord {
  const cleaned = cleanJsonText(rawText);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse meal advice response: ${err instanceof Error ? err.message : String(err)}`);
  }

  const rawDishes = Array.isArray(parsed.dishes) ? parsed.dishes : [];
  const dishes: string[] = rawDishes.map((d: any) => String(d).trim()).filter(Boolean);

  const advice = ensureDisclaimer(parsed.advice || "Meal analysis completed.", language);

  // A missing or non-numeric score stays null: showing a made-up number would mislead.
  const rawScore = parsed.healthScore;
  const scoreNum = typeof rawScore === "number" || (typeof rawScore === "string" && rawScore.trim() !== "") ? Number(rawScore) : NaN;
  const healthScore = Number.isFinite(scoreNum) ? Math.max(0, Math.min(100, Math.round(scoreNum))) : null;

  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];

  return {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `meal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: dateStr,
    inputType,
    imageBase64: extra?.imageBase64,
    textInput: extra?.textInput,
    analysis: {
      dishes: dishes.length > 0 ? dishes : ["General Meal"],
      advice,
      healthScore,
    },
    createdAt: Date.now(),
    language,
  };
}

export async function analyzeMealWithGemini(params: {
  inputType: "photo" | "text";
  imageBase64?: string;
  mimeType?: string;
  textInput?: string;
  latestReport?: ReportRecord | null;
  knownPills?: PillRecord[] | null;
  medications?: MedicationEntry[] | null;
  language?: Language;
}): Promise<MealRecord> {
  const client = getGeminiClient();

  const systemPrompt = buildHealthMatePrompt({
    language: params.language,
    latestReport: params.latestReport,
    knownPills: params.knownPills,
    medications: params.medications,
    extraInstructions: `You are providing dietary guidance on a meal for an elderly patient.
You are familiar with local Malaysian meals and hawker foods (such as Nasi Lemak, Roti Canai, Char Kway Teow, Hainan Chicken Rice, Bak Kut Teh, Economy Rice / Mixed Rice, Yong Tau Foo, Thosai, Congee, Teh Tarik, etc.), as well as everyday home-cooked dishes.

Analyze the meal input in light of the patient's existing health context (e.g. blood sugar/diabetes, blood pressure/hypertension, cholesterol, renal markers, and any medication food interactions like grapefruit or excess sodium/sugar).

Return a JSON object with:
1. "dishes": array of identified dish or food item names.
2. "healthScore": an integer score from 0 to 100 representing how suitable and healthy this meal is for THIS patient's specific health profile (100 = completely suitable and nourishing, <50 = caution or high risk).
3. "advice": clear, encouraging, elderly-safe dietary guidance explaining:
   - What parts of this meal are good for them.
   - Any ingredients to be mindful of (e.g. santan/coconut milk, sodium, sugar, fried batter).
   - Practical suggestions (e.g., "Ask for less gravy", "Eat more of the steamed vegetables", "Avoid drinking the sweet syrup").
   - Explicitly connect to their health context (e.g., "Since your recent blood test showed borderline high glucose, avoid sweetened drinks with this meal").

Return ONLY valid JSON matching { "dishes": [...], "healthScore": 75, "advice": "..." }.`,
  });

  const parts: any[] = [];
  if (params.inputType === "photo" && params.imageBase64 && params.mimeType) {
    parts.push({
      inlineData: {
        mimeType: params.mimeType,
        data: params.imageBase64,
      },
    });
  }

  const promptText =
    params.inputType === "text"
      ? `Meal description from patient: "${params.textInput || ""}"\n\n${systemPrompt}`
      : systemPrompt;

  parts.push({ text: promptText });

  const response = await client.models.generateContent({
    model: GEMINI_FLASH_MODEL,
    contents: [
      {
        role: "user",
        parts,
      },
    ],
    config: {
      responseMimeType: "application/json",
    },
  });

  const responseText = response.text || "";
  return parseMealResponse(responseText, params.inputType, {
    imageBase64: params.imageBase64,
    textInput: params.textInput,
  }, params.language);
}
