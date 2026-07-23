const assert = require('node:assert/strict');
const test = require('node:test');

const analytics = require('../.core-test-dist/core/analytics.js');
const model = require('../.core-test-dist/core/model.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('planned Pomodoros include dated pending work, not only completed tasks', () => {
  let state = model.createInitialState(NOW);
  state = model.createTask(state, {
    title: 'Plan pendiente',
    projectId: 'personal',
    dueAt: NOW,
    estimatedPomodoros: 4,
  }, NOW + 1);

  const stats = analytics.getPeriodStats(state, 'day', NOW);
  assert.equal(stats.completedTasks, 0);
  assert.equal(stats.plannedPomodoros, 4);
});

test('productive hours group focus sessions by local starting hour', () => {
  let state = model.createInitialState(NOW);
  const start = new Date('2026-07-23T09:10:00Z').getTime();
  state = model.addSession(state, {
    projectId: 'personal',
    mode: 'pomodoro',
    phase: 'focus',
    startedAt: start,
    endedAt: start + 1500000,
    durationSec: 1500,
    plannedSec: 1500,
    completed: true,
    interrupted: false,
    cycleNumber: 1,
  }, NOW + 1);

  const hours = analytics.getHourlyProductivity(state, 28, NOW);
  const localHour = new Date(start).getHours();
  assert.equal(hours.length, 24);
  assert.equal(hours[localHour].focusSeconds, 1500);
  assert.equal(hours[localHour].sessionCount, 1);
});
