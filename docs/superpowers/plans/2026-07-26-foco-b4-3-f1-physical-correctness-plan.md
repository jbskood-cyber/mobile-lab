# FOCO B4.3 F1 Physical Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the B4.3 Samsung review trustworthy by fixing Calendar→Día double-tap behavior, clarifying out-of-hours real work, and exposing a development-only three-mode runtime fingerprint without redesigning Enfoque.

**Architecture:** Keep Expo Router and the existing Agenda/Focus architecture. Extract double-tap recognition into a pure core helper so timing behavior is testable without UI mocks, then wire `MonthCalendar` to it using touch-down timing. Preserve the existing dynamic Agenda timeline window and add only concise explanatory copy. Use the existing app-menu footer for a `__DEV__` runtime fingerprint; production UI stays unchanged.

**Tech Stack:** React Native 0.81.5, Expo SDK 54, Expo Router 6, TypeScript 5.9, Node test runner, existing FOCO core-test build.

## Global Constraints

- No new native dependency and no Development Build rebuild for this slice.
- No merge of PR #22→#25 during F1.
- No FocoState version bump, store migration, reminder, notification, or session-shape change.
- Single tap must still select immediately.
- Same-date double tap recognition window is 450 ms measured from touch-down events.
- Different-date taps never open Día.
- Canonical Focus selector remains exactly Pomodoro + Temporizador + Cronómetro.
- Runtime fingerprint appears only when `__DEV__` is true.
- Final full gate: `npm test`, `npm run typecheck`, `npm run lint`, Expo Doctor, Android export/bundle.

---

### Task 1: Pure calendar tap recognizer

**Files:**
- Create: `src/core/calendarTap.ts`
- Modify: `tsconfig.core-test.json`
- Modify: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Produces: `CalendarTapState = { day: number; at: number } | null`
- Produces: `registerCalendarTap(previous: CalendarTapState, day: number, at: number, windowMs?: number): { next: CalendarTapState; openDay: boolean }`
- Consumers: `MonthCalendar.tsx` in Task 2.

- [ ] **Step 1: Write the failing behavior tests**

Add to `tests/premium-agenda.test.cjs` after importing the helper from `.core-test-dist/core/calendarTap.js`:

```js
test('calendar tap recognizer opens only the same date within 450ms', () => {
  const first = registerCalendarTap(null, 100, 1_000);
  assert.deepEqual(first, { next: { day: 100, at: 1_000 }, openDay: false });

  const second = registerCalendarTap(first.next, 100, 1_430);
  assert.deepEqual(second, { next: null, openDay: true });
});

test('calendar tap recognizer does not combine different dates or slow taps', () => {
  const first = registerCalendarTap(null, 100, 1_000);
  const otherDay = registerCalendarTap(first.next, 200, 1_200);
  assert.deepEqual(otherDay, { next: { day: 200, at: 1_200 }, openDay: false });

  const slow = registerCalendarTap({ day: 100, at: 1_000 }, 100, 1_451);
  assert.deepEqual(slow, { next: { day: 100, at: 1_451 }, openDay: false });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run:

```bash
npm test
```

Expected: fail because `src/core/calendarTap.ts` / compiled helper does not exist.

- [ ] **Step 3: Implement the minimal pure recognizer**

Create `src/core/calendarTap.ts`:

```ts
export type CalendarTapState = { day: number; at: number } | null;

export const CALENDAR_DOUBLE_TAP_MS = 450;

