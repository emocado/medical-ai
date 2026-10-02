// Renders the fictional demo documents in scripts/samples/src/ to public/samples/.
// Usage (no npm needed):  node scripts/samples/build.mjs
//        node scripts/samples/build.mjs <substring>   (render only matching outputs)
// Requires Microsoft Edge or Google Chrome installed locally (headless mode).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, statSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const srcDir = join(here, "src");
const outDir = resolve(here, "../../public/samples");

const candidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const browser = candidates.find((p) => existsSync(p));
if (!browser) {
  console.error("No Chromium-based browser found. Set CHROME_PATH.");
  process.exit(1);
}

// [source html, output file, width, height] — width/height only for PNG.
const jobs = [
  ["report-2026-03-checkup.html", "report-2026-03-checkup.png", 1240, 1754],
  ["report-2026-03-checkup.html", "report-2026-03-checkup.pdf"],
  ["report-2026-09-followup.html", "report-2026-09-followup.png", 1240, 1754],
  ["report-2026-09-followup.html", "report-2026-09-followup.pdf"],
  ["report-2026-09-urgent.html", "report-2026-09-urgent.png", 1240, 1754],
  ["pills-daily-regimen.html", "pills-daily-regimen.png", 1600, 1000],
  ["pill-clarithromycin.html", "pill-clarithromycin.png", 1000, 800],
];

mkdirSync(outDir, { recursive: true });
const profile = join(tmpdir(), "healthmate-samples-browser-profile");
const common = [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--no-default-browser-check",
  "--run-all-compositor-stages-before-draw",
  `--user-data-dir=${profile}`,
];

// Optional filter: `node scripts/samples/build.mjs urgent` renders only outputs containing "urgent".
const filter = process.argv[2] ?? "";

console.log(`Browser: ${browser}`);
for (const [src, out, w, h] of jobs.filter(([, out]) => out.includes(filter))) {
  const url = pathToFileURL(join(srcDir, src)).href;
  const target = join(outDir, out);
  rmSync(target, { force: true });
  const args = out.endsWith(".pdf")
    ? [...common, "--no-pdf-header-footer", `--print-to-pdf=${target}`, url]
    : [...common, "--hide-scrollbars", `--screenshot=${target}`, `--window-size=${w},${h}`, url];
  execFileSync(browser, args, { stdio: "ignore", timeout: 60_000 });
  if (!existsSync(target)) throw new Error(`Render failed: ${out}`);
  console.log(`${out.padEnd(32)} ${(statSync(target).size / 1024).toFixed(1)} KB`);
}
