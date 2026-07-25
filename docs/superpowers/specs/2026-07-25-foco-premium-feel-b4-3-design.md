# FOCO B4.3 — Premium Feel & Behavior System

## Status

Design approved in principle by Josue on 2026-07-25, with one explicit correction: **FOCO must not use a mascot.** This document freezes the intended product direction before implementation.

## Goal

Transform FOCO from a functional, visually clean productivity app into a product that feels intentionally designed, smooth, distinctive and premium in the hand, without sacrificing clarity, speed, accessibility or the existing offline-first architecture.

The goal is not decorative redesign. The goal is to improve **perceived quality through coordinated typography, iconography, motion, tactile feedback, navigation, time representation and intermediate states**.

## Product principles

1. **Premium means low friction.** Frequent actions must feel immediate, calm and smooth.
2. **Motion must explain, connect or confirm.** No animation exists only to decorate.
3. **Haptics are semantic, not constant.** Routine navigation should not vibrate.
4. **FOCO must have a recognizable visual language without a mascot.** Personality comes from typography, geometry, composition, motion and state design.
5. **Everything counts.** Real focus time is persisted and visible even when it is short, interrupted, unplanned or outside configured work hours.
6. **Quiet by default, expressive at meaningful moments.** Success states may feel satisfying, but the app must never become noisy or playful for its own sake.
7. **Light and Dark are one product.** Both themes must share identical hierarchy, spacing, iconography and motion behavior.
8. **Accessibility remains first-class.** Respect reduced motion, touch targets, contrast, keyboard behavior and screen-reader semantics.

## Non-goals

B4.3 does not implement:

- Android widget B5.1;
- distraction enforcement B5.2;
- advanced audio/background playback B5.3;
- accounts or cloud sync;
- mascot, character system or gamified avatar;
- constant confetti, 3D cards, excessive glow or decorative animation;
- a wholesale rewrite of FOCO's store, persistence or navigation architecture.

## Source ideas incorporated

B4.3 adapts ideas from the user's three recent Drive documents about premium mobile UX:

- emotional feedback and deliberate motion;
- subtle press states;
- calibrated haptics;
- professional icon consistency;
- custom empty/loading states;
- keyboard polish;
- progressive permission education;
- accumulation of many small UX refinements rather than one visual gimmick.

These ideas are adapted to FOCO rather than copied literally.

---

# A. Premium Foundation

## A1. Typography

Current Manrope usage will be replaced only after evaluating a small set of candidates on real FOCO screens. The first candidate is Instrument Sans, but implementation must not assume the final choice until visual validation.

The typography system must define:

- display title;
- screen title;
- section heading;
- body;
- metadata;
- caption;
- metric;
- timer/clock numerals;
- button/control labels.

Requirements:

- real font weights only;
- embedded local font assets for deterministic Android rendering;
- tabular numerals for timers and numeric metrics;
- deliberate letter spacing rather than default values;
- no arbitrary per-screen font declarations once the system is in place.

Success criterion: a screenshot without branding should still feel recognizably like FOCO rather than a default React Native productivity UI.

## A2. Iconography

Replace the current hand-authored generic icon treatment with a coherent professional icon family or curated paths from one family.

Selection criteria:

- consistent optical size;
- consistent stroke language;
- good readability at 18–24 dp;
- distinct active/inactive states;
- licensing compatible with the project;
- no visual mixture of unrelated icon families.

Preferred behavior:

- inactive navigation icons: lighter stroke;
- active navigation icons: stronger or filled treatment when appropriate;
- state change communicates selection through more than color alone.

FOCO may keep a wrapper component such as `FocoIcon` so the rest of the app remains decoupled from the chosen source library.

## A3. Press interaction

Create a unified premium press behavior instead of applying one global opacity/scale reduction everywhere.

The new press primitive should support:

- immediate visual response;
- subtle scale or surface change;
- smooth release;
- correct cancellation when the finger leaves the target;
- no excessive opacity drop;
- reduced-motion compatibility.

