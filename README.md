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

**HealthMate** bridges this divide by providing an intuitive, accessible AI companion designed from the ground up for older adults. Built on Next.js 14 and powered by the Google Gemini Flash API, Google Cloud Text-to-Speech, and the Gemini Live API, HealthMate translates complex clinical information into clear, compassionate, and actionable guidance.

```
 +-------------------------------------------------------------------------+
 |                               HealthMate                                |
 |               (Accessible UI: >=18px typography, >=48px touch)           |
 +-------------------+---------------------+-------------------------------+
 |  Reports & Chat   |    Pill Analyzer    |      Timeline & Delta         |
 |  - Ingest PDF/IMG |    - Camera / Photo |      - Longitudinal history   |
 |  - 4-Lang Summary |    - Active ingred. |      - Multi-report Delta AI  |
 |  - Key lab markers|    - Food/Drug risk |      - Combined meal logs     |
 |  - High-res TTS   |    - Report crossref|      - Progress trends        |
 |  - Follow-up chat |                     |                               |
 +-------------------+---------------------+-------------------------------+
 |          Cross-Feature Context Layer (Local IndexedDB Storage)          |
 |    - Latest Report Context               - Active Pill Regimens         |
 +-------------------------------------------------------------------------+
 |                                AI Engine                                |
 |  - Google Gemini Flash API (Multimodal analysis & structured JSON)       |
 |  - Google Gemini Live API (Full-duplex real-time audio conversation)     |
 |  - Google Cloud Text-to-Speech (Neural2 / WaveNet multilingual audio)   |
 +-------------------------------------------------------------------------+
```

---

## 3. Key Features

### 📄 1. Report Analyzer with 4-Language Translation
- **Multimodal Ingestion**: Upload photos (JPEG, PNG) or PDFs of blood tests, scans, or discharge summaries.
- **Plain-Language Synthesis**: Translates dense lab metrics into simple, comforting explanations with clear high/low/normal indicators.
- **Multilingual Support**: Switch seamlessly between **English**, **Bahasa Malaysia**, **Mandarin (简体中文)**, and **Tamil (தமிழ்)** with instant language toggling.
- **Persistent Local Records**: Every report is parsed and safely archived in browser-local storage for longitudinal reference.

### 🔊 2. High-Fidelity Text-to-Speech (TTS)
- Integrated with Google Cloud Text-to-Speech (Neural2 and WaveNet engines).
- Reads report summaries aloud in the user's selected language, removing the burden of squinting at screens for vision-impaired patients.

### 💬 3. Contextual Text Chat
- Follow-up Q&A directly grounded in the active medical report.
- The assistant operates under the "HealthMate" persona: warm, empathetic, patient, and medically cautious.

### 💊 4. Pill Analyzer with Cross-Referencing
- Snap or upload a photo of prescription medications, blister strips, or loose pills.
- Identifies active ingredients, dosages, primary indications, potential side effects, and food/drug interactions.
- **Contextual Cross-Referencing**: Automatically matches identified medications against known conditions from the user's latest uploaded medical report.

### 🎙️ 5. Real-Time Full-Duplex Voice Assistant
- Powered by the **Gemini Live API** over bidirectional WebSockets.
- Allows natural, spoken, hands-free conversation with interruption support.
- Automatically falls back to a clean text chat interface if microphone permissions or WebSocket connectivity are unavailable.

### 📈 6. Health Timeline & Longitudinal Delta Comparison
- Chronological timeline combining diagnostic visits, reports, and meal entries into a unified view.
- **Delta Analysis**: Select any two historical reports to generate an automated comparative summary highlighting what improved, what deteriorated, and what remained stable.

### 🍲 7. Localized Meal Advisor
- Snap a photo or type the name of everyday meals (including local hawker dishes such as char kway teow, roti canai, or chicken rice).
- Gemini identifies dish components and evaluates nutritional impact against the patient's active lab markers and medication regimen.
- Delivers a practical health score with actionable suggestions.

