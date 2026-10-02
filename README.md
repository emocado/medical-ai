# HealthMate — AI Medical Companion for Elderly Patients

> A compassionate, local-first medical companion web app built to empower elderly patients in deciphering complex medical documents, understanding prescription regimens, tracking multi-visit health progress, and receiving culturally relevant dietary advice in their native language.

---

## 1. Motivation & Problem Statement

### The Healthcare Communication Gap for Elderly Patients
Elderly patients frequently undergo medical checkups, diagnostic screenings, and hospital visits. While modern clinical medicine delivers advanced diagnostic reports, the downstream communication to elderly patients remains deeply fragmented:

1. **Medical Jargon & Opaque Lab Reports**:
   - Laboratory panels (e.g., lipid profiles, renal function, HbA1c, full blood count) and discharge summaries are densely formatted with clinical abbreviations and terminology that patients find intimidating.
   - Patients leave clinics unsure if their numbers indicate stability, deterioration, or normal fluctuation.

2. **Multilingual & Cultural Barriers**:
   - In multilingual societies (such as Malaysia and Southeast Asia), medical reports and pharmaceutical instructions are overwhelmingly written in clinical English or formal administrative Bahasa Malaysia.
   - Elderly patients often speak or comprehend information best in Mandarin (中文), Tamil (தமிழ்), or colloquial Malay/English. This creates anxiety, miscommunication, and dependence on busy family members.

3. **Polypharmacy & Medication Confusion**:
   - Elderly patients frequently manage multiple concurrent medications across different specialists.
   - Physical pill bottles and blister packs often display generic pharmaceutical names rather than recognizable brand names.
   - Patients struggle to understand what each pill is for, optimal timing, critical side effects, and potential adverse interactions with other drugs or common foods.

4. **Fragmented Longitudinal Tracking**:
   - Paper reports are scattered in physical folders across different visits and hospitals.
   - Patients lack an intuitive way to correlate historical results (e.g., comparing blood glucose levels from 6 months ago to today) to understand whether their health trajectory is improving.

5. **Dietary Guidance Disconnected from Local Realities**:
   - Generic clinical advice such as "reduce sodium and simple carbs" does not translate into everyday dietary choices, especially when navigating local food environments (e.g., hawker stalls, kopitiams, mamak stalls).

6. **Digital Accessibility Barriers**:
   - Mainstream patient portals are cluttered, use small typography, have low-contrast palettes, and demand complex multi-step navigation and authentication that alienate elderly users.

---

## 2. The Solution: HealthMate

**HealthMate** is an accessible AI companion for older adults, built with Next.js 14. It uses Gemini Flash (through the OpenCode Zen gateway) for reading documents, photos and speech, and Google Cloud Text-to-Speech for reading answers aloud. It turns clinical information into clear guidance in the patient's own language, and it never hides a result that needs attention.

```
 +---------------------------------------------------------------------------+
 |          HealthMate  (EN / BM / 中文 / தமிழ் · ≥18px text · ≥48px taps)    |
 +-----------+------------------+---------------------+----------------------+
 |  Today    |  Reports & Chat  |  Medicines          |  Timeline            |
 |  - doses  |  - PDF/photo     |  - confirmed list   |  - computed compare  |
 |  - latest |  - 4-lang summary|  - daily doses      |  - trends per test   |
 |  - urgent |  - urgent banner |  - check together   |  - meals             |
 |  - doctor |  - chat + voice  |  - label scanner    |  - backup / restore  |
 |    visit  |                  |                     |                      |
 +-----------+------------------+---------------------+----------------------+
 |  Safety layer: critical-value rules · known-interaction table · label-only |
 |  doses · "unknown" never shown as normal · AI disclosure · 999 escalation  |
 +---------------------------------------------------------------------------+
 |  Local-first storage (IndexedDB): reports, scans, meals, medicines, doses  |
 +---------------------------------------------------------------------------+
 |  Server API (rate-limited): Gemini Flash via OpenCode Zen · Cloud TTS      |
 +---------------------------------------------------------------------------+
```

---

## 3. Key Features

### 🏠 Today
- One screen for the day: an urgent banner if the latest report needs attention, today's doses to tick off, the latest report's out-of-range results, and shortcuts to ask a question or prepare for a doctor visit.
- New users get three clear starting points: upload a report, scan a medicine, or try the sample files.

