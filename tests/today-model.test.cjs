const assert = require('node:assert/strict');
const test = require('node:test');

const {
  addTask,
  createInitialTasks,
  getTodayMetrics,
  toggleTask,
} = require('../.test-dist/model.js');

test('initial tasks expose the expected daily metrics', () => {
  const tasks = createInitialTasks();

  assert.deepEqual(getTodayMetrics(tasks), {
    pending: 4,
    active: 1,
    completed: 1,
  });
});

test('adding a task trims its title and inserts it first', () => {
  const tasks = createInitialTasks();
  const next = addTask(tasks, '  Preparar revisión móvil  ');

  assert.equal(next[0].title, 'Preparar revisión móvil');
  assert.equal(next[0].completed, false);
  assert.equal(next.length, tasks.length + 1);
});

test('adding an empty task leaves the list unchanged', () => {
  const tasks = createInitialTasks();

  assert.equal(addTask(tasks, '   '), tasks);
});

test('toggling a task updates completion without mutating the original list', () => {
  const tasks = createInitialTasks();
  const target = tasks[0];
  const next = toggleTask(tasks, target.id);

  assert.equal(tasks[0].completed, false);
  assert.equal(next[0].completed, true);
  assert.notEqual(next, tasks);
});