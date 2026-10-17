# Visual-novel doctor companion for elderly guidance

## Status
accepted

## Context and Decision
Elderly patients and low-literacy users struggle with text-heavy interfaces and often pause indefinitely without knowing how to proceed. We decided to implement an illustrated doctor companion ("Dr. Aisha") using a visual-novel format with simultaneous spoken Text-to-Speech (TTS) audio and captions, combining a first-launch Onboarding Walkthrough with a persistent Guide Bubble providing contextual Idle Nudges with Cooldown Escalation.

## Considered Options
- **Interactive spotlight product tour**: Rejected because highlighting UI controls requires text reading, complex responsive DOM coordinates, and high cognitive load for elderly users.
- **Pure passive video or static tutorial**: Rejected because it cannot react to idle state, lacks personalization, and does not provide immediate contextual help on specific screens.
- **Bidirectional Gemini Live voice session for guidance**: Rejected for onboarding and idle prompts due to latency, connection overhead, and non-deterministic instruction delivery compared to pre-authored scripted TTS.

## Consequences
- Requires scripted multilingual guidance assets across all 4 supported languages (`en`, `bm`, `zh`, `ta`).
- Requires client-side idle tracking and IndexedDB storage for onboarding completion status.
- Reuses existing `@google-cloud/text-to-speech` endpoint and caching infrastructure.
