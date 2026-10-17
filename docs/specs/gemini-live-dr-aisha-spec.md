## Problem Statement

Elderly and low-literacy patients often struggle with typing text, reading complex medical terminology, or interacting with detached, robotic voice interfaces. In HealthMate, while patients can view their Report Records and Pill Records, entering the full-duplex live voice chat currently presents a generic pulsing icon and detached system branding ("HealthMate Live Voice"). This creates a jarring cognitive disconnect from Dr. Aisha—the canonical friendly physician companion they recognize from the Doctor Guide onboarding and guidance bubbles. Furthermore, patients have no visual lip-sync feedback to gauge when the AI is speaking versus listening, cannot mute their microphone during the call without terminating the session entirely, and lose all spoken advice once the voice session ends because spoken exchanges are not preserved in the chat thread.

## Solution

HealthMate integrates Dr. Aisha as the visual presence and conversational persona for Gemini Live voice chat. Opening live voice chat launches a warm, full-screen companion experience featuring Dr. Aisha's illustrated avatar with real-time Web Audio amplitude lip-sync: her mouth openness dynamically scales to the volume of incoming speech, and her expression shifts smoothly between listening, speaking, and smiling. 

Upon connection, Dr. Aisha proactively greets the patient in their selected language (English, Bahasa Malaysia, Mandarin, or Tamil) with a warm spoken welcome, removing the anxiety of having to speak first. When the patient speaks, an intuitive listening glow highlights Dr. Aisha to confirm audio reception. A dedicated microphone mute toggle lets patients pause input without hanging up. Finally, upon ending the call, the spoken conversation turns are automatically synchronized into the text chat history, allowing elderly patients and their caregivers to re-read and reference Dr. Aisha's advice at their own pace.

## User Stories

1. As an elderly patient who finds typing difficult, I want to talk directly to Dr. Aisha using full-duplex live voice, so that I can have an effortless spoken conversation about my health without touching a keyboard.
2. As a patient opening the live voice conversation, I want to see Dr. Aisha's familiar friendly doctor avatar instead of a generic robotic microphone icon, so that I feel comfortable and supported by a recognizable physician persona.
3. As a first-time voice user who feels nervous or hesitant about speaking first, I want Dr. Aisha to proactively greet me aloud as soon as the call connects, so that I am warmly welcomed and guided into the conversation naturally.
4. As a multilingual patient speaking Bahasa Malaysia, Mandarin, Tamil, or English, I want Dr. Aisha's proactive spoken greeting to match my selected application language, so that I am addressed in my native tongue immediately.
5. As a patient listening to Dr. Aisha explain my medical results, I want Dr. Aisha's mouth movements to naturally lip-sync and scale in real-time with the volume and rhythm of her spoken voice, so that the interaction feels alive and realistic.
6. As a patient speaking to Dr. Aisha, I want to see a responsive listening glow or aura illuminate around Dr. Aisha's avatar when my voice is detected, so that I have clear visual confirmation that my microphone is picking up my words.
7. As a patient with background household noise or a sudden cough, I want a prominent Mute Microphone toggle button, so that I can temporarily silence my microphone without having to hang up the call.
8. As a patient with a muted microphone, I want to see a clear visual indicator that my microphone is muted, so that I do not mistakenly speak while muted.
9. As a patient unmuting my microphone, I want Dr. Aisha's listening state to resume instantly, so that I can smoothly continue speaking.
10. As a patient discussing a recent blood test or lab report, I want Dr. Aisha's live voice persona to have full awareness of my active Report Record, so that she can accurately reference my specific biomarkers and clinical findings.
11. As a patient managing multiple daily medications, I want Dr. Aisha's live voice persona to reference my active Pill Records, so that she can advise me on proper dosages, food interactions, and potential side effects.
12. As an elderly patient who may have forgotten what Dr. Aisha said during the call, I want the full spoken conversation transcript to automatically append to my text chat thread when the call ends, so that I or my caregiver can re-read the advice at any time.
13. As a patient reviewing the synced transcript in the text chat thread, I want messages from Dr. Aisha to display her doctor persona and avatar, so that the chat thread maintains consistent visual continuity with the voice session.
14. As an elderly patient with low vision, I want real-time captions of Dr. Aisha's spoken words displayed prominently in high contrast during the live call, so that I can follow along by reading if hearing is difficult.
15. As a user in a live call, I want a prominent "End Voice Chat" button with a large touch target, so that I can easily finish the call and return to the main text interface whenever I am ready.
16. As a patient engaging in a live voice call, I want any background Doctor Guide idle nudges and scripted audio to remain paused, so that Dr. Aisha does not speak over herself with competing audio tracks.
17. As a patient who experiences a momentary network disruption during a live call, I want Dr. Aisha's avatar to transition to a calm neutral state with a clear, gentle status message and a seamless fallback to text chat, so that I am not left stranded or confused.
18. As a patient concluding a medical voice query, I want Dr. Aisha to conclude clinical explanations with the mandatory medical disclaimer, so that I am always reminded to consult my primary physician for definitive medical decisions.
19. As a patient switching from live voice back to text chat, I want my active Report Record context and medication context to remain connected, so that my subsequent text questions continue the same clinical discussion seamlessly.
20. As a user operating on a mobile device with limited processing power, I want the audio amplitude analysis and SVG mouth scaling to execute with high performance and low CPU overhead, so that the animation runs fluidly without draining device battery.

