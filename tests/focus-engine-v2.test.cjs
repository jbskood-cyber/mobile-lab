const assert = require('node:assert/strict');
const test = require('node:test');

const timer = require('../.core-test-dist/core/focusTimer.js');

const NOW = new Date('2026-07-23T15:00:00Z').getTime();

const preferences = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakEvery: 4,
  targetCycles: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  continuousMode: false,
  keepAwake: true,
  vibrationEnabled: true,
  soundEnabled: true,
  notifyBeforeEndMinutes: 1,
};

test('focus completion selects short break before the configured long-break cycle', () => {
  const runtime = { ...timer.createFocusRuntime(preferences), currentCycle: 2 };
  const next = timer.advancePomodoro(runtime, NOW);

  assert.equal(next.phase, 'shortBreak');
  assert.equal(next.baseSeconds, 5 * 60);
  assert.equal(next.running, true);
});

test('focus completion selects long break at the configured cycle boundary', () => {
  const runtime = { ...timer.createFocusRuntime(preferences), currentCycle: 4 };
  const next = timer.advancePomodoro(runtime, NOW);

  assert.equal(next.phase, 'longBreak');
  assert.equal(next.baseSeconds, 15 * 60);
  assert.equal(next.running, true);
});

test('break completion advances cycle and honors auto-start focus preference', () => {
  const runtime = { ...timer.createFocusRuntime(preferences), phase: 'shortBreak', currentCycle: 2, baseSeconds: 0 };
  const next = timer.advancePomodoro(runtime, NOW);

  assert.equal(next.phase, 'focus');
  assert.equal(next.currentCycle, 3);
  assert.equal(next.baseSeconds, 25 * 60);
  assert.equal(next.running, false);
});

test('continuous mode automatically starts every next phase', () => {
  const continuous = { ...preferences, continuousMode: true, autoStartBreaks: false, autoStartFocus: false };
  const runtime = timer.createFocusRuntime(continuous);
  const next = timer.advancePomodoro(runtime, NOW);
  assert.equal(next.running, true);
  assert.equal(next.anchorMs, NOW);
});

test('timer remains timestamp-based and preserves selected task context', () => {
  const runtime = timer.startTimer({ ...timer.createFocusRuntime(preferences), projectId: 'trabajo', taskId: 't1' }, NOW);
  assert.equal(timer.getTimerSeconds(runtime, NOW + 65_000), 25 * 60 - 65);
  assert.equal(runtime.taskId, 't1');
  assert.equal(runtime.projectId, 'trabajo');
});
