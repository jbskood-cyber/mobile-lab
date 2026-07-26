const assert = require('node:assert/strict');
const test = require('node:test');

const model = require('../.core-test-dist/core/model.js');
const { migrateState } = require('../.core-test-dist/core/migration.js');

const NOW = new Date('2026-07-26T18:00:00Z').getTime();

const expectedColorIds = [
  'emerald', 'eucalyptus', 'lime', 'teal', 'cyan',
  'pacific', 'electricBlue', 'cobalt', 'indigo', 'navy',
  'crimson', 'coral', 'mandarin', 'terracotta', 'amber',
  'violet', 'iris', 'purple', 'orchid', 'raspberry', 'fuchsia',
];

test('project colors persist named token IDs instead of raw hex values', () => {
  assert.deepEqual([...model.PROJECT_COLOR_IDS], expectedColorIds);
  assert.equal(model.PROJECT_COLOR_IDS.includes('amber'), true);
  assert.equal(model.PROJECT_COLOR_IDS.some((value) => value.startsWith('#')), false);
});

test('legacy projects gain deterministic valid colors without changing project IDs', () => {
  const legacy = {
    version: 3,
    projects: [
      { id: 'p1', name: 'Uno', icon: 'book', archived: false, description: '', sortOrder: 0, createdAt: NOW, updatedAt: NOW },
      { id: 'p2', name: 'Dos', icon: 'heart', color: 'not-a-token', archived: false, description: '', sortOrder: 1, createdAt: NOW, updatedAt: NOW },
      { id: 'p3', name: 'Tres', icon: 'briefcase', color: 'cobalt', archived: false, description: '', sortOrder: 2, createdAt: NOW, updatedAt: NOW },
    ],
    tasks: [],
    sessions: [],
    routines: [],
    preferences: model.defaultFocusPreferences,
    planning: model.defaultPlanningPreferences,
    appearance: 'system',
  };

  const first = migrateState(legacy, NOW + 1);
  const second = migrateState(legacy, NOW + 9999);

  assert.deepEqual(first.projects.map((project) => project.id), ['p1', 'p2', 'p3']);
  assert.equal(model.PROJECT_COLOR_IDS.includes(first.projects[0].color), true);
  assert.equal(model.PROJECT_COLOR_IDS.includes(first.projects[1].color), true);
  assert.equal(first.projects[2].color, 'cobalt');
  assert.equal(first.projects[0].color, second.projects[0].color);
  assert.equal(first.projects[1].color, second.projects[1].color);
});

test('create and update project keep icon and color as independent fields', () => {
  let state = model.createInitialState(NOW);
  state = model.addProject(state, 'Universidad', 'book', 'violet', NOW + 1);
  const created = state.projects[0];

  assert.equal(created.icon, 'book');
  assert.equal(created.color, 'violet');

  state = model.updateProject(state, created.id, { icon: 'heart' }, NOW + 2);
  const iconChanged = state.projects.find((project) => project.id === created.id);
  assert.equal(iconChanged.icon, 'heart');
  assert.equal(iconChanged.color, 'violet');

  state = model.updateProject(state, created.id, { color: 'teal' }, NOW + 3);
  const colorChanged = state.projects.find((project) => project.id === created.id);
  assert.equal(colorChanged.icon, 'heart');
  assert.equal(colorChanged.color, 'teal');
});
