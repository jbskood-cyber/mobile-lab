const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const { migrateState } = require('../.core-test-dist/core/migration.js');

const NOW = new Date('2026-07-23T15:00:00Z').getTime();
const DAY = 24 * 60 * 60 * 1000;

test('migrates v1 state to v2 without losing projects, tasks or sessions', () => {
  const legacy = {
    version: 1,
    projects: [{ id: 'p1', name: 'Universidad', icon: 'book', archived: false, createdAt: NOW - DAY }],
    tasks: [{ id: 't1', title: 'Estudiar', projectId: 'p1', priority: 'Alta', completed: false, inProgress: false, favorite: false, createdAt: NOW - DAY }],
    sessions: [{ id: 's1', projectId: 'p1', mode: 'pomodoro', startedAt: NOW - 1500000, endedAt: NOW, durationSec: 1500 }],
  };

  const migrated = migrateState(legacy, NOW);

  assert.equal(migrated.version, 2);
  assert.equal(migrated.projects[0].name, 'Universidad');
  assert.equal(migrated.tasks[0].title, 'Estudiar');
  assert.equal(migrated.tasks[0].estimatedPomodoros, 1);
  assert.deepEqual(migrated.tasks[0].subtasks, []);
  assert.equal(migrated.sessions[0].plannedSec, 1500);
  assert.equal(migrated.preferences.focusMinutes, 50);
});

test('creates rich tasks with schedule, notes, recurrence, estimates and subtasks', () => {
  const initial = model.createInitialState(NOW);
  const dueAt = NOW + DAY;
  const state = model.createTask(initial, {
    title: 'Preparar examen',
    projectId: 'estudios',
    priority: 'Alta',
    dueAt,
    reminderAt: dueAt - 30 * 60 * 1000,
    recurrence: { kind: 'daily', interval: 1 },
    notes: 'Repasar unidades 3 y 4',
    estimatedPomodoros: 4,
    subtasks: ['Leer apuntes', 'Resolver ejercicios'],
  }, NOW);

  const task = state.tasks[0];
  assert.equal(task.title, 'Preparar examen');
  assert.equal(task.dueAt, dueAt);
  assert.equal(task.notes, 'Repasar unidades 3 y 4');
  assert.equal(task.estimatedPomodoros, 4);
  assert.equal(task.subtasks.length, 2);
  assert.equal(task.subtasks[0].completed, false);
});

test('completing a recurring task creates the next occurrence and undo removes it', () => {
  let state = model.createInitialState(NOW);
  state = model.createTask(state, {
    title: 'Entrenar',
    projectId: 'salud',
    dueAt: NOW,
    recurrence: { kind: 'daily', interval: 1 },
  }, NOW);
  const taskId = state.tasks[0].id;

  const result = model.completeTask(state, taskId, NOW + 1000);

  assert.equal(result.completedTask.completed, true);
  assert.ok(result.generatedTask);
  assert.equal(result.generatedTask.dueAt, NOW + DAY);
  assert.equal(result.state.tasks.filter((task) => task.title === 'Entrenar').length, 2);

  const undone = model.undoTaskCompletion(result.state, result);
  assert.equal(undone.tasks.find((task) => task.id === taskId).completed, false);
  assert.equal(undone.tasks.filter((task) => task.title === 'Entrenar').length, 1);
});

test('duplicates, postpones and updates subtasks immutably', () => {
  let state = model.createInitialState(NOW);
  state = model.createTask(state, { title: 'Plan semanal', projectId: 'personal', dueAt: NOW }, NOW);
  const original = state.tasks[0];

  state = model.addSubtask(state, original.id, 'Definir prioridades', NOW + 1);
  const subtaskId = state.tasks.find((task) => task.id === original.id).subtasks[0].id;
  state = model.toggleSubtask(state, original.id, subtaskId, NOW + 2);
  state = model.postponeTask(state, original.id, 1, NOW + 3);
  state = model.duplicateTask(state, original.id, NOW + 4);

  const updatedOriginal = state.tasks.find((task) => task.id === original.id);
  assert.equal(updatedOriginal.dueAt, NOW + DAY);
  assert.equal(updatedOriginal.subtasks[0].completed, true);
  assert.equal(state.tasks.filter((task) => task.title === 'Plan semanal').length, 2);
  assert.notEqual(state.tasks[0].id, original.id);
});
