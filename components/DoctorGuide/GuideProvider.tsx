"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { usePathname } from "next/navigation";
import type { Language, DrAishaExpression, GuideChoice } from "@/types";
import {
  hasCompletedOnboarding,
  getAllReports,
  getAllPillRecords,
} from "@/lib/db";
import {
  shouldShowOnboarding,
  getNextCooldown,
  selectDialogueChoices,
  selectIdleHint,
} from "@/lib/guide-controller";
import { playGuideAudio, stopGuideAudio } from "@/lib/guide-audio";
import { OnboardingOverlay } from "./OnboardingOverlay";
import { GuideBubble } from "./GuideBubble";
import { GuideDialogue } from "./GuideDialogue";
import { useLanguage } from "@/components/LanguageProvider";

interface GuideContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  expression: DrAishaExpression;
  isDialogueOpen: boolean;
  isOnboardingOpen: boolean;
  isPlayingAudio: boolean;
  openDialogue: () => void;
  closeDialogue: () => void;
  speak: (text: string, expression?: DrAishaExpression) => void;
  stopSpeech: () => void;
}

const GuideContext = createContext<GuideContextValue | null>(null);

export function useGuide() {
  const ctx = useContext(GuideContext);
  if (!ctx) {
    throw new Error("useGuide must be used within a GuideProvider");
  }
  return ctx;
}

interface GuideProviderProps {
  children: React.ReactNode;
}

const INITIAL_IDLE_SECONDS = 30;

