"use client";

import React from "react";
import { Download, FlaskConical, ListChecks } from "lucide-react";
import { Header } from "@/components/Header";
import { useT } from "@/components/LanguageProvider";
import type { StringKey } from "@/lib/i18n";
import { SAMPLE_MEAL_TEXTS } from "@/lib/samples";

interface DownloadableSample {
  label: StringKey;
  thumbnail: string;
  downloads: { type: string; href: string }[];
}

const SECTIONS: { title: StringKey; items: DownloadableSample[] }[] = [
  {
    title: "samples.section.reports",
    items: [
      {
        label: "samples.report.march",
        thumbnail: "/samples/report-2026-03-checkup.png",
        downloads: [
          { type: "PDF", href: "/samples/report-2026-03-checkup.pdf" },
          { type: "PNG", href: "/samples/report-2026-03-checkup.png" },
        ],
      },
      {
        label: "samples.report.september",
        thumbnail: "/samples/report-2026-09-followup.png",
        downloads: [
          { type: "PDF", href: "/samples/report-2026-09-followup.pdf" },
          { type: "PNG", href: "/samples/report-2026-09-followup.png" },
        ],
      },
      {
        label: "samples.report.urgent",
        thumbnail: "/samples/report-2026-09-urgent.png",
        downloads: [{ type: "PNG", href: "/samples/report-2026-09-urgent.png" }],
      },
    ],
  },
  {
    title: "samples.section.pills",
    items: [
      {
        label: "samples.pills.regimen",
        thumbnail: "/samples/pills-daily-regimen.png",
        downloads: [{ type: "PNG", href: "/samples/pills-daily-regimen.png" }],
      },
      {
        label: "samples.pills.antibiotic",
        thumbnail: "/samples/pill-clarithromycin.png",
        downloads: [{ type: "PNG", href: "/samples/pill-clarithromycin.png" }],
      },
    ],
  },
  {
    title: "samples.section.meals",
    items: [
      {
        label: "samples.meal.nasiLemak",
        thumbnail: "/samples/meal-nasi-lemak.jpg",
        downloads: [{ type: "JPG", href: "/samples/meal-nasi-lemak.jpg" }],
      },
      {
        label: "samples.meal.chickenRice",
        thumbnail: "/samples/meal-chicken-rice.jpg",
        downloads: [{ type: "JPG", href: "/samples/meal-chicken-rice.jpg" }],
      },
      {
        label: "samples.meal.rotiCanai",
        thumbnail: "/samples/meal-roti-canai.jpg",
        downloads: [{ type: "JPG", href: "/samples/meal-roti-canai.jpg" }],
      },
    ],
  },
];

const STEPS: StringKey[] = [
  "samples.step.reports",
  "samples.step.compare",
  "samples.step.urgent",
  "samples.step.pills",
  "samples.step.meals",
  "samples.step.visit",
  "samples.step.language",
];

export default function SamplesPage() {
  const t = useT();

  return (
    <div className="space-y-6">
      <Header title={t("samples.title")} />

      <section className="card p-5 sm:p-6 space-y-4 !bg-violet-50 ring-1 ring-inset ring-violet-200">
        <p className="text-base text-violet-950 font-medium leading-relaxed flex gap-3">
          <FlaskConical className="w-6 h-6 text-violet-700 flex-shrink-0" aria-hidden="true" />
          {t("samples.intro")}
        </p>
        <div>
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2 mb-2">
            <ListChecks className="w-6 h-6 text-violet-700" aria-hidden="true" />
            {t("samples.steps.title")}
          </h2>
          <ol className="list-decimal pl-6 space-y-2 text-base text-ink-secondary leading-relaxed marker:text-violet-700 marker:font-semibold">
            {STEPS.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ol>
        </div>
      </section>

      {SECTIONS.map((section) => (
        <section key={section.title} className="space-y-3">
          <h2 className="text-xl font-bold text-ink">{t(section.title)}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
            {section.items.map((item) => (
              <article
                key={item.thumbnail}
                className="card overflow-hidden flex flex-col"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.thumbnail}
                  alt={t(item.label)}
                  className="w-full h-36 lg:h-44 object-cover object-top bg-canvas outline outline-1 -outline-offset-1 outline-black/10"
                  loading="lazy"
                />
                <div className="p-4 space-y-3 flex-1 flex flex-col">
                  <h3 className="text-base font-semibold text-ink">{t(item.label)}</h3>
                  <div className="flex flex-wrap gap-2 mt-auto">
                    {item.downloads.map((d) => (
                      <a
                        key={d.href}
                        href={d.href}
                        download
                        className="btn btn-tinted text-base px-4 min-h-[48px]"
                      >
                        <Download className="w-5 h-5" aria-hidden="true" />
                        {t("samples.download", { type: d.type })}
                      </a>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-ink">{t("samples.section.mealTexts")}</h2>
        <ul className="grid gap-2 lg:grid-cols-2">
          {SAMPLE_MEAL_TEXTS.map((key) => (
            <li
              key={key}
              className="card !rounded-2xl p-4 text-base text-ink-secondary select-all"
            >
              {t(key)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
