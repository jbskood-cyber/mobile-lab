# FOCO Premium Focus B4.3D Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve Enfoque from two timing modes into three explicit, persistent and understandable tools — Pomodoro, Temporizador and Cronómetro — while making Pomodoro duration discoverable and keeping completion feedback restrained and premium.

**Architecture:** Preserve the existing `FocusSession` shape, FocoStore state version and reminder architecture. Extend the timer runtime with a dedicated free-countdown duration (`timerSeconds`) and extend `FocusMode` with `timer`; old stored runtimes normalize safely to the existing modes. Keep all timing math pure in `focusTimer.ts`, persistence/session side effects in `useFocusTimer.ts`, and UI discovery/presets in focused reusable components so `FocusScreen` does not become a monolith.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router, TypeScript, existing `expo-notifications`, `expo-haptics`, Reanimated ~4.1.1, Instrument Sans/theme tokens, Node test runner.

## Global Constraints

- Do not change `FocoState.version` (must remain `3`).
- Do not change the persisted `FocusSession` object shape, task/project IDs, migrations, reminders API or notification permission flow.
- `FocusMode` becomes `pomodoro | timer | stopwatch`; existing `pomodoro` and `stopwatch` data must continue to hydrate.
- `Temporizador` is a free countdown, independent from Pomodoro cycles and breaks.
- `Cronómetro` counts upward and must not schedule an end-of-session notification because it has no predetermined end.
- Pomodoro continues to use the existing focus/break/cycle preferences.
- Timer presets are `5, 10, 15, 25, 45, 60` minutes plus custom.
- The main Focus surface must not become a permanent grid of preset buttons.
- All three focus modes persist real focus sessions through the existing session history model.
- Sessions shorter than the existing one-minute storage threshold keep the current behavior unless a failing product requirement proves otherwise.
- Completion feedback is one semantic success haptic + short message; no confetti, mascot, glow-heavy celebration or decorative animation.
- Preserve Development Build, offline-first storage and current B4.3A/B motion/accessibility rules.
- B4.3D is stacked on the CI-green B4.3C head. Do not merge B4.3D before B4.3B is physically accepted and the preceding stack is integrated in order.

---

### Task 1: Three-mode pure timer domain

**Files:**
- Modify: `src/core/model.ts`
- Modify: `src/core/focusTimer.ts`
- Modify: `tsconfig.core-test.json` only if needed for the new test target
- Create: `tests/premium-focus.test.cjs`

**Interfaces:**
- `FocusMode = 'pomodoro' | 'timer' | 'stopwatch'`.
- `FocusRuntime` adds `timerSeconds: number`.
- Export `DEFAULT_TIMER_SECONDS = 25 * 60` from `focusTimer.ts`.
- `TimerConfiguration` accepts optional `timerSeconds`.
- Existing public functions (`setTimerMode`, `getTimerSeconds`, `getTimerProgress`, `getRecordedDuration`, `resetTimer`, `configureTimer`) remain the API consumed by the hook.

- [ ] **Step 1: Write the failing domain contract**

Create `tests/premium-focus.test.cjs`. Import the compiled core modules and assert:

```js
const runtime = createFocusRuntime();
const timer = setTimerMode(runtime, 'timer');
assert.equal(timer.mode, 'timer');
assert.equal(timer.baseSeconds, 25 * 60);
assert.equal(timer.timerSeconds, 25 * 60);

const running = startTimer(timer, 1_000);
assert.equal(getTimerSeconds(running, 61_000), 24 * 60);
assert.equal(getRecordedDuration(running, 61_000), 60);

const custom = configureTimer(timer, { timerSeconds: 45 * 60 });
assert.equal(custom.timerSeconds, 45 * 60);
assert.equal(custom.baseSeconds, 45 * 60);
assert.equal(resetTimer({ ...custom, baseSeconds: 3 }).baseSeconds, 45 * 60);

const stopwatch = setTimerMode(runtime, 'stopwatch');
assert.equal(stopwatch.baseSeconds, 0);
```

Also assert that Pomodoro still resets to `focusSeconds` and `advancePomodoro(timer)` is a no-op for `timer` mode.

- [ ] **Step 2: Run CI and verify RED**

Expected failure: `timer` is not part of `FocusMode` and `timerSeconds` does not exist.

- [ ] **Step 3: Implement the minimal pure runtime change**

In `model.ts`, extend only the `FocusMode` union.

In `focusTimer.ts`:
- add `DEFAULT_TIMER_SECONDS = 25 * 60`;
- initialize `timerSeconds` in `createFocusRuntime`;
- treat `timer` as countdown in `getTimerSeconds`/`recomputeRuntime`;
- make `getPhaseTotalSeconds` return `timerSeconds` for `timer`;
- make `setTimerMode(..., 'timer')` reset to `timerSeconds`;
- make `resetTimer` restore `timerSeconds` for timer, `focusSeconds` for Pomodoro and `0` for stopwatch;
- sanitize configured `timerSeconds` to at least 60 seconds;
- make `configureTimer` update timer base only when current mode is `timer`;
- make `getTimerProgress` use timer total for timer;
- make `getRecordedDuration` return `timerSeconds - remaining` for timer;
- preserve `advancePomodoro` as Pomodoro-only.

