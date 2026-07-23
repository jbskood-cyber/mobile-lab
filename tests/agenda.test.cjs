const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const { getAgendaBuckets, getTasksForDate, searchTasks } = require('../.core-test-dist/core/agenda.js');

const NOW = new Date('2026-07-23T15:00:00Z').getTime();
const DAY = 24 * 60 * 60 * 1000;

function buildState() {
  let state = model.createInitialState(NOW);
  state = { ...state, tasks: [] };
  state = model.createTask(state, { title: 'Atrasada', projectId: 'personal', dueAt: NOW - DAY, notes: 'urgente' }, NOW - 5);
  state = model.createTask(state, { title: 'Hoy', projectId: 'personal', dueAt: NOW + 60 * 60 * 1000 }, NOW - 4);
  state = model.createTask(state, { title: 'Próxima', projectId: 'estudios', dueAt: NOW + 2 * DAY }, NOW - 3);
  state = model.createTask(state, { title: 'Sin fecha', projectId: 'ideas', notes: 'investigar energía solar' }, NOW - 2);
  state = model.createTask(state, { title: 'Terminada', projectId: 'salud', dueAt: NOW }, NOW - 1);
  const completedId = state.tasks[0].id;
  return model.completeTask(state, completedId, NOW).state;
}

test('agenda groups open tasks into overdue, today, upcoming, Inbox and completed', () => {
  const buckets = getAgendaBuckets(buildState(), NOW);

  assert.deepEqual(buckets.overdue.map((task) => task.title), ['Atrasada']);
  assert.deepEqual(buckets.today.map((task) => task.title), ['Hoy']);
  assert.deepEqual(buckets.upcoming.map((task) => task.title), ['Próxima']);
  assert.deepEqual(buckets.noDate.map((task) => task.title), []);
  assert.deepEqual(buckets.inbox.map((task) => task.title), ['Sin fecha']);
  assert.deepEqual(buckets.completed.map((task) => task.title), ['Terminada']);
});

test('task search covers title, notes, project and subtask titles', () => {
  let state = buildState();
  const noDate = state.tasks.find((task) => task.title === 'Sin fecha');
  state = model.addSubtask(state, noDate.id, 'Comparar paneles', NOW + 1);

  assert.equal(searchTasks(state, 'solar').length, 1);
  assert.equal(searchTasks(state, 'estudios')[0].title, 'Próxima');
  assert.equal(searchTasks(state, 'paneles')[0].title, 'Sin fecha');
});

test('date query returns scheduled tasks for one local calendar day', () => {
  const state = buildState();
  const tasks = getTasksForDate(state, NOW);
  assert.deepEqual(tasks.map((task) => task.title).sort(), ['Hoy', 'Terminada'].sort());
});