Different controls may use different intensity tokens, but not arbitrary custom behavior.

## A4. Haptic semantics

Remove routine haptic feedback from bottom-tab navigation.

Define semantic feedback levels:

- none: routine navigation and passive browsing;
- selection/light: infrequent local selection;
- impact: start an intentional focus action;
- success: completed task/session or meaningful confirmation;
- warning: interruption, destructive warning or invalid action.

The user must never feel repetitive buzzing while simply moving through FOCO.

---

# B. Premium Navigation & Motion

## B1. Motion system

Introduce centralized motion tokens, likely implemented with Reanimated compatible with Expo SDK 54.

Tokens should cover:

- micro response;
- fast transition;
- standard transition;
- soft spring;
- snappy spring;
- fade;
- crossfade;
- short directional slide.

All motion must respect reduced-motion preferences.

## B2. Bottom navigation

Current tab switching feels mechanical because it combines immediate screen replacement, routine haptics and generic pressed states.

New behavior:

1. user taps a tab;
2. no routine vibration;
3. active indicator moves smoothly to the new destination;
4. icon changes state smoothly;
5. content transitions subtly rather than visibly snapping.

The transition must be fast enough that the app never feels delayed.

## B3. Detail navigation

Detail screens and sheets should use a small, consistent set of transitions rather than arbitrary animation per feature.

Examples:

- detail push: restrained horizontal/opacity transition;
- sheet: soft upward entrance with background dimming;
- calendar-to-day: crossfade plus slight directional movement.

---

# C. Premium Agenda — Plan vs Reality

## C1. Calendar day interaction

Monthly calendar behavior:

- single tap: select the day and update the plan below;
- double tap: select the day and transition directly into `Día` mode for that exact date.

Single and double tap must coexist without duplicate actions or accidental mode changes.

## C2. Real session visibility

Sessions already persisted in FOCO must become first-class Agenda events.

A real session must display at minimum:

- project/task context when available;
- start time;
- end time;
- duration;
- session mode/state where useful;
- interrupted/completed distinction when useful.

A five-minute session is not a decorative 3 px bar; it is a readable piece of the day's history.

## C3. Everything counts

Agenda Día must not hide activity merely because it occurred outside `workdayStartHour` / `workdayEndHour`.

Preferred model:

- normal working window remains the primary visual timeline;
- actual sessions outside that window extend the visible range dynamically when necessary, or appear in a clearly integrated `Fuera del horario` region;
- no real recorded focus session disappears from the day view.

## C4. Plan vs reality

Agenda should make the distinction legible without duplicating the entire screen:

- planned task blocks represent intention;
- session blocks represent actual work;
- both can coexist for the same task.

This creates the future basis for honest progress analytics: what was planned versus what was actually done.

---

# D. Premium Focus

## D1. Three explicit timing modes

Replace the current two-mode model with three clear user-facing modes:

1. **Pomodoro** — focus + breaks + cycles.
2. **Temporizador** — free countdown with no required Pomodoro cycle structure.
3. **Cronómetro** — count upward from zero.

All three modes must persist real sessions through the same session history model.

## D2. Discoverable Pomodoro configuration

The existing advanced Pomodoro configuration is useful but hidden behind a generic sliders icon.

Improve discoverability by making the current duration visible near the mode itself, for example `Pomodoro · 25 min`, with a clear path to edit.

Advanced settings remain available for:

- focus length;
- short break;
- long break;
- long-break cadence;
- target cycles;
- automatic starts;
- warning timing;
- keep-awake;
- vibration;
- sound.

## D3. Timer presets

Temporizador should offer restrained quick presets such as:

- 5 min;
- 10 min;
- 15 min;
- 25 min;
- 45 min;
- 60 min;
- custom.

The UI should not become a grid of permanent buttons. Presets may use a compact sheet/chip interaction.

