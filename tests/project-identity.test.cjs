const test = require('node:test');
const assert = require('node:assert/strict');

const model = require('../.core-test-dist/core/model.js');
const { migrateState } = require('../.core-test-dist/core/migration.js');

const {
  PROJECT_COLOR_IDS,
  PROJECT_ICON_IDS,
  addProject,
  createInitialState,
  defaultProjectColor,
  updateProject,
} = model;

test('project identity catalogs are finite, unique, and seeded on every project', () => {
  assert.equal(PROJECT_ICON_IDS.length, 32);
  assert.equal(new Set(PROJECT_ICON_IDS).size, 32);
  assert.equal(PROJECT_COLOR_IDS.length, 12);
  assert.equal(new Set(PROJECT_COLOR_IDS).size, 12);

  const now = new Date(2026, 6, 26, 19, 0, 0, 0).getTime();
  const state = createInitialState(now);
  assert.ok(state.projects.length > 0);
  assert.ok(state.projects.every((project) => PROJECT_COLOR_IDS.includes(project.color)));
});

test('legacy v3 projects hydrate with deterministic valid identity and preserve IDs', () => {
  const now = new Date(2026, 6, 26, 19, 5, 0, 0).getTime();
  const initial = createInitialState(now);
  const legacy = {
    version: 3,
    projects: [{
      id: 'legacy',
      name: 'Legacy',
      icon: 'book',
      archived: false,
      description: 'preserve me',
      sortOrder: 2,
      createdAt: now - 1000,
      updatedAt: now - 500,
    }],
    tasks: [],
    sessions: [],
    routines: [],
    preferences: initial.preferences,
    planning: initial.planning,
    appearance: 'light',
  };

  const migrated = migrateState(legacy, now);
  assert.equal(migrated.version, 3);
  assert.equal(migrated.projects[0].id, 'legacy');
  assert.equal(migrated.projects[0].description, 'preserve me');
  assert.equal(migrated.projects[0].icon, 'book');
  assert.equal(migrated.projects[0].color, defaultProjectColor(2));

  const malformed = migrateState({
    ...legacy,
    projects: [{ ...legacy.projects[0], icon: 'not-real', color: 'not-real' }],
  }, now);
  assert.equal(malformed.projects[0].id, 'legacy');
  assert.equal(malformed.projects[0].icon, 'grid');
  assert.equal(malformed.projects[0].color, defaultProjectColor(2));
});

test('project icon and color can be created and updated independently', () => {
  const now = new Date(2026, 6, 26, 19, 10, 0, 0).getTime();
  const initial = createInitialState(now);
  const createdState = addProject(initial, 'Proyecto propio', 'atom', 'pacific', now + 1);
  const created = createdState.projects[0];

  assert.equal(created.name, 'Proyecto propio');
  assert.equal(created.icon, 'atom');
  assert.equal(created.color, 'pacific');

  const recolored = updateProject(createdState, created.id, { color: 'amber-soft' }, now + 2);
  const updated = recolored.projects.find((project) => project.id === created.id);
  assert.equal(updated.icon, 'atom');
  assert.equal(updated.color, 'amber-soft');
});
