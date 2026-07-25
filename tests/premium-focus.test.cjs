const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_TIMER_SECONDS,
  advancePomodoro,
  configureTimer,
  createFocusRuntime,
  getRecordedDuration,
  getTimerSeconds,
  resetTimer,
  setTimerMode,
  startTimer,
} = require('../.core-test-dist/core/focusTimer.js');

const hookSource = fs.readFileSync(path.join(__dirname, '../src/core/useFocusTimer.ts'), 'utf8');
const focusScreenSource = fs.readFileSync(path.join(__dirname, '../src/features/focus/FocusScreen.tsx'), 'utf8');
const selectorSource = fs.readFileSync(path.join(__dirname, '../src/features/focus/FocusModeSelector.tsx'), 'utf8');
const presetSource = fs.readFileSync(path.join(__dirname, '../src/features/focus/TimerPresetSheet.tsx'), 'utf8');

test('free countdown timer has its own deterministic duration and does not change Pomodoro semantics', () => {
  const runtime = createFocusRuntime();
  const timer = setTimerMode(runtime, 'timer');

  assert.equal(DEFAULT_TIMER_SECONDS, 25 * 60);
  assert.equal(timer.mode, 'timer');
  assert.equal(timer.timerSeconds, 25 * 60);
  assert.equal(timer.baseSeconds, 25 * 60);

  const running = startTimer(timer, 1_000);
  assert.equal(getTimerSeconds(running, 61_000), 24 * 60);
  assert.equal(getRecordedDuration(running, 61_000), 60);

  const custom = configureTimer(timer, { timerSeconds: 45 * 60 });
  assert.equal(custom.timerSeconds, 45 * 60);
  assert.equal(custom.baseSeconds, 45 * 60);
  assert.equal(resetTimer({ ...custom, baseSeconds: 3 }).baseSeconds, 45 * 60);

  const pomodoro = setTimerMode(custom, 'pomodoro');
  assert.equal(resetTimer({ ...pomodoro, baseSeconds: 3 }).baseSeconds, pomodoro.focusSeconds);
  assert.deepEqual(advancePomodoro(timer, 99_000), timer);
});

test('stopwatch remains an open-ended count-up mode', () => {
  const runtime = createFocusRuntime();
  const stopwatch = setTimerMode(runtime, 'stopwatch');
  assert.equal(stopwatch.baseSeconds, 0);
  const running = startTimer(stopwatch, 1_000);
  assert.equal(getTimerSeconds(running, 61_000), 60);
  assert.equal(getRecordedDuration(running, 61_000), 60);
});

test('timer runtime hydration and lifecycle remain backward-compatible', () => {
  assert.match(hookSource, /candidate\.mode === 'timer'/);
  assert.match(hookSource, /timerSeconds: candidate\.timerSeconds \?\? DEFAULT_TIMER_SECONDS/);
  assert.match(hookSource, /runtime\.mode === 'stopwatch'\) return/);
  assert.match(hookSource, /runtime\.mode === 'timer' \? timerCopy\(\) : phaseCopy/);
  assert.match(hookSource, /mode: 'timer' as FocusMode/);
  assert.match(hookSource, /plannedSec = runtime\.timerSeconds/);
  assert.match(hookSource, /completed: true/);
  assert.match(hookSource, /interrupted: false/);
  assert.match(hookSource, /setMessage\(\{ text: 'Sesión guardada\.'/);
});

test('Focus exposes exactly Pomodoro, Timer and Stopwatch without a permanent preset grid', () => {
  assert.match(selectorSource, /mode: 'pomodoro', label: 'Pomodoro'/);
  assert.match(selectorSource, /mode: 'timer', label: 'Temporizador'/);
  assert.match(selectorSource, /mode: 'stopwatch', label: 'Cronómetro'/);
  assert.match(selectorSource, /Pomodoro · \$\{pomodoroMinutes\} min/);
  assert.match(selectorSource, /Temporizador · \$\{timerMinutes\} min/);
  assert.match(selectorSource, /disabled=\{disabled\}/);
  assert.match(focusScreenSource, /<FocusModeSelector/);
  assert.match(focusScreenSource, /onConfigureTimer=\{\(\) => setTimerPresetOpen\(true\)\}/);
  assert.doesNotMatch(focusScreenSource, /\[5,\s*10,\s*15,\s*25,\s*45,\s*60\]/);
});

test('Timer presets stay compact and do not mutate Pomodoro preferences', () => {
  assert.match(presetSource, /\[5, 10, 15, 25, 45, 60\]/);
  assert.match(presetSource, /parseOptionalInteger\(draft, 1, 180\)/);
  assert.match(presetSource, /onApply\(parsed\)/);
  assert.match(focusScreenSource, /timer\.configure\(\{ timerSeconds: minutes \* 60 \}\)/);
  assert.doesNotMatch(focusScreenSource, /timer\.configure\(\{ timerSeconds: minutes \* 60 \},\s*\{/);
});

test('countdown UI keeps restrained completion and accessible numeric feedback', () => {
  assert.match(focusScreenSource, /accessibilityLiveRegion="polite"/);
  assert.match(focusScreenSource, /fontVariant: \['tabular-nums'\]/);
  assert.match(hookSource, /setMessage\(\{ text: 'Sesión guardada\.'/);
  assert.doesNotMatch(focusScreenSource + hookSource, /confetti|mascot|celebrat/i);
});
