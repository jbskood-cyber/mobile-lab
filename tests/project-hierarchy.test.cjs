const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  addSubtask,
  createInitialState,
  createTask,
  deleteSubtask,
  toggleSubtask,
} = require('../.core-test-dist/core/model.js');

const accordionPath = path.join(process.cwd(), 'src', 'features', 'projects', 'ProjectTaskAccordion.tsx');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

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

test('project task accordion exposes one expandable subtask level with inline add and separate details', () => {
  assert.ok(fs.existsSync(accordionPath), 'ProjectTaskAccordion.tsx must exist');
  const source = read(accordionPath);
  assert.match(source, /accessibilityState=\{\{ expanded \}\}/);
  assert.match(source, /subtaskDone/);
  assert.match(source, /task\.subtasks\.length/);
  assert.match(source, /Añadir subtarea/);
  assert.match(source, /TextInput/);
  assert.match(source, /onToggleSubtask\(task\.id, subtask\.id\)/);
  assert.match(source, /onAddSubtask\(task\.id, draft\.trim\(\)\)/);
  assert.match(source, /Abrir detalles/);
  assert.doesNotMatch(source, /<ProjectTaskAccordion/);
});
