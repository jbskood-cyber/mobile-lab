const assert = require('node:assert/strict');
const test = require('node:test');

const { buildReminderRequest } = require('../.core-test-dist/platform/reminderModel.js');

const DUE = new Date('2026-07-24T15:00:00Z').getTime();

test('builds one-off local reminder descriptor from task data', () => {
  const request = buildReminderRequest({
    id: 't1', title: 'Preparar entrega', notes: 'Adjuntar reporte', reminderAt: DUE - 30 * 60 * 1000,
    dueAt: DUE, recurrence: { kind: 'none', interval: 1 },
  });

  assert.equal(request.taskId, 't1');
  assert.equal(request.title, 'Preparar entrega');
  assert.equal(request.body, 'Vence en 30 min');
  assert.equal(request.date, DUE - 30 * 60 * 1000);
});

test('returns null when a task has no future reminder', () => {
  assert.equal(buildReminderRequest({ id: 't2', title: 'Sin alarma' }, DUE), null);
  assert.equal(buildReminderRequest({ id: 't3', title: 'Pasada', reminderAt: DUE - 1 }, DUE), null);
});
