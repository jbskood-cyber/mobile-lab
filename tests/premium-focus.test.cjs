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
