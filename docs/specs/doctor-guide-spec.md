## Problem Statement

Elderly and low-literacy patients often struggle to navigate digital health applications and may not be able to read textual interfaces. When opening HealthMate, they frequently do not understand what the application can do, how to interact with it, or what steps to take next. If left alone without guidance, they remain idle and hesitant, leading to abandonment of the tool.

## Solution

HealthMate introduces a friendly, animated visual-novel style physician companion named Dr. Aisha. Dr. Aisha speaks aloud in the patient's preferred language (English, Bahasa Malaysia, Mandarin, or Tamil) while displaying synchronized high-contrast captions. 

On first launch, Dr. Aisha presents an Onboarding Walkthrough explaining the application's key capabilities step-by-step. During regular usage, a persistent Guide Bubble stays available above the navigation bar. When the patient is inactive for a period of time, Dr. Aisha provides an Idle Nudge with contextual spoken advice on what action can be taken next. Patients can also tap the Guide Bubble on demand to receive guided suggestions. A Cooldown Escalation mechanism ensures that dismissals gracefully double the idle timer so the patient is never pestered.

## User Stories

1. As an elderly patient who cannot read text, I want Dr. Aisha to speak aloud to introduce herself when I first launch the app, so that I immediately know I am in a supportive medical assistant environment.
2. As a first-time patient, I want an Onboarding Walkthrough with synchronized spoken audio and large subtitles, so that I can follow along using either hearing, reading, or both.
3. As a patient learning about medical reports, I want Dr. Aisha to explain that I can upload photos of my lab tests or clinic summaries, so that I know how to get my test results interpreted in plain language.
4. As a patient with chronic illnesses, I want Dr. Aisha to explain that I can take pictures of my medication packets or bottles, so that I know the app can identify my pills and warn me about food interactions.
5. As an elderly user who prefers speaking over typing, I want Dr. Aisha to introduce the voice conversation feature, so that I know I can talk directly to HealthMate using the microphone button without typing.
6. As a patient reviewing the Onboarding Walkthrough, I want prominent "Next" and "Skip" buttons with large touch areas, so that I can comfortably advance at my own pace or dismiss the walkthrough if I am in a hurry.
7. As a returning patient who has completed onboarding, I want the full-screen walkthrough not to appear again automatically on subsequent app opens, so that I am taken straight to my dashboard without redundant steps.
8. As a patient who becomes confused and stops interacting with the screen, I want Dr. Aisha to trigger an Idle Nudge after 30 seconds of inactivity, so that I receive an audio suggestion on what I can do on the current screen.
9. As a patient viewing the reports screen without any uploaded documents, I want the Idle Nudge to suggest taking a picture of my medical report with the camera button, so that I know the primary initial action to take.
10. As a patient who has already uploaded at least one Report Record, I want the Idle Nudge on the reports screen to suggest asking a follow-up question or reviewing my biomarker summary, so that the guidance stays relevant to my current state.
11. As a patient browsing the pill analysis screen, I want the Idle Nudge to guide me on snapping a photo of my pill blister packs or bottles, so that I know how to log my medications.
12. As a patient reviewing the health timeline screen, I want the Idle Nudge to explain how my historical lab trends and delta changes are tracked across visits, so that I understand how to monitor my health progress over time.
13. As a user who wants immediate assistance without waiting for an idle timer, I want to tap the persistent Guide Bubble at any time, so that I can immediately open the dialogue interface and hear guidance.
14. As a patient who taps the Guide Bubble on demand, I want to see 2 to 3 large choice buttons with clear options (including contextual questions and a general 'What can you do?' option), so that I can direct the conversation based on what I need help with.
15. As a patient selecting a dialogue choice option, I want Dr. Aisha to speak the answer clearly and display a smiling or reassuring expression, so that I feel encouraged and guided.
16. As an active user who understands what I am doing, I want to tap anywhere on the screen during Dr. Aisha's speech to stop the current audio playback and dismiss the dialogue box, so that the guidance never blocks my intentional actions.
17. As a user who dismisses an Idle Nudge, I want the next idle timeout to escalate (doubling from 30 seconds to 60 seconds, then 120 seconds, then pausing for the session), so that I am not annoyed by repeated prompts.
18. As a household sharing a mobile device, I want the Cooldown Escalation dismiss counter to reset on each fresh app session, so that another family member or patient opening the app later still receives helpful idle assistance.
19. As a multilingual patient, I want all of Dr. Aisha's spoken dialogue and text captions to match my currently selected language (English, Bahasa Malaysia, Mandarin, or Tamil), so that I receive instructions in my native tongue.
20. As a patient who switches language in the header while Dr. Aisha is speaking, I want the audio and text to smoothly restart in the newly selected language, so that the guidance immediately reflects my chosen language.
21. As a patient navigating to a different tab or screen while Dr. Aisha is speaking, I want the previous speech to immediately stop and reset, so that audio from the prior screen does not play over the new screen.
22. As a patient on a slow or offline network connection where Text-to-Speech audio fails to generate, I want the text dialogue captions to remain fully visible on screen, so that I still receive the guidance even without audio playback.
23. As a mobile patient with a software keyboard open for text chatting, I want the Guide Bubble to hide or avoid covering the text input area, so that it does not obstruct my typing or message sending.
24. As an elderly patient with low vision, I want Dr. Aisha's dialogue text box to use high-contrast styling and at least 18px font size, so that the subtitles are easily legible.

