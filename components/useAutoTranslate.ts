"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/api-client";
import type { Language } from "@/types";

export interface Translatable<A> {
  id: string;
  analysis: A;
  language?: Language;
  translations?: Partial<Record<Language, A>>;
}

/** Returns the analysis in `language`, or null when it still needs translating. */
export function localizedAnalysis<A>(record: Translatable<A>, language: Language): A | null {
  // Records saved before the language was tracked are treated as English.
  if ((record.language ?? "en") === language) return record.analysis;
  return record.translations?.[language] ?? null;
}

const BATCH_SIZE = 10;

/**
 * Translates any of `records` not yet available in `language` (one request per
 * batch), persists the cached translation with `save`, and reports the updated
 * records through `onUpdated`.
 */
export function useAutoTranslate<R extends Translatable<any>>(
  records: R[],
  language: Language,
  save: (record: R) => Promise<void>,
  onUpdated: (records: R[]) => void,
  postProcess: (analysis: R["analysis"]) => R["analysis"] = (a) => a
) {
  const [status, setStatus] = useState<"idle" | "translating" | "error">("idle");
  const [attempt, setAttempt] = useState(0);
  const inflightKey = useRef<string | null>(null);
  const callbacks = useRef({ save, onUpdated, postProcess });
  callbacks.current = { save, onUpdated, postProcess };

  useEffect(() => {
    const pending = records.filter((r) => !localizedAnalysis(r, language)).slice(0, BATCH_SIZE);
    if (pending.length === 0) {
      setStatus("idle");
      return;
    }

    const key = `${language}:${pending.map((r) => r.id).join(",")}:${attempt}`;
    if (inflightKey.current === key) return;
    inflightKey.current = key;
    setStatus("translating");

    postJson<{ content: R["analysis"][] }>("/api/translate", {
      content: pending.map((r) => r.analysis),
      targetLanguage: language,
    })
      .then(async ({ content }) => {
        const updated = pending.map((r, i) => ({
          ...r,
          translations: {
            ...r.translations,
            [language]: callbacks.current.postProcess(content[i] ?? r.analysis),
          },
        }));
        await Promise.all(updated.map((r) => callbacks.current.save(r)));
        callbacks.current.onUpdated(updated);
        setStatus("idle");
      })
      .catch((err) => {
        console.error("Translation failed:", err);
        setStatus("error");
      })
      .finally(() => {
        if (inflightKey.current === key) inflightKey.current = null;
      });
  }, [records, language, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { status, retry };
}