### 📄 Reports, in four languages
- Upload photos (JPEG, PNG) or PDFs of blood tests or discharge summaries. Each report gets a plain-language summary in **English, Bahasa Malaysia, Mandarin and Tamil**, plus every marker with its **printed normal range**.
- **Honest statuses**: a result with no flag or range shows "Ask doctor", never "Normal". Lab-flagged panic values show as **Urgent**.
- **Same-day escalation**: a red banner ("contact your doctor or clinic today", the flagged values, emergency signs and a **Call 999** button) appears when the AI marks a report urgent, or when a fixed rule trips (potassium, sodium, glucose, haemoglobin, eGFR, platelets, hypertensive crisis).
- Read-aloud, follow-up chat and suggested questions. The date can be corrected and reports can be deleted.

### 🎙️ Hands-free voice
- Speak a question. HealthMate notices when you pause, answers aloud, then listens again; tapping interrupts. Spoken exchanges are added to the chat so they can be re-read.
- Audio goes to the server, so no API key ever reaches the browser. Cloud TTS is used when configured, otherwise the browser's own voice.

### 💊 My Medicines
- Scan a pharmacy label or box. **Doses are copied from the label only** and never invented. Identifications have a confidence level, and uncertain ones say "check with your pharmacist".
- **Add to my medicines** confirms the identification. The confirmed list gives you a daily **dose checklist** (morning / afternoon / evening / night), editable times, and stop/restart.
- **Check my medicines together**: a fixed table flags well-known dangerous combinations immediately (e.g. clarithromycin + statin). An AI review then ranks anything else against the whole list and the latest report. New scans are checked against what you already take.

### 📈 Timeline, trends and comparisons
- Reports and meals in date order (by the date on the report, not upload time).
- **Comparisons are computed, not guessed**: markers are matched across lab naming differences, and "better / worse / no change" comes from the lab flags and values. The AI only writes the explanation.
- **Results over time**: a chart per test across all reports, with the normal range shaded and an exact-value table.
- **Backup & restore**: records live only on the device, so you can download a backup file and restore it on a new phone.

### 🍲 Local meal advice
- Photograph or describe everyday meals (nasi lemak, roti canai, chicken rice…) for advice based on your results and medicines. If no score can be worked out, it says "Not scored" rather than showing a made-up number.

### 🩺 For My Doctor
- A one-page sheet built only from stored records: urgent results, medicines with label doses and times, out-of-range results, changes since the previous report, known interactions, suggested questions and your own notes.
- It can be in a different language from the app (English by default), prints cleanly, and shares as text to family or the clinic through the phone's share sheet.

### 🌏 Fully multilingual
- Every screen, button, status and error is translated, and the language choice is remembered across pages. Saved AI results (pill scans, meals, comparisons, medicines) translate themselves when you switch language; drug names, numbers and units are kept as written.
- The medical disclaimer appears in the reader's language.

### ♿ Elderly-safe accessibility
- Base text ≥18px, tap targets ≥48px, high contrast, no sideways scrolling on a 390px phone in any language.
- Dr. Aisha, the illustrated guide, introduces herself as an **AI helper, not a real doctor**.

---

## 4. Privacy & Local-First Architecture

- **No central database or account**: reports, images, medicines and dose history are stored only in the browser (IndexedDB). The app asks the browser to keep this storage persistent, and backups are files the patient controls.
- **What leaves the device**: when you analyse a document, photo, meal, question or voice clip, that content is sent through this app's server to the OpenCode Zen gateway and on to the Gemini model, along with the relevant report and medicine context. How long those services keep requests depends on their terms; review the OpenCode Zen and Google terms that apply to your account before using real patient data.
- **Keys stay on the server**: the OpenCode key is only read server-side, and API routes are rate-limited (40 requests/minute per client) and size-capped (20 MB).

---