## Implementation Decisions

- **Illustrated Character & Expression States**: Dr. Aisha is rendered as an illustrated physician with 3 visual states: neutral (idle/listening), speaking (audio active/talking indicator), and smiling (reassuring reaction upon user choice or task completion).
- **Dual Presentation Surfaces**:
  - **Onboarding Walkthrough**: Rendered as a high-priority accessible modal overlay on initial application entry. Presents a 4-step sequence: Introduction & Persona -> Report Analysis & Q&A -> Pill Scanner -> Voice Interaction.
  - **Guide Bubble & Floating Dialogue**: A persistent floating button pinned to the lower-right viewport above the navigation bar, expanding into a bottom-anchored visual-novel dialogue box with option chips.
- **Multilingual Script Store**: All dialogue scripts across all 4 steps and contextual page hints are pre-authored across English, Bahasa Malaysia, Mandarin, and Tamil, avoiding runtime LLM translation latency.
- **Speech Synthesis via Existing Cloud TTS**: Guidance speech is synthesized via the existing server-side TTS endpoint using Google Cloud Neural2/WaveNet voices at a calibrated 0.95x speaking rate for elderly comprehension. Audio responses are cached via HTTP browser cache.
- **Client-Side Idle Engine**: A global idle listener monitors pointer, key, and touch events. Inactivity triggers an Idle Nudge after the current cooldown interval expires.
- **Cooldown Escalation Policy**: The idle interval begins at 30 seconds. Each dismissal within the active browser session escalates the interval to 60 seconds, then 120 seconds, and halts automatic nudges after 3 dismissals until the next app session.
- **State & Data Persistence**:
  - The local IndexedDB database stores `hasCompletedOnboarding` permanently.
  - Runtime session state maintains `dismissCount` and `lastSpokenHintId` to prevent immediate hint repetition and manage escalation.
  - Progressive guidance checks existing `ReportRecord` and `PillRecord` entities in IndexedDB to advance hints from initial ingestion to deeper utilization.
- **A11y & Keyboard Protection**: Dialogue and bubble elements follow ARIA dialog and log standards, meet minimum 48px touch targets, and automatically conceal when software keyboards or voice chat modals become active.

## Testing Decisions

- **Good Test Criteria**: Tests must verify external observable behaviors and state outcomes rather than internal component implementation details. Tests should verify that user actions or timer expirations trigger the expected state transitions, IndexedDB updates, and audio synthesis invocations.
- **Tested Modules**:
  - **Guide State Controller**: Verifies onboarding detection, completion writing, idle countdown timing, dismissal cooldown escalation progression (30s -> 60s -> 120s -> stop), and session reset behavior.
  - **Contextual Script Selector**: Verifies correct script resolution across pages (`/reports`, `/pills`, `/timeline`), data presence conditions (empty reports vs populated reports), and language switching (`en`, `bm`, `zh`, `ta`).
  - **Audio Delivery & Fallback Handling**: Verifies that audio synthesis requests contain proper localized parameters and that playback failures degrade gracefully to visual captions without throwing errors.
- **Prior Art**: Built using Vitest with `fake-indexeddb/auto` mirroring existing tests in `tests/db.test.ts` and `tests/tts.test.ts`.

## Out of Scope

- Real-time lip-synchronization or 3D skeletal avatar modeling.
- Dynamic conversational AI generation via Gemini Live for the guidance script (scripted TTS is intentionally used for deterministic, prompt-free orientation).
- Drag-and-drop movable positioning for the Guide Bubble.
- Voice-activated wake words (e.g. "Hey Dr. Aisha").
- Permanent user settings toggle to fully delete the guide mechanism.

## Further Notes

- The character name "Dr. Aisha" was selected for cultural resonance, warmth, and inclusivity across Malaysian elderly demographics (Malay, Chinese, Indian, and Eurasian communities).
- The visual-novel format delivers high accessibility by pairing continuous spoken instruction with prominent captions and simple multiple-choice selection chips.
