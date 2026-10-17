import type { Language, GuideState, GuideChoice, GuideHint } from "@/types";
import {
  CONTEXTUAL_GUIDE_CHOICES,
  GLOBAL_OVERVIEW_CHOICE,
  IDLE_HINTS,
} from "./guide-scripts";

export function shouldShowOnboarding(guideState: GuideState | undefined): boolean {
  return !guideState || !guideState.hasCompletedOnboarding;
}

export function advanceOnboardingStep(
  currentStep: number,
  totalSteps: number
): { nextStep: number; isComplete: boolean } {
  const next = currentStep + 1;
  return {
    nextStep: next,
    isComplete: next >= totalSteps,
  };
}

export function getNextCooldown(
  currentCooldown: number,
  dismissCount: number
): { nextCooldown: number; isStopped: boolean } {
  if (dismissCount >= 2) {
    return {
      nextCooldown: currentCooldown,
      isStopped: true,
    };
  }
  return {
    nextCooldown: currentCooldown * 2,
    isStopped: false,
  };
}

export function selectDialogueChoices(path: string, lang: Language): GuideChoice[] {
  // The medicines hub shares the scanner's help content.
  const scriptPath = path.startsWith("/medicines") ? "/pills" : path;
  const routeChoices =
    CONTEXTUAL_GUIDE_CHOICES[scriptPath]?.choices[lang] || CONTEXTUAL_GUIDE_CHOICES["/reports"].choices[lang];
  const globalOverview = GLOBAL_OVERVIEW_CHOICE[lang] || GLOBAL_OVERVIEW_CHOICE.en;

  const choices: GuideChoice[] = routeChoices.map((c) => ({
    id: c.id,
    label: c.label,
    reply: c.reply,
    expression: c.expression,
    isGlobal: false,
  }));

  choices.push({
    id: "global_overview",
    label: globalOverview.label,
    reply: globalOverview.reply,
    expression: "smiling",
    isGlobal: true,
  });

  return choices;
}

export function selectIdleHint(params: {
  path: string;
  hasReports: boolean;
  hasPills: boolean;
  lang: Language;
  lastHintIndex?: number;
}): GuideHint {
  const { path, hasReports, lang, lastHintIndex } = params;

  let hintPool: string[] = [];
  let category = "reports";

  if (path.startsWith("/pills") || path.startsWith("/medicines")) {
    category = "pills";
    hintPool = IDLE_HINTS.pills.all[lang] || IDLE_HINTS.pills.all.en;
  } else if (path.startsWith("/timeline")) {
    category = "timeline";
    hintPool = IDLE_HINTS.timeline.all[lang] || IDLE_HINTS.timeline.all.en;
  } else {
    category = "reports";
    if (hasReports) {
      hintPool = IDLE_HINTS.reports.populated[lang] || IDLE_HINTS.reports.populated.en;
    } else {
      hintPool = IDLE_HINTS.reports.empty[lang] || IDLE_HINTS.reports.empty.en;
    }
  }

  let index = 0;
  if (hintPool.length > 1 && lastHintIndex !== undefined) {
    index = (lastHintIndex + 1) % hintPool.length;
  }

  return {
    id: `${category}_hint_${index}`,
    speech: hintPool[index] || hintPool[0],
    index,
  };
}
