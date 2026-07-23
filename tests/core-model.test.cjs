const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/model.js');
const timer = require('../.core-test-dist/focusTimer.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('task creation, completion and restore preserve immutable state', () => {
  const initial = model.createInitialState(NOW);
  const withTask = model.addTask(initial, '  Preparar demo premium  ', 'plan-maestro', 'Alta', NOW + 1);
  assert.equal(withTask.tasks[0].title, 'Preparar demo premium');
  assert.notEqual(withTask, initial);

  const completed = model.toggleTask(withTask, withTask.tasks[0].id, NOW + 2);
  assert.equal(completed.tasks[0].completed, true);
  assert.equal(withTask.tasks[0].completed, false);

  const removedTask = completed.tasks[0];
  const deleted = model.deleteTask(completed, removedTask.id);
  const restored = model.restoreTask(deleted, removedTask);
  assert.equal(restored.tasks[0].id, removedTask.id);
});

test('projects reject duplicate names and derive progress from tasks', () => {
  const initial = model.createInitialState(NOW);
  const duplicate = model.addProject(initial, 'plan MAESTRO', 'grid', NOW + 1);
  assert.equal(duplicate, initial);

  const next = model.addProject(initial, 'Universidad', 'book', NOW + 2);
  assert.equal(next.projects[0].name, 'Universidad');

  const metrics = model.getProjectMetrics(initial, 'personal');
  assert.equal(metrics.taskCount, 2);
  assert.equal(metrics.completedCount, 1);
  assert.equal(metrics.progress, 0.5);
});

test('week stats aggregate sessions into seven day buckets', () => {
  const initial = model.createInitialState(NOW);
  const stats = model.getWeekStats(initial, 0, NOW);
  assert.equal(stats.daySeconds.length, 7);
  assert.equal(stats.totalSeconds, stats.daySeconds.reduce((sum, value) => sum + value, 0));
  assert.ok(stats.totalSeconds > 0);
});

test('timestamp timer stays accurate when JS updates are delayed', () => {
  const runtime = timer.createFocusRuntime();
  const started = timer.startTimer(runtime, NOW);
  assert.equal(timer.getTimerSeconds(started, NOW + 15_000), runtime.focusSeconds - 15);

  const paused = timer.pauseTimer(started, NOW + 15_000);
  assert.equal(paused.running, false);
  assert.equal(timer.getTimerSeconds(paused, NOW + 30_000), runtime.focusSeconds - 15);
});

test('stopwatch, configuration and pomodoro phase transitions are deterministic', () => {
  let runtime = timer.setTimerMode(timer.createFocusRuntime(), 'stopwatch');
  runtime = timer.startTimer(runtime, NOW);
  assert.equal(timer.getTimerSeconds(runtime, NOW + 42_000), 42);

  runtime = timer.configureTimer(timer.setTimerMode(runtime, 'pomodoro'), {
    focusSeconds: 25 * 60,
    breakSeconds: 5 * 60,
    targetCycles: 4,
  });
  assert.equal(runtime.baseSeconds, 25 * 60);
  assert.equal(runtime.targetCycles, 4);

  const breakRuntime = timer.advancePomodoro(runtime);
  assert.equal(breakRuntime.phase, 'break');
  assert.equal(breakRuntime.baseSeconds, 5 * 60);
});