- [ ] **Step 4: Verify GREEN**

Run CI. Required: unit tests, typecheck and lint PASS.

- [ ] **Step 5: Commit**

Commit: `feat: add free countdown timer domain — B4.3D`

---

### Task 2: Backward-compatible runtime hydration and timer session lifecycle

**Files:**
- Modify: `src/core/useFocusTimer.ts`
- Test: `tests/premium-focus.test.cjs`

**Interfaces:**
- Existing storage key remains `foco:timer:v2`; the stored object receives additive `timerSeconds` and `mode: 'timer'` values.
- Old stored runtime without `timerSeconds` hydrates with `DEFAULT_TIMER_SECONDS`.
- Add/export a pure helper from `useFocusTimer.ts` only if necessary for testability; prefer moving normalization into `focusTimer.ts` if importing the hook would pull native dependencies into Node tests.

- [ ] **Step 1: Add failing compatibility/source contracts**

Add source assertions that require:
- normalization to recognize `candidate.mode === 'timer'`;
- `timerSeconds` to be passed through `configureTimer`;
- completion logic to handle `runtime.mode === 'timer'`;
- countdown notification scheduling to exclude `stopwatch`;
- a timer completion to persist a `FocusSession` with `mode: 'timer'`, `phase: 'focus'`, `completed: true`, `interrupted: false`.

Add a pure normalization test if normalization is moved to a core helper: legacy `{ mode: 'stopwatch' }` and `{ mode: 'pomodoro' }` stay unchanged; a runtime missing `timerSeconds` gets `DEFAULT_TIMER_SECONDS`.

- [ ] **Step 2: Verify RED**

Expected failure: hook recognizes only stopwatch/pomodoro and has no timer-completion branch.

- [ ] **Step 3: Implement compatibility and lifecycle**

Update normalization:
- mode order: `timer` → timer, `stopwatch` → stopwatch, everything else → pomodoro;
- sanitize/hydrate `timerSeconds`, defaulting to `DEFAULT_TIMER_SECONDS`;
- for a non-running timer without a persisted `baseSeconds`, use `timerSeconds`.

Update notifications:
- do not schedule completion/warning notifications when mode is `stopwatch`;
- Pomodoro keeps existing phase copy;
- Timer schedules one completion notification using copy such as `Temporizador completado` / `Tu sesión quedó registrada.` and optional warning based on the same preference.

Update completion effect:
- Pomodoro keeps its current branch and phase advance;
- Timer reaching zero records exactly one focus session with `plannedSec: timerSeconds`, actual `durationSec: timerSeconds`, `completed: true`, then resets to the configured timer duration and shows `Sesión guardada.` with one success haptic;
- Stopwatch never auto-completes.

Update manual stop:
- stopwatch `plannedSec` remains at least actual duration/current focus reference as today;
- timer `plannedSec` equals configured `timerSeconds`;
- timer partial sessions remain `completed: false`, `interrupted: true`.

- [ ] **Step 4: Verify GREEN**

Run CI. Required: tests, typecheck and lint PASS.

- [ ] **Step 5: Commit**

Commit: `feat: persist timer sessions safely — B4.3D`

---

### Task 3: Three explicit modes and discoverable Pomodoro duration

**Files:**
- Create: `src/features/focus/FocusModeSelector.tsx`
- Modify: `src/features/focus/FocusScreen.tsx`
- Test: `tests/premium-focus.test.cjs`

**Interfaces:**
- `FocusModeSelector` props:
  - `mode: FocusMode`
  - `disabled: boolean`
  - `pomodoroMinutes: number`
  - `timerMinutes: number`
  - `onMode: (mode: FocusMode) => void`
  - `onConfigurePomodoro: () => void`
  - `onConfigureTimer: () => void`
- Selector exposes all three labels: `Pomodoro`, `Temporizador`, `Cronómetro`.

- [ ] **Step 1: Add failing UI contract**

Source assertions require:
- exactly the three user-facing modes;
- `Pomodoro · N min` to be visible/actionable while not running;
- `Temporizador · N min` to be visible/actionable while not running;
- selecting mode disabled during a running session;
- no permanent main-screen preset grid.

- [ ] **Step 2: Implement `FocusModeSelector`**

Use the existing theme, Instrument Sans and `FocoPressable`/premium press behavior. Keep the three mode choices compact and readable on narrow Android widths. Below or integrated with the selector, expose one concise configuration affordance for the active countdown mode:
- Pomodoro: `Pomodoro · 50 min` → `onConfigurePomodoro`;
- Timer: `Temporizador · 25 min` → `onConfigureTimer`;
- Stopwatch: restrained copy `Cronómetro libre`, no duration action.

Do not haptically buzz for routine mode browsing beyond the existing semantic selection behavior.

