const assert = require('node:assert/strict');
const test = require('node:test');

const { createInitialState } = require('../.core-test-dist/core/model.js');
const { resolveHydratedState } = require('../.core-test-dist/core/hydration.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('hydration selects persisted state without replacing it with demo data', () => {
  const persisted = createInitialState(NOW);
  persisted.projects[0].name = 'Persistido';

  const hydrated = resolveHydratedState(JSON.stringify(persisted), NOW);

  assert.equal(hydrated.projects[0].name, 'Persistido');
  assert.equal(hydrated.version, 3);
});

test('empty or invalid storage falls back to a rich valid v3 demo state', () => {
  const empty = resolveHydratedState(null, NOW);
  const invalid = resolveHydratedState('{bad json', NOW);
  assert.equal(empty.version, 3);
  assert.equal(invalid.version, 3);
  assert.ok(empty.tasks.length > 0);
  assert.ok(invalid.routines.length > 0);
});