## 5. Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with high-contrast accessibility tokens
- **AI**: [Google Gen AI SDK (`@google/genai`)](https://github.com/googleapis/js-genai), Gemini Flash models served through [OpenCode Zen](https://opencode.ai/docs/zen/)
- **Voice**: browser microphone capture (16 kHz WAV) → server-side Gemini audio understanding → Cloud TTS or Web Speech playback
- **Speech synthesis**: [@google-cloud/text-to-speech](https://cloud.google.com/text-to-speech)
- **Client storage**: [IndexedDB via `idb`](https://github.com/jakearchibald/idb)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with `fake-indexeddb`

---

## 6. Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/                   # Follow-up chat with report + medicine context
│   │   ├── meals/analyze/          # Meal recognition and advice
│   │   ├── medicines/interactions/ # Whole-regimen interaction review
│   │   ├── pills/analyze/          # Label reading, checked against current medicines
│   │   ├── reports/analyze/        # Report parsing, 4-language summary, urgency
│   │   ├── timeline/compare/       # Explanation of computed report changes
│   │   ├── translate/              # Translates saved AI results on language switch
│   │   ├── tts/                    # Cloud Text-to-Speech
│   │   └── voice/turn/             # One spoken turn: audio in, transcript + reply out
│   ├── today/  reports/  medicines/  pills/  timeline/  visit/  samples/
│   └── layout.tsx                  # Language + guide providers, bottom navigation
├── components/                     # Screens' building blocks (ReportView, UrgentAlert,
│   ├── medicines/                  #   MarkerTrends, BackupSection, TodayDoses, …)
│   └── DoctorGuide/                # Dr. Aisha visual-novel companion
├── lib/
│   ├── i18n.ts                     # Every interface string in EN/BM/ZH/TA
│   ├── markers.ts  red-flags.ts    # Marker catalog, units, ranges, critical-value rules
│   ├── trends.ts                   # Computed comparisons and per-test trends
│   ├── medications.ts              # Schedules, duplicates, known dangerous combinations
│   ├── visit-summary.ts            # Doctor-visit sheet and share text
│   ├── gemini.ts                   # Gemini client pointed at OpenCode Zen
│   └── db.ts  backup.ts            # IndexedDB stores, backup/restore, persistence
├── middleware.ts                   # API rate limiting and size cap
├── public/samples/                 # Fictional demo reports, labels and meal photos
├── scripts/samples/                # Sources + renderer for the demo documents
└── tests/                          # Vitest suite
```

---

## 7. Getting Started

### Prerequisites
- **Node.js** (v18.17.0 or higher recommended)
- **npm** or **pnpm**
- **OpenCode API Key** (from [OpenCode Zen](https://opencode.ai/zen)). All Gemini calls go through the OpenCode Zen gateway (`https://opencode.ai/zen/v1`), so no Google AI Studio key is needed.
- *(Optional for TTS)* **Google Cloud Service Account** with Text-to-Speech API enabled

### Environment Configuration
Create a `.env.local` (or `.env`) file in the root directory:

```env
# OpenCode Zen API key, used server-side only for every Gemini call
# (reports, pills, meals, chat, comparisons and voice)
OPENCODE_API_KEY=your_opencode_api_key_here

# (Optional) Google Cloud credentials for high-fidelity Text-to-Speech
# Can be provided as a JSON string or file path
GOOGLE_CLOUD_TTS_CREDENTIALS={"type":"service_account",...}
```

### Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests
Execute the comprehensive Vitest test suite:
```bash
npm test
```

### Trying It Out (Sample Files)
You don't need real medical documents. The app ships with **fictional, watermarked** test material in [`public/samples/`](public/samples/):

| Feature | Sample | Where |
|---|---|---|
| Report analysis + read aloud + chat | March check-up (PDF), September follow-up (PDF) | Reports → "Just trying it out? Use a sample" |
| Report comparison | Upload both reports above | Timeline → select both → Compare |
| Critical-value handling | Urgent result (PNG: potassium 6.4, glucose 18.5) | Reports → sample buttons |
| Label reading + My Medicines | 3 daily medicines (metformin, amlodipine, atorvastatin) | Medicines → Scan a medicine → sample buttons → "Add to my medicines" |
| Interaction check | New antibiotic (clarithromycin, which interacts with atorvastatin) | Scan it after the 3 medicines, add it, then Medicines → "Check my medicines together" |
| Trends + doctor summary | Upload both reports, add the medicines | Timeline → "Your results over time"; Today → "Prepare for my doctor visit" |
| Meal advice | Nasi lemak, chicken rice, roti canai photos; typed meals including "grapefruit juice" | Timeline → Log Meal |
| Voice | Speak any question, e.g. "Is my blood sugar too high?" | Reports → microphone button |

Open **`/samples`** in the app for a suggested walkthrough, thumbnails and downloads. The chat also offers tap-to-ask example questions. The documents are regenerated from HTML with `node scripts/samples/build.mjs`; the food-photo licences are in [`public/samples/ATTRIBUTION.md`](public/samples/ATTRIBUTION.md).

---

## 8. Medical Disclaimer

> **IMPORTANT**: HealthMate is designed purely as an educational and assistive tool to enhance health literacy and medication adherence. It is **not** a diagnostic device, does not provide medical treatment, and must never replace consultation with qualified healthcare professionals. Users are always instructed to consult their primary physician before making changes to their medication or dietary routines.