- [ ] **Step 3: Integrate into `FocusScreen`**

Replace the hard-coded two-mode switch. Preserve task/project context, ring, controls and summary. Update phase/cycle copy:
- timer: phase `Temporizador`, secondary `Cuenta regresiva`;
- stopwatch: `Cronómetro`, secondary `Tiempo acumulado`;
- pomodoro: existing phase/cycle semantics.

`onConfigurePomodoro` opens the existing advanced `Ritmo de enfoque` sheet.

- [ ] **Step 4: Verify GREEN**

Run CI. Required: tests, typecheck, lint PASS.

- [ ] **Step 5: Commit**

Commit: `feat: expose three Focus modes — B4.3D`

---

### Task 4: Compact Timer presets and custom countdown

**Files:**
- Create: `src/features/focus/TimerPresetSheet.tsx`
- Modify: `src/features/focus/FocusScreen.tsx`
- Test: `tests/premium-focus.test.cjs`

**Interfaces:**
- `TimerPresetSheet` props:
  - `visible: boolean`
  - `minutes: number`
  - `onApply: (minutes: number) => void`
  - `onClose: () => void`
- Fixed presets: `[5, 10, 15, 25, 45, 60]`.
- Custom range: 1–180 minutes, using existing integer draft helpers.

- [ ] **Step 1: Add failing preset contract**

Require source to contain all six fixed presets, custom numeric input and `onApply(minutes)`; require FocusScreen to configure `timerSeconds` without calling `updatePreferences` for Pomodoro focus length.

- [ ] **Step 2: Implement sheet**

Use `FocoSheet`, existing field primitives and compact chips/rows. A preset tap selects the candidate; Apply calls `onApply`. Custom input may be empty while editing and is normalized on apply through existing form helpers. No new dependency.

- [ ] **Step 3: Wire timer configuration**

When applied:

```ts
timer.configure({ timerSeconds: minutes * 60 });
```

Do not patch `FocusPreferences.focusMinutes`. Close the sheet, retain task/project context and show the new duration in the selector.

- [ ] **Step 4: Verify GREEN**

Run CI. Required: tests, typecheck and lint PASS.

- [ ] **Step 5: Commit**

Commit: `feat: add Focus timer presets — B4.3D`

---

### Task 5: Completion semantics and regression audit

**Files:**
- Modify: `src/features/focus/FocusScreen.tsx` only if copy/accessibility needs adjustment
- Modify: `src/ui/ProgressRing.tsx` only if existing progress transition does not already resolve smoothly
- Test: `tests/premium-focus.test.cjs`

**Interfaces:**
- No new public state shape.

- [ ] **Step 1: Audit existing ring and completion behavior**

Read `ProgressRing.tsx` before changing it. If it already interpolates progress using the centralized premium motion behavior, do not rewrite it. Add a regression assertion instead.

- [ ] **Step 2: Add completion/accessibility regression contracts**

Require:
- timer value uses tabular numeric style;
- Timer and Pomodoro countdowns expose live-region updates without excessive announcements;
- completion copy includes `Sesión guardada`;
- exactly one success haptic path is invoked for a completed Timer session;
- no celebratory component/confetti dependency is introduced.

- [ ] **Step 3: Implement only gaps found by the audit**

Keep changes minimal. Do not add animation if the existing ring already resolves smoothly.

- [ ] **Step 4: Verify GREEN**

Run tests, typecheck and lint.

- [ ] **Step 5: Commit**

Commit only if product code changed: `fix: polish Focus completion feedback — B4.3D`.

---

### Task 6: Integrated validation and stacked PR readiness

**Files:**
- No product code unless validation exposes a real regression.

- [ ] Run full `npm test` in CI.
- [ ] Run `npm run typecheck` in CI.
- [ ] Run `npm run lint` in CI.
- [ ] Run Expo Doctor in CI.
- [ ] Export Android bundle in CI.
- [ ] Compare B4.3D against B4.3C and confirm no unrelated persistence/migration/Agenda/navigation changes.
- [ ] Keep B4.3D draft/unmerged while predecessor physical/integration gates remain.
- [ ] Update Drive REGISTRO with recognizable Focus checkpoints and ESTADO with the active stack/gate.

## Acceptance Criteria

- Enfoque exposes Pomodoro, Temporizador and Cronómetro as three explicit modes.
- Pomodoro duration is discoverable from the main Focus surface and still opens the existing advanced rhythm settings.
- Timer offers 5/10/15/25/45/60/custom durations without a permanent preset grid on the main screen.
- Timer counts down accurately from its own duration and does not mutate Pomodoro focus preference.
- Stopwatch counts upward and never schedules an automatic end notification.
- Completed Timer sessions and manually stopped partial Timer sessions persist in the existing session history shape.
- Existing Pomodoro cycles/breaks and Stopwatch behavior do not regress.
- Old stored timer runtimes continue to hydrate safely.
- Full tests, typecheck, lint, Expo Doctor and Android export pass before B4.3D is considered technically ready.
