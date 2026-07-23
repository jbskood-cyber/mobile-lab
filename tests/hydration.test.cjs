const assert = require('node:assert/strict');
const test = require('node:test');

const { createInitialState } = require('../.core-test-dist/core/model.js');
const { resolveHydratedState } = require('../.core-test-dist/core/hydration.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('hydration selects persisted state without replacing it with seed data', () => {
  const persisted = createInitialState(NOW);
  persisted.projects[0].name = 'Persistido';

  const hydrated = resolveHydratedState(JSON.stringify(persisted), NOW);

  assert.equal(hydrated.projects[0].name, 'Persistido');
  assert.equal(hydrated.version, 2);
});

test('empty or invalid storage falls back to a valid v2 state', () => {
  assert.equal(resolveHydratedState(null, NOW).version, 2);
  assert.equal(resolveHydratedState('{bad json', NOW).version, 2);
});