export function registerCalendarTap(
  previous: CalendarTapState,
  day: number,
  at: number,
  windowMs = CALENDAR_DOUBLE_TAP_MS,
): { next: CalendarTapState; openDay: boolean } {
  const isDoubleTap = previous !== null
    && previous.day === day
    && at >= previous.at
    && at - previous.at <= windowMs;

  return isDoubleTap
    ? { next: null, openDay: true }
    : { next: { day, at }, openDay: false };
}
```

Add `src/core/calendarTap.ts` to the `include` array in `tsconfig.core-test.json`.

- [ ] **Step 4: Run tests and verify GREEN**

Run:

```bash
npm test
```

Expected: all tests pass, including the two recognizer tests.

- [ ] **Step 5: Commit**

```bash
git add src/core/calendarTap.ts tsconfig.core-test.json tests/premium-agenda.test.cjs
git commit -m "test: define robust calendar tap behavior"
```

---

### Task 2: Wire MonthCalendar to touch-down double-tap behavior

**Files:**
- Modify: `src/features/agenda/MonthCalendar.tsx`
- Modify: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes: `registerCalendarTap` from Task 1.
- Preserves: `onSelect(timestamp)` on each first/single press.
- Preserves: `onOpenDay(timestamp)` only on recognized same-date double tap.

- [ ] **Step 1: Replace the stale source-shape assertion with the new contract**

In the monthly-calendar test, require the extracted helper and touch-down wiring, and forbid the old 280 ms recognizer:

```js
assert.match(month, /registerCalendarTap/);
assert.match(month, /onPressIn/);
assert.doesNotMatch(month, /DOUBLE_TAP_MS\s*=\s*280/);
assert.doesNotMatch(month, /lastTap\.current.*Date\.now\(\).*onPress/s);
```

Keep the existing assertions that `AgendaScreen` routes `openCalendarDay` to `setSelectedDate(value)` and `setMode('Día')`.

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npm test
```

Expected: premium Agenda source contract fails because `MonthCalendar` still contains the 280 ms `onPress` recognizer.

- [ ] **Step 3: Implement touch-down recognition**

In `MonthCalendar.tsx`:

```ts
import { useMemo, useRef } from 'react';
import { registerCalendarTap, type CalendarTapState } from '@/src/core/calendarTap';

const lastTap = useRef<CalendarTapState>(null);
const suppressPress = useRef<number | null>(null);

const handleDayPressIn = (timestamp: number) => {
  const result = registerCalendarTap(lastTap.current, timestamp, Date.now());
  lastTap.current = result.next;
  if (result.openDay) {
    suppressPress.current = timestamp;
    onOpenDay(timestamp);
  }
};

const handleDayPress = (timestamp: number) => {
  if (suppressPress.current === timestamp) {
    suppressPress.current = null;
    return;
  }
  onSelect(timestamp);
  hapticSelection();
};
```

Wire each day cell with both handlers:

```tsx
onPressIn={() => handleDayPressIn(day.timestamp)}
onPress={() => handleDayPress(day.timestamp)}
```

Do not alter month arrows or selection styling.

- [ ] **Step 4: Run tests and typecheck**

Run:

```bash
npm test
npm run typecheck
```

