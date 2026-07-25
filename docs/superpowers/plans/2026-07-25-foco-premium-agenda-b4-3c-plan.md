# FOCO Premium Agenda B4.3C Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Agenda show an honest, readable history of planned work versus real focus time, including short/out-of-hours sessions, and let a double tap on a calendar date open that exact day with restrained motion.

**Architecture:** Keep the existing persisted `FocusSession` model unchanged. Add a pure `agendaDay` projection layer that turns persisted sessions into day-scoped display events and derives the visible timeline window; `DayTimeline` consumes that projection rather than reimplementing filtering/layout rules. Calendar double-tap remains a UI interaction over the existing Agenda mode state and does not alter routing or persistence.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router, React Native Reanimated ~4.1.1 already merged in B4.3A, TypeScript, Node test runner, existing FocoStore/session model.

## Execution status

Product implementation for Tasks 1–4 is present on `feature/foco-premium-agenda-b4-3c` at the current branch head. PR #23 is intentionally retargeted to `main` while it remains draft so the repository's normal pull-request CI can validate the complete stacked result. B4.3C must not merge before B4.3B passes Samsung review and PR #22 merges. Task 5 remains the active gate until CI evidence is green.

## Global Constraints

- Do not change `FocoState.version`, persisted session shape, task/project IDs, migrations, reminders or notifications.
- Every persisted focus session overlapping the selected local day must remain discoverable; five-minute sessions are first-class history.
- `workdayStartHour`/`workdayEndHour` remain the planning baseline but may not hide real sessions outside that window.
- Planned tasks and actual sessions must stay visually distinguishable without duplicating the screen.
- Calendar single tap selects; double tap selects/opens `Día` for the exact date.
- Motion must be fast, restrained and respect reduced-motion preference.
- No mascot, confetti, decorative glow or unrelated redesign.
- B4.3C is stacked on the CI-green B4.3B head while B4.3B awaits physical Samsung review; do not merge B4.3C before B4.3B is accepted/merged.

---

### Task 1: Pure Agenda day history projection

**Files:**
- Create: `src/core/agendaDay.ts`
- Modify: `tsconfig.core-test.json`
- Test: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes: `FocoState`, `FocusSession`, `Task`, `Project`, `startOfLocalDay`, `endOfLocalDay` from `src/core/model.ts`.
- Produces:
  - `type AgendaSessionEvent = { id: string; sessionId: string; projectId: string; projectName: string; taskId?: string; taskTitle?: string; startedAt: number; endedAt: number; durationSec: number; mode: FocusSession['mode']; completed: boolean; interrupted: boolean }`
  - `getAgendaSessionEvents(state: FocoState, day: number): AgendaSessionEvent[]`
  - `getAgendaTimelineWindow(state: FocoState, day: number): { startHour: number; endHour: number }`

- [x] **Step 1: Write failing behavioral tests**

Create `tests/premium-agenda.test.cjs` that imports `.core-test-dist/core/agendaDay.js`, builds a minimal `FocoState`, and asserts:

```js
const events = getAgendaSessionEvents(state, day);
assert.equal(events.length, 3);
assert.equal(events[0].taskTitle, 'Cinco minutos reales');
assert.equal(events[0].durationSec, 300);
assert.equal(events[0].projectName, 'Trabajo');

const window = getAgendaTimelineWindow(state, day);
assert.deepEqual(window, { startHour: 5, endHour: 24 });
```

The fixture must include: a five-minute in-hours session, a 05:10 session before a configured 07:00 workday, a 23:20 session after a configured 22:00 workday, and a non-focus break session that must not appear.

- [x] **Step 2: Run tests and verify RED**

Run `npm test` through CI. Expected: compile/test failure because `agendaDay.ts` and exports do not yet exist.

- [x] **Step 3: Implement minimal pure projection**

`getAgendaSessionEvents` must:
- include only `phase === 'focus'` sessions whose interval overlaps `[startOfLocalDay(day), endOfLocalDay(day))`;
- preserve actual session timestamps/duration;
- resolve task/project display context from existing IDs with safe fallbacks;
- sort by `startedAt`, then `endedAt`, then `id` for deterministic output.

`getAgendaTimelineWindow` must:
- start from configured planning hours;
- expand earlier/later for real focus sessions overlapping the day;
- floor the earliest visible session to its hour and ceil the latest session end to the next hour;
- clamp to `0..24`;
- never shrink the configured planning window.

- [ ] **Step 4: Add `src/core/agendaDay.ts` to `tsconfig.core-test.json` and verify GREEN**

Run `npm test`, `npm run typecheck`, `npm run lint`. Expected: PASS.

- [x] **Step 5: Commit**

Commit message: `feat: project real focus history into Agenda — B4.3C`

---

### Task 2: Render real sessions as readable Agenda events

