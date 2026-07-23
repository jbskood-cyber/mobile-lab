const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const timer = require('../.core-test-dist/core/focusTimer.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('compatibility task helpers remain immutable on v2 state', () => {
  const initial = model.createInitialState(NOW);
  const withTask = model.addTask(initial, '  Preparar demo premium  ', 'personal', 'Alta', NOW + 1);
  assert.equal(withTask.tasks[0].title, 'Preparar demo premium');
  assert.notEqual(withTask, initial);

  const completed = model.toggleTask(withTask, withTask.tasks[0].id, NOW + 2);
  assert.equal(completed.tasks.find((task) => task.id === withTask.tasks[0].id).completed, true);
  assert.equal(withTask.tasks[0].completed, false);

  const removedTask = completed.tasks.find((task) => task.id === withTask.tasks[0].id);
  const deleted = model.deleteTask(completed, removedTask.id);
  const restored = model.restoreTask(deleted, removedTask);
  assert.equal(restored.tasks[0].id, removedTask.id);
});

test('projects reject duplicate names and derive real metrics', () => {
  let state = model.createInitialState(NOW);
  const duplicate = model.addProject(state, 'PERSONAL', 'grid', NOW + 1);
  assert.equal(duplicate, state);

  state = model.createTask(state, { title: 'Uno', projectId: 'personal', estimatedPomodoros: 2 }, NOW + 2);
  state = model.createTask(state, { title: 'Dos', projectId: 'personal' }, NOW + 3);
  state = model.completeTask(state, state.tasks[0].id, NOW + 4).state;
  const metrics = model.getProjectMetrics(state, 'personal');
  assert.equal(metrics.taskCount, 2);
  assert.equal(metrics.completedCount, 1);
  assert.equal(metrics.progress, 0.5);
});

test('week stats aggregate only real focus sessions into seven buckets', () => {
  let state = model.createInitialState(NOW);
  state = model.addSession(state, {
    projectId: 'personal', mode: 'pomodoro', phase: 'focus', startedAt: NOW - 1500000,
    endedAt: NOW, durationSec: 1500, plannedSec: 1500, completed: true, interrupted: false, cycleNumber: 1,
  }, NOW + 1);
  const stats = model.getWeekStats(state, 0, NOW);
  assert.equal(stats.daySeconds.length, 7);
  assert.equal(stats.totalSeconds, 1500);
});

test('timestamp timer stays accurate when JS updates are delayed', () => {
  const runtime = timer.createFocusRuntime();
  const started = timer.startTimer(runtime, NOW);
  assert.equal(timer.getTimerSeconds(started, NOW + 15_000), runtime.focusSeconds - 15);
  const paused = timer.pauseTimer(started, NOW + 15_000);
  assert.equal(paused.running, false);
  assert.equal(timer.getTimerSeconds(paused, NOW + 30_000), runtime.focusSeconds - 15);
});

test('stopwatch and configuration remain deterministic', () => {
  let runtime = timer.setTimerMode(timer.createFocusRuntime(), 'stopwatch');
  runtime = timer.startTimer(runtime, NOW);
  assert.equal(timer.getTimerSeconds(runtime, NOW + 42_000), 42);

  runtime = timer.configureTimer(timer.setTimerMode(runtime, 'pomodoro'), {
    focusSeconds: 25 * 60,
    shortBreakSeconds: 5 * 60,
    targetCycles: 4,
  });
  assert.equal(runtime.baseSeconds, 25 * 60);
  assert.equal(runtime.targetCycles, 4);
  assert.equal(timer.advancePomodoro(runtime, NOW).phase, 'shortBreak');
});

test('foreground recomputation stops elapsed countdown but preserves stopwatch', () => {
  const configured = timer.configureTimer(timer.createFocusRuntime(), { focusSeconds: 60 });
  const restored = timer.recomputeRuntime(timer.startTimer(configured, NOW), NOW + 65_000);
  assert.equal(restored.running, false);
  assert.equal(restored.baseSeconds, 0);

  const stopwatch = timer.startTimer(timer.setTimerMode(timer.createFocusRuntime(), 'stopwatch'), NOW);
  const active = timer.recomputeRuntime(stopwatch, NOW + 65_000);
  assert.equal(active.running, true);
  assert.equal(timer.getTimerSeconds(active, NOW + 65_000), 65);
});