### ♿ 8. Elderly-Safe Accessibility (a11y)
- Minimum base font size of **18px** with generous leading and high-contrast color palettes (WCAG AAA compliant).
- All interactive buttons and tap targets adhere to a minimum size of **48px × 48px**.
- Mobile-friendly fixed bottom navigation for effortless one-handed switching.
- Every response includes an unmissable medical disclaimer reinforcing that the app is an assistive tool, not a doctor.

---

## 4. Privacy & Local-First Architecture

HealthMate adheres to a **Local-First, Zero-Login Privacy Model**:
- **No Central Database**: Patient reports, images, and medication history are stored exclusively within the browser via **IndexedDB** (`idb`).
- **No Account Required**: Immediate access with zero friction—no passwords to remember, no OAuth flows, and no email harvesting.
- **Ephemeral AI Processing**: Document payloads and images sent to the Gemini API are processed in-flight without persisting user health data on third-party backend servers.

---

## 5. Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, React 18, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) customized with high-contrast accessibility tokens
- **AI & Multimodal Understanding**: [Google Gen AI SDK (`@google/genai`)](https://github.com/google-gemini/generative-ai-js) — Gemini Flash models served through [OpenCode Zen](https://opencode.ai/docs/zen/)
- **Real-Time Voice**: Google Gemini Live API (Full-duplex WebSocket audio streaming)
- **Speech Synthesis**: [@google-cloud/text-to-speech](https://cloud.google.com/text-to-speech) (WaveNet / Neural2)
- **Client-Side Storage**: [IndexedDB via `idb`](https://github.com/jakearchibald/idb)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/) with `fake-indexeddb` for fast, deterministic unit and integration tests

---

## 6. Project Structure

```
├── app/
│   ├── api/
│   │   ├── chat/              # Contextual report follow-up chat
│   │   ├── meals/analyze/     # Dietary advice and dish recognition
│   │   ├── pills/analyze/     # Pill identification and interaction check
│   │   ├── reports/analyze/   # Document parsing and multilingual summary
│   │   ├── timeline/compare/  # Multi-report delta progression analysis
│   │   ├── tts/               # Google Cloud Text-to-Speech endpoint
│   │   └── voice/config/      # Gemini Live API session configuration
│   ├── pills/page.tsx         # Pill Analyzer screen
│   ├── reports/page.tsx       # Reports ingestion and review screen
│   ├── timeline/page.tsx      # Timeline history and delta comparator screen
│   ├── globals.css            # Accessible styles, contrast rules, touch sizing
│   ├── layout.tsx             # Root layout with Header and BottomNav
│   └── page.tsx               # Primary landing / Reports view
├── components/
│   ├── BottomNav.tsx          # Accessible 3-tab bottom navigation
│   ├── ChatInterface.tsx      # Report follow-up messaging component
│   ├── Disclaimer.tsx         # Mandatory medical disclaimer component
│   ├── Header.tsx             # App header with language selector
│   ├── MealAdvisorModal.tsx   # Modal for meal photo/text dietary guidance
│   ├── ReportView.tsx         # Multilingual summary and key markers card
│   └── VoiceChatModal.tsx     # Gemini Live API full-duplex voice dialog
├── lib/
│   ├── chat.ts                # Chat business logic and context assembly
│   ├── db.ts                  # Local IndexedDB client (reports, pills, meals)
│   ├── delta-comparator.ts    # Longitudinal delta comparison logic
│   ├── gemini.ts              # Gemini API client wrapper
│   ├── meal-advisor.ts        # Meal evaluation engine
│   ├── pill-analyzer.ts       # Pill photo parsing and cross-referencing
│   ├── prompts.ts             # HealthMate persona, prompt engineering, context injection
│   ├── tts.ts                 # Multilingual Cloud TTS voice selection and synthesis
│   └── voice-session.ts       # Gemini Live API WebSocket session management
├── tests/                     # 100% passing Vitest test suite
└── types/index.ts             # Shared TypeScript schemas and contracts
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

---

## 8. Medical Disclaimer

> **IMPORTANT**: HealthMate is designed purely as an educational and assistive tool to enhance health literacy and medication adherence. It is **not** a diagnostic device, does not provide medical treatment, and must never replace consultation with qualified healthcare professionals. Users are always instructed to consult their primary physician before making changes to their medication or dietary routines.