**Files:**
- Create: `src/features/agenda/AgendaSessionBlock.tsx`
- Modify: `src/features/agenda/DayTimeline.tsx`
- Test: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes: `AgendaSessionEvent`, `getAgendaSessionEvents`, `getAgendaTimelineWindow`.
- Produces: a readable session block that displays actual time/duration and context without mutating data.

- [x] **Step 1: Extend regression test and verify RED**

Add source assertions that `DayTimeline.tsx` imports `getAgendaSessionEvents` and `AgendaSessionBlock`, and no longer defines the legacy `sessionBar` with `width: 3`.

- [x] **Step 2: Implement `AgendaSessionBlock`**

Render:
- task title when present, otherwise `Sesión de enfoque`;
- project name as secondary context;
- local `HH:mm–HH:mm` plus rounded duration such as `5 min`;
- subtle interrupted/completed distinction through copy/border treatment rather than warning-colored clutter.

Use Instrument Sans/theme tokens and keep minimum readable height even for five-minute sessions while retaining actual vertical position.

- [x] **Step 3: Update `DayTimeline`**

Replace local session filtering/3px bars with the pure agenda projection. Compute `startHour`/`endHour` from `getAgendaTimelineWindow`, position tasks/sessions against the derived window, and render sessions as absolute `AgendaSessionBlock`s in a dedicated lane that does not erase planned task blocks.

- [ ] **Step 4: Verify GREEN**

Run full tests, typecheck and lint. Expected: PASS.

- [x] **Step 5: Commit**

Commit message: `feat: show real focus sessions in Agenda timeline — B4.3C`

---

### Task 3: Double tap Calendar → exact Day

**Files:**
- Modify: `src/features/agenda/MonthCalendar.tsx`
- Modify: `src/features/agenda/AgendaScreen.tsx`
- Test: `tests/premium-agenda.test.cjs`

**Interfaces:**
- `MonthCalendar` adds `onOpenDay: (value: number) => void`.
- `AgendaScreen` implements `openCalendarDay(value)` by setting `selectedDate`, synchronizing `monthAnchor` when needed, clearing search and setting mode to `Día`.

- [x] **Step 1: Add failing source contract**

Require `MonthCalendar` to expose `onOpenDay`, keep `onSelect`, and implement an explicit same-day double-tap threshold without adding a new native dependency.

- [x] **Step 2: Implement single/double tap arbitration**

Use refs for the last tapped day/timestamp. A first tap immediately calls `onSelect(day.timestamp)`. A second tap on the same cell within a restrained threshold (about 280 ms) calls `onOpenDay(day.timestamp)` instead of issuing another selection action. Reset the stored tap after opening.

- [x] **Step 3: Wire AgendaScreen**

`onOpenDay` must select that exact local date and switch to `Día`; it must not create a task, alter persisted state or route away from Agenda.

- [ ] **Step 4: Verify GREEN and accessibility**

Run tests/typecheck/lint. Confirm calendar cells retain radio semantics and labels.

- [x] **Step 5: Commit**

Commit message: `feat: open Agenda day on calendar double tap — B4.3C`

---

### Task 4: Restrained Calendar → Day transition

**Files:**
- Modify: `src/features/agenda/AgendaScreen.tsx`
- Test: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes existing `motion.fast` and `useReducedMotion`.
- Produces a short in-place transition when Agenda mode changes without delaying interaction.

- [x] **Step 1: Add failing source contract**

Require Agenda mode content to use the centralized motion foundation and a reduced-motion path.

- [x] **Step 2: Implement transition**

Wrap the active Agenda mode content in a focused animated container using a short fade/slight directional offset derived from `motion.fast`; disable decorative movement when reduced motion is enabled. Do not animate the header/search controls.

- [ ] **Step 3: Verify GREEN**

Run tests, typecheck and lint.

- [x] **Step 4: Commit**

Commit message: `feat: soften Agenda mode transitions — B4.3C`

---

### Task 5: Integrated regression and stacked PR readiness

**Files:**
- No product code unless validation exposes a real regression.

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run Expo Doctor.
- [ ] Export Android bundle through CI.
- [ ] Confirm no `FocoStore`, migration, reminder or notification diff.
- [ ] Keep B4.3C unmerged until PR #22 passes Samsung review and merges; then retarget/rebase without force push if needed.
- [ ] Update Drive REGISTRO with each recognizable B4.3C checkpoint and keep ESTADO truthful about the B4.3B physical gate.

## Acceptance Criteria

- A persisted five-minute focus session appears as a readable Agenda history event, not a 3 px marker.
- Actual focus sessions outside the configured workday remain visible.
- Cross-midnight sessions overlapping the selected day are discoverable by the day projection.
- Planned task blocks and actual session blocks are visually distinguishable.
- Single tap selects a calendar date; double tap opens `Día` for that exact date.
- Calendar → Day transition is restrained and reduced-motion aware.
- No persisted schema, reminders, notifications or IDs change.
- Full automated validation and Android bundle export pass before B4.3C is considered ready.
