const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const { migrateState } = require('../.core-test-dist/core/migration.js');
const { createDemoState } = require('../.core-test-dist/core/demoState.js');
const { buildDayPlan, getMomentumTask, getReplanQueue, placeTaskInBestGap } = require('../.core-test-dist/core/dayPlan.js');
const { buildMonthGrid, getTimelinePosition } = require('../.core-test-dist/core/calendar.js');
const { parseBackup, serializeBackup, tasksToCsv } = require('../.core-test-dist/core/backup.js');
const { resolveTheme } = require('../.core-test-dist/ui/themeModel.js');

const NOW = new Date('2026-07-23T15:00:00-06:00').getTime();

test('v2 state migrates to v3 without losing tasks and gains planning defaults', () => {
  const legacy = {
    version: 2,
    projects: [{ id: 'p', name: 'Proyecto', icon: 'grid', archived: false, description: '', sortOrder: 0, createdAt: NOW, updatedAt: NOW }],
    tasks: [{ id: 't', title: 'Tarea', projectId: 'p', priority: 'Alta', completed: false, inProgress: false, favorite: false, notes: '', dueAt: NOW, recurrence: { kind: 'weekly', interval: 2 }, estimatedPomodoros: 2, subtasks: [], sortOrder: 0, createdAt: NOW, updatedAt: NOW }],
    sessions: [],
    preferences: {},
  };
  const state = migrateState(legacy, NOW);
  assert.equal(state.version, 3);
  assert.equal(state.tasks[0].title, 'Tarea');
  assert.equal(state.tasks[0].durationMinutes, 30);
  assert.equal(state.tasks[0].recurrence.fromCompletion, false);
  assert.equal(state.appearance, 'system');
  assert.equal(state.planning.workdayStartHour, 7);
});

test('completion-based recurrence anchors the next occurrence to completion time and preserves offsets', () => {
  let state = model.createInitialState(NOW);
  const originalStart = NOW;
  const originalDue = NOW + 60 * 60 * 1000;
  const originalReminder = NOW - 10 * 60 * 1000;
  state = model.createTask(state, { title: 'Rutina', projectId: 'personal', dueAt: originalDue, plannedStartAt: originalStart, reminderAt: originalReminder, durationMinutes: 60, recurrence: { kind: 'daily', interval: 2, fromCompletion: true } }, NOW - 1000);
  const task = state.tasks[0];
  const completedAt = NOW + 5 * 60 * 60 * 1000;
  const result = model.completeTask(state, task.id, completedAt);
  assert.ok(result.generatedTask);
  assert.equal(result.generatedTask.plannedStartAt, completedAt + 2 * model.DAY_MS);
  assert.equal(result.generatedTask.dueAt - result.generatedTask.plannedStartAt, originalDue - originalStart);
  assert.equal(result.generatedTask.reminderAt - result.generatedTask.plannedStartAt, originalReminder - originalStart);
});

test('replanning a task moves deadline and reminder with the new calendar slot', () => {
  let state = model.createInitialState(NOW);
  const oldStart = NOW - model.DAY_MS;
  state = model.createTask(state, { title: 'Recuperar', plannedStartAt: oldStart, dueAt: oldStart + 45 * 60_000, reminderAt: oldStart - 5 * 60_000, durationMinutes: 45, captured: false }, NOW - 2000);
  const task = state.tasks[0];
  const newStart = NOW + model.DAY_MS;
  const replanned = model.scheduleTask(state, task.id, newStart, NOW);
  const updated = replanned.tasks.find((item) => item.id === task.id);
  assert.equal(updated.plannedStartAt, newStart);
  assert.equal(updated.dueAt, newStart + 45 * 60_000);
  assert.equal(updated.reminderAt, newStart - 5 * 60_000);
  assert.equal(updated.captured, false);
});

test('demo state populates calendar, inbox, routines and analytics history', () => {
  const state = createDemoState(NOW);
  assert.ok(state.tasks.length >= 12);
  assert.ok(state.tasks.some((task) => task.captured));
  assert.ok(state.tasks.some((task) => task.plannedStartAt));
  assert.ok(state.tasks.some((task) => task.completed));
  assert.ok(state.sessions.length >= 10);
  assert.ok(state.routines.length >= 2);
});

test('adaptive day calculates gaps and overload and can place a flexible task', () => {
  let state = model.createInitialState(NOW);
  const day = model.startOfLocalDay(NOW);
  state = model.createTask(state, { title: 'Fija', plannedStartAt: model.atLocalTime(day, 9), dueAt: model.atLocalTime(day, 10), durationMinutes: 60, captured: false }, NOW - 3000);
  state = model.createTask(state, { title: 'Flexible', dueAt: model.atLocalTime(day, 18), durationMinutes: 45, captured: false }, NOW - 2000);
  const flexibleId = state.tasks[0].id;
  const plan = buildDayPlan(state, day);
  assert.equal(plan.scheduled.length, 1);
  assert.equal(plan.flexible.length, 1);
  assert.ok(plan.gaps.length > 0);
  const placed = placeTaskInBestGap(state, flexibleId, day, NOW);
  assert.ok(placed.tasks.find((task) => task.id === flexibleId).plannedStartAt);
});

test('replan and Momentum prioritize overdue high-priority work', () => {
  let state = model.createInitialState(NOW);
  state = model.createTask(state, { title: 'Baja', priority: 'Baja', dueAt: NOW - model.DAY_MS, captured: false }, NOW - 5000);
  state = model.createTask(state, { title: 'Urgente', priority: 'Alta', dueAt: NOW - 2 * model.DAY_MS, firstStep: 'Abrir documento', captured: false }, NOW - 4000);
  assert.equal(getReplanQueue(state, NOW)[0].title, 'Urgente');
  assert.equal(getMomentumTask(state, NOW).title, 'Urgente');
});

test('calendar always returns a six-week grid and timeline uses duration', () => {
  const state = createDemoState(NOW);
  const grid = buildMonthGrid(state, NOW, NOW);
  assert.equal(grid.length, 42);
  assert.equal(grid.filter((day) => day.inMonth).length, 31);
  const task = state.tasks.find((item) => item.plannedStartAt);
  const position = getTimelinePosition(task, task.plannedStartAt, 7);
  assert.ok(position.top >= 0);
  assert.ok(position.height >= 38);
});

test('backup round-trips, rejects foreign JSON and escapes CSV', () => {
  const state = createDemoState(NOW);
  const source = serializeBackup(state, NOW);
  const restored = parseBackup(source, NOW);
  assert.equal(restored.state.tasks.length, state.tasks.length);
  assert.throws(() => parseBackup('{"hello":"world"}', NOW), /FOCO|formato/);
  const csvState = model.createTask(model.createInitialState(NOW), { title: 'Uno, "dos"', notes: 'línea\nnueva' }, NOW);
  const csv = tasksToCsv(csvState);
  assert.match(csv, /"Uno, ""dos"""/);
  assert.match(csv, /"línea\nnueva"/);
});

test('theme resolution respects explicit preference and system fallback', () => {
  assert.equal(resolveTheme('light', 'dark'), 'light');
  assert.equal(resolveTheme('dark', 'light'), 'dark');
  assert.equal(resolveTheme('system', 'light'), 'light');
  assert.equal(resolveTheme('system', null), 'dark');
});
