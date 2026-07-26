# FOCO B4.3 Closeout C1 — Physical Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the physically observed Agenda double-tap and Focus runtime state trustworthy before any identity/navigation redesign is layered on top.

**Architecture:** Extract the calendar tap timing decision into a pure core state machine and let `MonthCalendar` consume it, so behavior is unit-testable instead of regex-tested. Add a development-only runtime fingerprint to the Focus surface so a Samsung preview can prove which JS closeout bundle is actually rendered; keep production UI unchanged. Preserve the existing Agenda session projection and three-mode Focus domain.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript 5.9, Expo Router, node:test core tests, existing FOCO motion/theme primitives.

## Global Constraints

- Base branch ancestry is B4.3E head `464122c3d46ae945e551b7efb3f99b2efda2a15f`.
- Do not merge PRs `#22 → #25` during this plan.
- No new native dependency solely for double tap.
- Keep single tap = select date; same-date double tap = open exact Day.
- Keep Pomodoro + Temporizador + Cronómetro.
- Runtime fingerprint is development-only and must not render in production.
- No persistence/session/reminder schema changes in C1.
- TDD: RED → minimal fix → GREEN → typecheck → lint → Expo Doctor → Android bundle.

---

### Task 1: Replace source-regex double-tap coverage with a pure interaction contract

**Files:**
- Create: `src/core/calendarTap.ts`
- Modify: `tsconfig.core-test.json`
- Modify: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Produces: `CalendarTapState`, `CalendarTapDecision`, `resolveCalendarTap(previous, day, now, thresholdMs?)`.
- Default threshold: `420ms`, chosen to be more tolerant than the physically failing 280ms detector while remaining a deliberate double tap.

- [ ] **Step 1: Write the failing test**

Add `src/core/calendarTap.ts` to the core-test TypeScript include, then replace the regex-only timing assertions with behavioral cases importing `resolveCalendarTap` from `.core-test-dist/core/calendarTap.js`:

```js
const { resolveCalendarTap } = require('../.core-test-dist/core/calendarTap.js');

test('calendar tap contract selects once and opens only same-day second tap inside window', () => {
  const first = resolveCalendarTap(null, 1000, 10_000);
  assert.deepEqual(first, { action: 'select', next: { day: 1000, at: 10_000 } });

  const second = resolveCalendarTap(first.next, 1000, 10_390);
  assert.deepEqual(second, { action: 'open', next: null });

  const late = resolveCalendarTap(first.next, 1000, 10_421);
  assert.equal(late.action, 'select');

  const otherDay = resolveCalendarTap(first.next, 2000, 10_200);
  assert.equal(otherDay.action, 'select');
});
```

Keep source assertions only for wiring: `MonthCalendar` imports the helper and routes `select/open` to the supplied callbacks.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL because `src/core/calendarTap.ts` does not exist / compiled module cannot be produced.

- [ ] **Step 3: Write minimal implementation**

Create:

```ts
export type CalendarTapState = { day: number; at: number } | null;
export type CalendarTapDecision = {
  action: 'select' | 'open';
  next: CalendarTapState;
};

export const CALENDAR_DOUBLE_TAP_MS = 420;

export function resolveCalendarTap(
  previous: CalendarTapState,
  day: number,
  now: number,
  thresholdMs = CALENDAR_DOUBLE_TAP_MS,
): CalendarTapDecision {
  const sameDay = previous?.day === day;
  const elapsed = previous ? now - previous.at : Number.POSITIVE_INFINITY;
  if (sameDay && elapsed >= 0 && elapsed <= thresholdMs) {
    return { action: 'open', next: null };
  }
  return { action: 'select', next: { day, at: now } };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `test: define reliable calendar double-tap contract`

---

### Task 2: Wire MonthCalendar to the tested interaction contract

**Files:**
- Modify: `src/features/agenda/MonthCalendar.tsx`
- Modify: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes: `resolveCalendarTap` from Task 1.
- Preserves: `onSelect(timestamp)` and `onOpenDay(timestamp)` public props.

- [ ] **Step 1: Write the failing wiring assertion**

Require source to import and call `resolveCalendarTap`, and forbid the old local `DOUBLE_TAP_MS`/manual elapsed branch.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test`
Expected: FAIL on the wiring contract while the pure helper tests remain green.

