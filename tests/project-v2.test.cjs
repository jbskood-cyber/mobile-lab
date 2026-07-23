const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('projects update description and archive state immutably', () => {
  const initial = model.createInitialState(NOW);
  const updated = model.updateProject(initial, 'personal', { name: 'Vida personal', description: 'Rutinas y asuntos propios' }, NOW + 1);
  const archived = model.toggleProjectArchived(updated, 'personal');

  assert.equal(initial.projects.find((project) => project.id === 'personal').name, 'Personal');
  assert.equal(updated.projects.find((project) => project.id === 'personal').description, 'Rutinas y asuntos propios');
  assert.equal(archived.projects.find((project) => project.id === 'personal').archived, true);
});

test('project metrics combine task completion, estimates and linked sessions', () => {
  let state = model.createInitialState(NOW);
  state = model.createTask(state, { title: 'A', projectId: 'trabajo', estimatedPomodoros: 3 }, NOW + 1);
  state = model.createTask(state, { title: 'B', projectId: 'trabajo', estimatedPomodoros: 2 }, NOW + 2);
  const first = state.tasks[0];
  state = model.completeTask(state, first.id, NOW + 3).state;
  state = model.addSession(state, {
    projectId: 'trabajo', taskId: first.id, mode: 'pomodoro', phase: 'focus',
    startedAt: NOW, endedAt: NOW + 1500000, durationSec: 1500, plannedSec: 1500,
    completed: true, interrupted: false, cycleNumber: 1,
  }, NOW + 4);

  const metrics = model.getProjectMetrics(state, 'trabajo');
  assert.equal(metrics.taskCount, 2);
  assert.equal(metrics.completedCount, 1);
  assert.equal(metrics.progress, 0.5);
  assert.equal(metrics.completedPomodoros, 1);
  assert.equal(metrics.plannedPomodoros, 3);
  assert.equal(metrics.focusSeconds, 1500);
});