## D4. Focus completion feedback

Meaningful moments should feel satisfying but restrained.

When a focus block completes:

- ring/progress resolves smoothly;
- numeric transition reaches zero cleanly;
- one semantic success haptic;
- short confirmation such as `Sesión guardada`;
- no persistent celebratory clutter.

---

# E. Product Polish

## E1. Empty states without mascot

FOCO explicitly does **not** use a mascot.

Empty states should use a proprietary abstract visual language based on FOCO concepts such as:

- focus point;
- orbit;
- ring;
- alignment;
- trajectory;
- subtle geometric progress;
- controlled accent color.

Examples of states requiring intentional treatment:

- no tasks today;
- inbox empty;
- no project results;
- no sessions yet;
- search with no results;
- completed day.

These illustrations/components should feel like one system, not stock SVG art.

## E2. Loading states

Prefer skeletons and subtle shimmer/fade over generic spinners where content shape is known.

Loading motion must remain quiet and inexpensive.

## E3. Keyboard behavior audit

Audit every input-heavy surface:

- task capture/editor;
- project editor;
- routines;
- search;
- any multiline notes.

Requirements:

- keyboard does not cover primary actions;
- tap outside can dismiss where appropriate;
- scroll/resize behavior is predictable;
- multiline inputs grow within sensible bounds;
- bottom navigation remains hidden when necessary and returns correctly.

Do not add a keyboard dependency unless an actual problem requires it.

## E4. Permission education

Before future sensitive Android permissions, FOCO should explain value and privacy in-app before invoking the system dialog.

This pattern will be required later for distraction monitoring / Usage Access.

---

# Architecture and implementation boundaries

B4.3 should preserve:

- current offline-first `FocoStore` architecture;
- persisted state and migrations;
- existing task/project/session IDs;
- local reminder behavior;
- Expo Router structure;
- Android Development Build runtime;
- existing test suite and CI as baseline.

New dependencies are allowed only when they materially improve the system and are compatible with Expo SDK 54. Reanimated and Gesture Handler are expected candidates for motion/gesture work, but should be introduced deliberately and validated through Expo Doctor/build checks.

Motion, press behavior, haptics, typography and icons should be centralized in reusable UI primitives rather than repeated per screen.

---

# Validation strategy

Each implementation slice must include automated regression checks where logic is testable.

Required final validation:

- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- Expo Doctor;
- Android Development Build compatibility;
- physical Samsung smoke test after integrated UI changes.

Physical review should focus on:

- perceived smoothness of tab navigation;
- absence of annoying routine vibration;
- typography quality in Light/Dark;
- icon consistency;
- calendar single/double tap behavior;
- readability of a real five-minute session in Agenda;
- visibility of out-of-hours sessions;
- Pomodoro/Temporizador/Cronómetro behavior;
- keyboard behavior on forms;
- no regressions in persistence or notifications.

---

# Delivery decomposition

Implementation should proceed in independently reviewable slices:

- **B4.3A — Premium Foundation:** typography, icon system, press primitive, haptic semantics, motion tokens.
- **B4.3B — Premium Navigation:** bottom tab behavior and screen/detail transitions.
- **B4.3C — Premium Agenda:** double tap, real session events, out-of-hours visibility, plan vs reality.
- **B4.3D — Premium Focus:** Pomodoro, Temporizador, Cronómetro and completion feedback.
- **B4.3E — Product Polish:** abstract empty states, loading, keyboard audit and permission education pattern.

Each slice must be mergeable and testable on its own. B5.x remains paused until B4.3 reaches physical review.

## Approval note

User-approved direction before this written spec:

- premium visual/tactile direction: approved;
- smoother navigation/motion: approved;
- professional icon system: approved;
- double tap Calendar → Día: approved;
- persistent/readable real sessions and `todo cuenta`: approved;
- three Focus modes: approved;
- empty-state personality: approved only under the explicit constraint **no mascot**.
