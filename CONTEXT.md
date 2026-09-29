# Medical AI (HealthMate)

A voice-first multilingual personal health assistant empowering elderly individuals and low-literacy patients to understand medical reports, medications, and wellness.

## Language

### Clinical & Patient Domain

**Report Record**:
A stored medical lab or health screening document containing structured biomarker indicators and multilingual plain-language summaries.
_Avoid_: Lab result, test file, document upload

**Pill Record**:
An analyzed medication record containing identification, dosage schedules, side effects, and food interactions cross-referenced against active patient reports.
_Avoid_: Prescription, medicine scan

**Meal Record**:
A nutritional log of consumed food evaluated against the patient's existing chronic conditions and dietary constraints.
_Avoid_: Diet log, food diary

### Guidance & Interaction

**Doctor Guide**:
An illustrated, voiced visual-novel style companion providing interactive onboarding and proactive idle guidance.
_Avoid_: Tutorial, walkthrough wizard, tooltips

**Dr. Aisha**:
The canonical friendly physician persona who speaks directly to patients to orient and support them.
_Avoid_: Bot, system avatar, virtual agent

**Onboarding Walkthrough**:
A step-by-step introductory visual-novel dialogue presented to first-time users explaining core capabilities through spoken audio and captions.
_Avoid_: Product tour, intro carousel, setup wizard

**Guide Bubble**:
A persistent floating avatar button positioned above navigation that initiates guidance dialogue on demand or upon idle timeout.
_Avoid_: Help button, floating action button, chat widget

**Idle Nudge**:
A proactive spoken and captioned contextual suggestion triggered automatically when a patient has been inactive on a screen.
_Avoid_: Inactivity alert, idle timeout popup, push hint

**Cooldown Escalation**:
The progressive session-based doubling of idle timeout thresholds after dismissals to prevent user annoyance while preserving support.
_Avoid_: Backoff timer, snooze delay