export function GuideProvider({
  children,
}: GuideProviderProps) {
  const pathname = usePathname() || "/reports";

  // Language is app-wide and persisted by LanguageProvider
  const { language, setLanguage } = useLanguage();

  // Guide UI states
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isDialogueOpen, setIsDialogueOpen] = useState(false);
  const [isBubblePulsing, setIsBubblePulsing] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [expression, setExpression] = useState<DrAishaExpression>("neutral");
  const [spokenText, setSpokenText] = useState<string>("");
  const [choices, setChoices] = useState<GuideChoice[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Cooldown Escalation states (session-only)
  const [currentCooldownSec, setCurrentCooldownSec] = useState(INITIAL_IDLE_SECONDS);
  const [dismissCount, setDismissCount] = useState(0);
  const [isIdleStopped, setIsIdleStopped] = useState(false);
  const lastHintIndexRef = useRef<number>(0);

  // Timers and refs
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);


  // Check onboarding completion on initial mount
  useEffect(() => {
    let mounted = true;
    hasCompletedOnboarding()
      .then((completed) => {
        if (mounted && !completed) {
          setIsOnboardingOpen(true);
        }
      })
      .catch((err) => {
        console.error("Error reading onboarding status:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Update choices when pathname or language changes
  useEffect(() => {
    const updatedChoices = selectDialogueChoices(pathname, language);
    setChoices(updatedChoices);
  }, [pathname, language]);

  // Route change cleanup: stop speech & close dialogue
  useEffect(() => {
    stopGuideAudio();
    setIsPlayingAudio(false);
    setIsDialogueOpen(false);
    setIsBubblePulsing(false);
    setExpression("neutral");
    resetIdleTimer();
  }, [pathname]);

  // Language switch during open dialogue: refresh text in new language
  useEffect(() => {
    if (isDialogueOpen && !isPlayingAudio) {
      const defaultGreeting = {
        en: "Hello! I am Dr. Aisha. How can I guide you on this page?",
        bm: "Salam sejahtera! Saya Dr. Aisha. Bagaimana saya boleh bantu anda di halaman ini?",
        zh: "您好！我是爱莎医生。在这页有什么想了解的吗？",
        ta: "வணக்கம்! நான் டாக்டர் ஆயிஷா. இந்த பக்கத்தில் நான் உங்களுக்கு எப்படி உதவலாம்?",
      };
      setSpokenText(defaultGreeting[language] || defaultGreeting.en);
    }
  }, [language, isDialogueOpen, isPlayingAudio]);

  // Virtual keyboard detection: hide bubble when typing
  useEffect(() => {
    function handleFocusIn(e: FocusEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        setIsKeyboardOpen(true);
      }
    }

    function handleFocusOut() {
      setIsKeyboardOpen(false);
    }

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  // Reset & restart idle countdown timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }

    if (isIdleStopped || isOnboardingOpen) return;

    idleTimerRef.current = setTimeout(async () => {
      // Trigger Idle Nudge
      try {
        const [reports, pills] = await Promise.all([
          getAllReports().catch(() => []),
          getAllPillRecords().catch(() => []),
        ]);

        const hint = selectIdleHint({
          path: pathname,
          hasReports: reports.length > 0,
          hasPills: pills.length > 0,
          lang: language,
          lastHintIndex: lastHintIndexRef.current,
        });

        lastHintIndexRef.current = hint.index;
        setSpokenText(hint.speech);
        setExpression("speaking");
        setIsBubblePulsing(true);
        setIsDialogueOpen(true);
        setIsPlayingAudio(true);

        playGuideAudio(
          hint.speech,
          language,
          () => {
            setIsPlayingAudio(false);
            setExpression("smiling");
          },
          () => {
            setIsPlayingAudio(false);
            setExpression("neutral");
          }
        );
      } catch (err) {
        console.error("Failed executing idle hint:", err);
      }
    }, currentCooldownSec * 1000);
  }, [currentCooldownSec, isIdleStopped, isOnboardingOpen, pathname, language]);

  // Activity tracker for resetting idle timer
  useEffect(() => {
    function handleUserActivity() {
      // User tapped or scrolled: reset idle timer
      if (!isDialogueOpen) {
        resetIdleTimer();
      }
    }

    const events = ["pointerdown", "keydown", "touchstart", "scroll"];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    resetIdleTimer();

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
    };
  }, [resetIdleTimer, isDialogueOpen]);

  // Open dialogue on demand (user tap on GuideBubble)
  function handleOpenDialogue() {
    stopGuideAudio();
    setIsPlayingAudio(false);
    setIsBubblePulsing(false);
    setExpression("smiling");

    const defaultGreeting = {
      en: "Hello! I am Dr. Aisha. How can I guide you on this page?",
      bm: "Salam sejahtera! Saya Dr. Aisha. Bagaimana saya boleh bantu anda di halaman ini?",
      zh: "您好！我是爱莎医生。在这页有什么想了解的吗？",
      ta: "வணக்கம்! நான் டாக்டர் ஆயிஷா. இந்த பக்கத்தில் நான் உங்களுக்கு எப்படி உதவலாம்?",
    };

    const text = defaultGreeting[language] || defaultGreeting.en;
    setSpokenText(text);
    setIsDialogueOpen(true);

    setIsPlayingAudio(true);
    setExpression("speaking");
    playGuideAudio(
      text,
      language,
      () => {
        setIsPlayingAudio(false);
        setExpression("smiling");
      },
      () => {
        setIsPlayingAudio(false);
        setExpression("neutral");
      }
    );
  }

  // Close dialogue (dismissal with cooldown escalation)
  function handleCloseDialogue() {
    stopGuideAudio();
    setIsPlayingAudio(false);
    setIsDialogueOpen(false);
    setIsBubblePulsing(false);
    setExpression("neutral");

    // Apply Cooldown Escalation
    const result = getNextCooldown(currentCooldownSec, dismissCount);
    setCurrentCooldownSec(result.nextCooldown);
    setDismissCount((prev) => prev + 1);
    if (result.isStopped) {
      setIsIdleStopped(true);
    } else {
      resetIdleTimer();
    }
  }

  // Handle choice selection inside dialogue
  function handleSelectChoice(choice: GuideChoice) {
    stopGuideAudio();
    setSpokenText(choice.reply);
    setExpression("speaking");
    setIsPlayingAudio(true);

    playGuideAudio(
      choice.reply,
      language,
      () => {
        setIsPlayingAudio(false);
        setExpression("smiling");
      },
      () => {
        setIsPlayingAudio(false);
        setExpression("smiling");
      }
    );
  }

  function handleSpeak(text: string, exp: DrAishaExpression = "speaking") {
    stopGuideAudio();
    setSpokenText(text);
    setExpression(exp);
    setIsPlayingAudio(true);

    playGuideAudio(
      text,
      language,
      () => {
        setIsPlayingAudio(false);
        setExpression("smiling");
      },
      () => {
        setIsPlayingAudio(false);
        setExpression("neutral");
      }
    );
  }

  function handleStopSpeech() {
    stopGuideAudio();
    setIsPlayingAudio(false);
    setExpression("neutral");
  }

  const contextValue: GuideContextValue = {
    language,
    setLanguage,
    expression,
    isDialogueOpen,
    isOnboardingOpen,
    isPlayingAudio,
    openDialogue: handleOpenDialogue,
    closeDialogue: handleCloseDialogue,
    speak: handleSpeak,
    stopSpeech: handleStopSpeech,
  };

  return (
    <GuideContext.Provider value={contextValue}>
      {children}

      {/* 1. Onboarding Walkthrough Overlay on first launch */}
      {isOnboardingOpen && (
        <OnboardingOverlay
          language={language}
          onComplete={() => {
            setIsOnboardingOpen(false);
            resetIdleTimer();
          }}
        />
      )}

      {/* 2. Persistent Floating Guide Bubble */}
      {!isOnboardingOpen && (
        <GuideBubble
          language={language}
          expression={expression}
          isPulsing={isBubblePulsing}
          isVisible={!isKeyboardOpen && !isDialogueOpen}
          onClick={handleOpenDialogue}
        />
      )}

      {/* 3. Visual-novel Dialogue Overlay with Choice Chips */}
      {isDialogueOpen && !isOnboardingOpen && (
        <GuideDialogue
          language={language}
          expression={expression}
          spokenText={spokenText}
          choices={choices}
          isPlayingAudio={isPlayingAudio}
          onSelectChoice={handleSelectChoice}
          onClose={handleCloseDialogue}
        />
      )}
    </GuideContext.Provider>
  );
}
