const test = require('node:test');
const assert = require('node:assert/strict');

const {
  addSubtask,
  createInitialState,
  createTask,
  deleteSubtask,
  toggleSubtask,
} = require('../.core-test-dist/core/model.js');

test('project task subtasks preserve the parent identity and remain a strict third level', () => {
  const now = new Date(2026, 6, 26, 12, 0, 0, 0).getTime();
  let state = createInitialState(now);
  state = createTask(state, { title: 'Preparar presentación', projectId: 'estudios' }, now + 1);
  const parent = state.tasks[0];
  assert.ok(parent);
  const parentId = parent.id;
  const projectId = parent.projectId;

  state = addSubtask(state, parentId, 'Buscar artículos', now + 2);
  state = addSubtask(state, parentId, 'Hacer diapositivas', now + 3);

  let task = state.tasks.find((item) => item.id === parentId);
  assert.ok(task);
  assert.equal(task.projectId, projectId);
  assert.equal(task.subtasks.length, 2);
  assert.notEqual(task.subtasks[0].id, task.subtasks[1].id);
  assert.deepEqual(Object.keys(task.subtasks[0]).sort(), ['completed', 'createdAt', 'id', 'title']);

  const firstSubtaskId = task.subtasks[0].id;
  const secondSubtaskId = task.subtasks[1].id;
  state = toggleSubtask(state, parentId, firstSubtaskId, now + 4);
  task = state.tasks.find((item) => item.id === parentId);
  assert.ok(task);
  assert.equal(task.id, parentId);
  assert.equal(task.projectId, projectId);
  assert.equal(task.subtasks.find((item) => item.id === firstSubtaskId).completed, true);

  state = deleteSubtask(state, parentId, secondSubtaskId, now + 5);
  task = state.tasks.find((item) => item.id === parentId);
  assert.ok(task);
  assert.equal(task.id, parentId);
  assert.equal(task.subtasks.length, 1);
  assert.equal(task.subtasks[0].id, firstSubtaskId);
});
