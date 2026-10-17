import { loadFont as loadBody } from "@remotion/google-fonts/AtkinsonHyperlegibleNext";
import { loadFont as loadMono } from "@remotion/google-fonts/AtkinsonHyperlegibleMono";
import { loadFont as loadDisplay } from "@remotion/google-fonts/BricolageGrotesque";

const body = loadBody("normal", { weights: ["400", "500", "700", "800"], subsets: ["latin"] });
const mono = loadMono("normal", { weights: ["400", "700"], subsets: ["latin"] });
const display = loadDisplay("normal", { weights: ["600", "800"], subsets: ["latin"] });

// Chinese and Tamil fall back to the OS faces Chrome finds (YaHei / Nirmala UI on Windows).
const SCRIPT_FALLBACK = '"Microsoft YaHei", "PingFang SC", "Noto Sans SC", "Nirmala UI", "Noto Sans Tamil", sans-serif';

export const font = {
  body: `${body.fontFamily}, ${SCRIPT_FALLBACK}`,
  mono: `${mono.fontFamily}, ui-monospace, monospace`,
  display: `${display.fontFamily}, ${body.fontFamily}, sans-serif`,
};

/** Tailwind colours the app itself uses, so the screens read as the real thing. */
export const c = {
  white: "#ffffff",
  slate50: "#f8fafc",
  slate100: "#f1f5f9",
  slate300: "#cbd5e1",
  slate400: "#94a3b8",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1e293b",
  slate900: "#0f172a",
  blue50: "#eff6ff",
  blue100: "#dbeafe",
  blue700: "#1d4ed8",
  blue800: "#1e40af",
  blue900: "#1e3a8a",
  blue950: "#172554",
  red50: "#fef2f2",
  red300: "#fca5a5",
  red600: "#dc2626",
  red700: "#b91c1c",
  red900: "#7f1d1d",
  red950: "#450a0a",
  amber50: "#fffbeb",
  amber300: "#fcd34d",
  amber600: "#d97706",
  amber900: "#78350f",
  amber950: "#451a03",
  emerald50: "#ecfdf5",
  emerald100: "#d1fae5",
  emerald500: "#10b981",
  emerald600: "#059669",
  emerald800: "#065f46",
  emerald950: "#022c22",
  teal600: "#0d9488",
};

/** Landing-page palette for the tour's frame around the phone. */
export const brand = {
  paper: "#eef2f8",
  ink: "#0c1a3a",
  inkSoft: "#46547a",
  accent: "#1d4ed8",
  highlight: "#ffd84d",
};

export const FPS = 30;
export const SCREEN = { w: 390, h: 844 };