Expected: both pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/agenda/MonthCalendar.tsx tests/premium-agenda.test.cjs
git commit -m "fix: make calendar double tap reliable"
```

---

### Task 3: Make out-of-hours reality explicit without changing timeline data

**Files:**
- Modify: `src/features/agenda/DayTimeline.tsx`
- Modify: `tests/premium-agenda.test.cjs`

**Interfaces:**
- Consumes existing `getAgendaTimelineWindow(state, selectedDate)` behavior.
- No model/store changes.

- [ ] **Step 1: Add a failing source contract for explanatory copy**

Add:

```js
test('Agenda Day explains that real sessions outside the planned schedule remain visible', () => {
  const source = read(timelinePath);
  assert.match(source, /Plan = horario previsto/);
  assert.match(source, /Real = tiempo registrado/);
  assert.match(source, /fuera del horario/);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run `npm test`.

Expected: the new copy contract fails.

- [ ] **Step 3: Add concise helper copy beside the Plan/Real legend**

Add a compact, muted explanatory line in `DayTimeline` using existing theme/type tokens:

```tsx
<Text style={styles.timelineExplanation}>
  Plan = horario previsto · Real = tiempo registrado, incluso fuera del horario.
</Text>
```

The line must sit near the existing Plan/Real legend and must not introduce a card or colored background.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/agenda/DayTimeline.tsx tests/premium-agenda.test.cjs
git commit -m "fix: clarify Agenda plan versus reality"
```

---

### Task 4: Add development-only runtime fingerprint for three-mode Enfoque

**Files:**
- Create: `src/core/runtimeFingerprint.ts`
- Modify: `src/ui/FocoAppMenu.tsx`
- Modify: `tests/premium-focus.test.cjs`
- Modify: `tsconfig.core-test.json`

**Interfaces:**
- Produces: `FOCO_RUNTIME_FINGERPRINT = 'b43f-3mode-focus'`.
- Production UI never renders the marker because display is guarded by `__DEV__`.

- [ ] **Step 1: Write failing contracts**

In `tests/premium-focus.test.cjs`, assert that the canonical selector still has all three labels and the app menu references the development marker:

```js
assert.match(selectorSource, /Pomodoro/);
assert.match(selectorSource, /Temporizador/);
assert.match(selectorSource, /Cronómetro/);
assert.match(menuSource, /FOCO_RUNTIME_FINGERPRINT/);
assert.match(menuSource, /__DEV__/);
```

Add a core test:

```js
const { FOCO_RUNTIME_FINGERPRINT } = require('../.core-test-dist/core/runtimeFingerprint.js');
assert.equal(FOCO_RUNTIME_FINGERPRINT, 'b43f-3mode-focus');
```

- [ ] **Step 2: Run tests and verify RED**

Run `npm test`.

Expected: fail because runtime fingerprint module does not exist.

- [ ] **Step 3: Implement the fingerprint**

Create:

```ts
export const FOCO_RUNTIME_FINGERPRINT = 'b43f-3mode-focus' as const;
```

Add it to `tsconfig.core-test.json`.

In `FocoAppMenu.tsx`, import it and extend the existing footer only in development:

```tsx
<Text style={[styles.version, { color: theme.colors.subtle }]}>
  FOCO {Constants.expoConfig?.version ?? '0.4.0'} · Offline
  {__DEV__ ? ` · ${FOCO_RUNTIME_FINGERPRINT}` : ''}
</Text>
```

Also correct the existing Enfoque menu detail from `Pomodoro y cronómetro` to `Pomodoro, temporizador y cronómetro`.

- [ ] **Step 4: Verify GREEN**

Run:

```bash
npm test
npm run typecheck
```

Expected: pass.

- [ ] **Step 5: Commit**

```bash
git add src/core/runtimeFingerprint.ts src/ui/FocoAppMenu.tsx tests/premium-focus.test.cjs tsconfig.core-test.json
git commit -m "chore: fingerprint B4.3 focus runtime"
```

---

### Task 5: Full F1 validation and draft PR checkpoint

**Files:**
- No product files beyond Tasks 1–4.

- [ ] **Step 1: Run full repository validation**

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android
```

Expected: every command exits 0; Android export completes without unresolved modules.

- [ ] **Step 2: Audit scope**

```bash
git diff --stat 464122c3d46ae945e551b7efb3f99b2efda2a15f...HEAD
git diff --name-only 464122c3d46ae945e551b7efb3f99b2efda2a15f...HEAD
```

Expected product scope: calendar tap helper, Agenda calendar/timeline, runtime fingerprint/app-menu detail, tests, core-test config, spec/plan. No store/model/package/native configuration changes.

- [ ] **Step 3: Keep PR draft and record the physical gate**

The PR body must state that automated F1 is complete but physical Samsung confirmation remains one integrated gate:

1. menu footer shows `b43f-3mode-focus` in development;
2. Enfoque visibly shows three modes;
3. same-date double tap opens exact Día;
4. Agenda Día explains Plan vs Real and still shows early/late recorded sessions.

Do not merge #22→#25 or the closeout PR at this checkpoint.
