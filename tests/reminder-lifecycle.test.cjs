const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const reminders = require('../.core-test-dist/platform/reminderModel.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('completing a recurring task advances its due date and reminder together', () => {
  let state = model.createInitialState(NOW);
  state = model.createTask(state, {
    title: 'Rutina recurrente',
    projectId: 'personal',
    dueAt: NOW + 60 * 60 * 1000,
    reminderAt: NOW + 30 * 60 * 1000,
    recurrence: { kind: 'daily', interval: 1 },
  }, NOW + 1);

  const original = state.tasks[0];
  const result = model.completeTask(state, original.id, NOW + 2);
  const next = result.generatedTask;

  assert.ok(next);
  assert.equal(next.dueAt - original.dueAt, 24 * 60 * 60 * 1000);
  assert.equal(next.reminderAt - original.reminderAt, 24 * 60 * 60 * 1000);

  const request = reminders.buildReminderRequest(next, NOW + 3);
  assert.ok(request);
  assert.equal(request.taskId, next.id);
  assert.equal(request.date, next.reminderAt);
});

test('completed or past reminders do not produce notification requests', () => {
  const state = model.createInitialState(NOW);
  const base = model.createTask(state, {
    title: 'Recordatorio vencido',
    projectId: 'personal',
    reminderAt: NOW - 1,
  }, NOW - 2).tasks[0];

  assert.equal(reminders.buildReminderRequest(base, NOW), null);
  assert.equal(reminders.buildReminderRequest({ ...base, reminderAt: NOW + 1000, completed: true }, NOW), null);
});
