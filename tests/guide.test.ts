import "fake-indexeddb/auto";
import { describe, it, expect, beforeEach } from "vitest";
import {
  initDB,
  getGuideState,
  saveGuideState,
  hasCompletedOnboarding,
  setCompletedOnboarding,
} from "@/lib/db";
import {
  ONBOARDING_STEPS,
  CONTEXTUAL_GUIDE_CHOICES,
  IDLE_HINTS,
} from "@/lib/guide-scripts";
import {
  shouldShowOnboarding,
  advanceOnboardingStep,
  getNextCooldown,
  selectIdleHint,
  selectDialogueChoices,
} from "@/lib/guide-controller";
import type { Language } from "@/types";

describe("Doctor Guide (Dr. Aisha) - Domain & State Controller", () => {
  beforeEach(async () => {
    await initDB();
  });

  describe("IndexedDB Guide State Persistence", () => {
    it("defaults to onboarding incomplete when no state exists", async () => {
      const completed = await hasCompletedOnboarding();
      expect(completed).toBe(false);
    });

    it("saves and retrieves completed onboarding state", async () => {
      await setCompletedOnboarding(true);
      const completed = await hasCompletedOnboarding();
      expect(completed).toBe(true);

      const state = await getGuideState();
      expect(state).toBeDefined();
      expect(state?.hasCompletedOnboarding).toBe(true);
    });

    it("can toggle or reset onboarding completion", async () => {
      await setCompletedOnboarding(true);
      expect(await hasCompletedOnboarding()).toBe(true);

      await setCompletedOnboarding(false);
      expect(await hasCompletedOnboarding()).toBe(false);
    });
  });

  describe("Onboarding Walkthrough Flow Controller", () => {
    it("determines whether onboarding should display", () => {
      expect(shouldShowOnboarding(undefined)).toBe(true);
      expect(shouldShowOnboarding({ hasCompletedOnboarding: false })).toBe(true);
      expect(shouldShowOnboarding({ hasCompletedOnboarding: true })).toBe(false);
    });

    it("advances through all 4 onboarding steps sequentially", () => {
      const totalSteps = ONBOARDING_STEPS.length;
      expect(totalSteps).toBe(4);

      let step = 0;
      let res = advanceOnboardingStep(step, totalSteps);
      expect(res.nextStep).toBe(1);
      expect(res.isComplete).toBe(false);

      res = advanceOnboardingStep(1, totalSteps);
      expect(res.nextStep).toBe(2);
      expect(res.isComplete).toBe(false);

      res = advanceOnboardingStep(2, totalSteps);
      expect(res.nextStep).toBe(3);
      expect(res.isComplete).toBe(false);

      res = advanceOnboardingStep(3, totalSteps);
      expect(res.isComplete).toBe(true);
    });

    it("contains verified scripts in all 4 languages for each onboarding step", () => {
      const languages: Language[] = ["en", "bm", "zh", "ta"];

      for (const step of ONBOARDING_STEPS) {
        expect(step.id).toBeDefined();
        for (const lang of languages) {
          expect(step.title[lang]).toBeTruthy();
          expect(step.speech[lang]).toBeTruthy();
          expect(step.speech[lang].length).toBeGreaterThan(10);
        }
      }
    });
  });

  describe("Cooldown Escalation Policy", () => {
    it("escalates idle interval upon successive dismissals (30s -> 60s -> 120s -> stopped)", () => {
      // 0 dismissals: initial 30s
      let result = getNextCooldown(30, 0);
      expect(result.nextCooldown).toBe(60);
      expect(result.isStopped).toBe(false);

      // 1 dismissal: 60s -> 120s
      result = getNextCooldown(60, 1);
      expect(result.nextCooldown).toBe(120);
      expect(result.isStopped).toBe(false);

      // 2 dismissals: 120s -> halted
      result = getNextCooldown(120, 2);
      expect(result.isStopped).toBe(true);

      // 3+ dismissals: halted
      result = getNextCooldown(120, 3);
      expect(result.isStopped).toBe(true);
    });
  });

  describe("Contextual Choice Selection & Progressive Hints", () => {
    it("provides 3 choices on each primary page (2 contextual + 1 global overview)", () => {
      const paths = ["/reports", "/pills", "/timeline"];
      for (const path of paths) {
        const choices = selectDialogueChoices(path, "en");
        expect(choices.length).toBe(3);
        // Last choice is always the global overview
        expect(choices[2].isGlobal).toBe(true);
        expect(choices[0].label).toBeTruthy();
        expect(choices[0].reply).toBeTruthy();
      }
    });

    it("selects appropriate hints based on data existence (progressive discovery)", () => {
      // Without reports: should suggest uploading report
      const emptyHint = selectIdleHint({
        path: "/reports",
        hasReports: false,
        hasPills: false,
        lang: "en",
      });
      expect(emptyHint.speech).toMatch(/photo|camera|upload/i);

      // With reports: should suggest asking questions or reviewing markers
      const populatedHint = selectIdleHint({
        path: "/reports",
        hasReports: true,
        hasPills: false,
        lang: "en",
      });
      expect(populatedHint.speech).toMatch(/question|summary|biomarker|chat/i);
    });

    it("rotates hints avoiding immediate repetition when multiple hints exist", () => {
      const first = selectIdleHint({
        path: "/pills",
        hasReports: false,
        hasPills: false,
        lang: "en",
        lastHintIndex: 0,
      });

      const second = selectIdleHint({
        path: "/pills",
        hasReports: false,
        hasPills: false,
        lang: "en",
        lastHintIndex: first.index,
      });

      expect(second.index).not.toBe(first.index);
    });

    it("delivers verified dialogue choices in all 4 languages", () => {
      const languages: Language[] = ["en", "bm", "zh", "ta"];
      const routes = ["/reports", "/pills", "/timeline"];

      for (const lang of languages) {
        for (const route of routes) {
          const choices = selectDialogueChoices(route, lang);
          expect(choices.length).toBe(3);
          for (const choice of choices) {
            expect(choice.label).toBeTruthy();
            expect(choice.reply).toBeTruthy();
            expect(choice.reply.length).toBeGreaterThan(15);
          }
        }
      }
    });
  });
});
