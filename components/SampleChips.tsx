"use client";

import React from "react";
import Link from "next/link";
import { FlaskConical } from "lucide-react";
import { useT } from "./LanguageProvider";
import { samplesOfKind, type SampleFile } from "@/lib/samples";

interface SampleChipsProps {
  kind: SampleFile["kind"];
  onPick: (sample: SampleFile) => void;
  disabled?: boolean;
}

/** "Just trying it out?" row of sample files that feed the normal upload path. */
export function SampleChips({ kind, onPick, disabled }: SampleChipsProps) {
  const t = useT();

  return (
    <div className="space-y-2 pt-1">
      <p className="text-base font-semibold text-slate-700 flex items-center gap-1.5">
        <FlaskConical className="w-5 h-5 text-violet-700" aria-hidden="true" />
        {t("samples.try")}
      </p>
      <div className="flex flex-wrap gap-2">
        {samplesOfKind(kind).map((sample) => (
          <button
            key={sample.id}
            type="button"
            onClick={() => onPick(sample)}
            disabled={disabled}
            className="px-4 py-2 rounded-xl min-h-[48px] text-base font-semibold border-2 border-violet-300 bg-violet-50 text-violet-950 hover:bg-violet-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t(sample.label)}
          </button>
        ))}
        <Link
          href="/samples"
          className="px-4 py-2 rounded-xl min-h-[48px] text-base font-semibold text-violet-900 underline underline-offset-4 flex items-center"
        >
          {t("samples.allFiles")}
        </Link>
      </div>
    </div>
  );
}
