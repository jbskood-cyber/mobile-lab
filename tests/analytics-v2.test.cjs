const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const { getPeriodStats, getProjectDistribution, getRecentSessions, getStreak } = require('../.core-test-dist/core/analytics.js');

const NOW = new Date('2026-07-23T15:00:00Z').getTime();
const DAY = 24 * 60 * 60 * 1000;

function buildState() {
  let state = model.createInitialState(NOW);
  state = { ...state, tasks: [], sessions: [] };
  state = model.createTask(state, { title: 'Entrega', projectId: 'trabajo', dueAt: NOW, estimatedPomodoros: 3 }, NOW - DAY);
  const taskId = state.tasks[0].id;
  state = model.completeTask(state, taskId, NOW).state;
  state = model.addSession(state, {
    projectId: 'trabajo', taskId, mode: 'pomodoro', phase: 'focus', startedAt: NOW - 3000 * 1000,
    endedAt: NOW, durationSec: 3000, plannedSec: 3000, completed: true, interrupted: false, cycleNumber: 1,
  }, NOW + 1);
  state = model.addSession(state, {
    projectId: 'estudios', mode: 'pomodoro', phase: 'focus', startedAt: NOW - DAY - 1500 * 1000,
    endedAt: NOW - DAY, durationSec: 1500, plannedSec: 1500, completed: true, interrupted: false, cycleNumber: 1,
  }, NOW + 2);
  return state;
}

test('period stats report focus, tasks and planned versus completed pomodoros', () => {
  const stats = getPeriodStats(buildState(), 'week', NOW);

  assert.equal(stats.totalFocusSec, 4500);
  assert.equal(stats.completedTasks, 1);
  assert.equal(stats.completedPomodoros, 2);
  assert.equal(stats.plannedPomodoros, 3);
  assert.equal(stats.series.length, 7);
  assert.ok(Number.isFinite(stats.changePercent));
});

test('streak counts consecutive local days with focus or completed tasks', () => {
  assert.equal(getStreak(buildState(), NOW), 2);
});

test('project distribution and recent sessions preserve real context', () => {
  const state = buildState();
  const distribution = getProjectDistribution(state, 'week', NOW);
  const recent = getRecentSessions(state, 5);

  assert.equal(distribution[0].projectId, 'trabajo');
  assert.equal(distribution[0].focusSeconds, 3000);
  assert.equal(recent[0].taskTitle, 'Entrega');
  assert.equal(recent[0].projectName, 'Trabajo');
});