## Implementation Decisions

- **Module Architecture**:
  - `Voice Session Coordinator`: Manages Gemini Live WebSocket protocol framing, proactive greeting injection, system prompt synthesis with Dr. Aisha's persona, prebuilt voice selection, and language synchronization.
  - `Avatar Expression & Lip-Sync Interface`: Enhances the existing avatar component with an optional real-time volume input channel. When speaking, the mouth's vertical radius dynamically scales based on normalized RMS decibel levels (0.0 to 1.0) calculated via a Web Audio `AnalyserNode`. Falls back to CSS pulsation if volume data is absent.
  - `Live Call Modal Presentation`: Redesigns the full-duplex voice dialog around Dr. Aisha's large avatar. Implements an input audio listener on the user's MediaStream to render a reactive listening aura, adds a Mute/Unmute track toggle, and captures bidirectional turn transcripts.
  - `Chat Thread Synchronization`: On call cleanup, the accumulated dialogue turns are emitted via a callback into the parent chat controller, rendering them into the conversation history with Dr. Aisha's persona.
  - `Guide Audio Mutual Exclusion`: The global Doctor Guide provider pauses idle evaluation and suspends scripted speech whenever a live voice session is active, resuming normal idle timing after the call closes.
- **Prototypes / Contracts**:
  - Avatar volume augmentation:
    ```ts
    interface DrAishaAvatarProps {
      expression?: "neutral" | "speaking" | "smiling";
      size?: "sm" | "md" | "lg" | "xl";
      className?: string;
      isPulsing?: boolean;
      audioLevel?: number; // Normalized 0.0 to 1.0 for real-time lip-sync
    }
    ```
  - Live session completion contract:
    ```ts
    interface VoiceSessionResult {
      transcriptTurns: Array<{
        role: "user" | "assistant";
        content: string;
      }>;
    }
    ```

## Testing Decisions

- **Good Test Criteria**: Test external observable behavior and system state outputs rather than internal DOM or Web Audio buffer math. Tests must assert that:
  - System prompts generated for live sessions configure the Dr. Aisha physician persona, inject active Report Records and Pill Records, enforce medical disclaimers, and select appropriate female voices ("Aoede"/"Kore").
  - Proactive greetings are properly formatted in the patient's active language ("en", "bm", "zh", "ta") upon session setup.
  - Completed voice sessions return formatted conversation turns ready for insertion into the chat log.
  - Avatar component correctly maps normalized audio levels to SVG coordinate scales and expression variants without crashing when props are omitted.
- **Tested Modules**:
  - `Voice Session Coordinator`: Expanded vitest coverage testing Dr. Aisha persona configuration, localized proactive greeting generation, context injection, and voice selection.
  - `Voice Chat Transcript Synchronization`: Testing that transcript accumulation and chat history insertion preserve turn order, role tagging, and message content.
  - `DrAishaAvatar Lip-Sync Logic`: Unit tests verifying that `audioLevel` props correctly translate to rendered mouth dimension properties across neutral, smiling, and speaking states.
- **Prior Art**:
  - `tests/voice-session.test.ts` (existing Live session configuration unit tests).
  - `tests/guide.test.ts` (testing Dr. Aisha state transitions and script selection).
  - `tests/prompts.test.ts` (testing prompt assembly and disclaimer enforcement).

## Out of Scope

- 3D avatar rendering, WebGL mesh rigging, or facial feature video generation.
- Client-side local LLM or edge speech recognition running offline.
- Modifying the visual-novel scripted onboarding walkthrough or idle nudge scripts beyond coordinating mutual audio exclusion.
- Video stream streaming via Gemini Live (voice-only audio streaming is preserved).

## Further Notes

- Dr. Aisha's persona strictly adheres to `CONTEXT.md` avoiding robotic phrases ("As an AI...") and upholding the warm, empathetic tone of a community family physician.
- Real-time AudioContext operations must strictly follow browser autoplay policies, instantiating or resuming AudioContext only upon direct user gesture (clicking the microphone call button).