- [ ] **Step 3: Implement minimal wiring**

Replace the manual branch in `handleDayPress` with:

```ts
const decision = resolveCalendarTap(lastTap.current, timestamp, Date.now());
lastTap.current = decision.next;
if (decision.action === 'open') {
  onOpenDay(timestamp);
  return;
}
onSelect(timestamp);
hapticSelection();
```

Do not alter month navigation, active styling or Agenda routing.

- [ ] **Step 4: Run validation**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `fix: make calendar double tap deterministic`

---

### Task 3: Add a development-only runtime fingerprint for Focus

**Files:**
- Create: `src/core/runtimeFingerprint.ts`
- Modify: `src/features/focus/FocusScreen.tsx`
- Modify: `tests/premium-focus.test.cjs`

**Interfaces:**
- Produces: `FOCO_RUNTIME_FINGERPRINT = 'b4.3-closeout-c1'`.
- Production behavior: no fingerprint text rendered when `__DEV__` is false.

- [ ] **Step 1: Write failing source contract**

Add assertions that `FocusScreen` imports the fingerprint, renders it only behind `__DEV__`, and still renders `FocusModeSelector`. Keep existing exact three-mode assertions.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test`
Expected: FAIL because fingerprint module/rendering is absent.

- [ ] **Step 3: Implement minimal diagnostic**

Create:

```ts
export const FOCO_RUNTIME_FINGERPRINT = 'b4.3-closeout-c1';
```

In `FocusScreen`, directly below `FocusModeSelector`, render a tiny neutral development-only label:

```tsx
{__DEV__ ? (
  <Text accessibilityLabel={`Runtime ${FOCO_RUNTIME_FINGERPRINT}`} style={[styles.runtimeFingerprint, { color: theme.colors.inactive }]}>
    {FOCO_RUNTIME_FINGERPRINT}
  </Text>
) : null}
```

Use a small centered style and no accent color. This is diagnostic, not product chrome.

- [ ] **Step 4: Run validation**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS and the existing three-mode test remains green.

- [ ] **Step 5: Commit**

Commit: `chore: expose dev runtime fingerprint in Focus`

---

### Task 4: Clarify Agenda Plan vs Real without changing stored history

**Files:**
- Modify: `src/features/agenda/DayTimeline.tsx`
- Modify: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes existing `getAgendaSessionEvents` and `getAgendaTimelineWindow`.
- No new persisted fields.

- [ ] **Step 1: Write failing UI contract**

Require the timeline to expose concise copy/metadata showing that the configured hours are `Plan` and expanded real-session hours are `Real`, including an explicit out-of-hours marker when a session lies outside configured workday bounds.

- [ ] **Step 2: Run tests to verify RED**

Run: `npm test`
Expected: FAIL because the out-of-hours affordance is absent.

- [ ] **Step 3: Implement restrained affordance**

Derive whether any session starts before `workdayStartHour` or ends after `workdayEndHour`. Render one compact neutral metadata line such as `Real fuera del horario · también cuenta` only when that condition is true. Do not add cards, warnings or new color semantics.

- [ ] **Step 4: Run validation**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `fix: make out-of-hours focus visible in Agenda`

---

### Task 5: C1 full validation and handoff gate

**Files:**
- No product file changes unless validation finds a defect.

- [ ] **Step 1: Run full automated gate**

Run:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android
```

Expected: all PASS.

- [ ] **Step 2: Verify diff scope**

The C1 diff must contain only the interaction helper, Agenda wiring/clarity, runtime fingerprint, tests, tsconfig include and plan/spec documentation.

- [ ] **Step 3: Keep PR draft**

Do not merge predecessors or closeout. Mark C1 technically ready for one integrated Samsung check only after CI is green.
