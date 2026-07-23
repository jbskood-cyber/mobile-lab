const assert = require('node:assert/strict');
const test = require('node:test');

const { createInitialState } = require('../.core-test-dist/model.js');
const { resolveHydratedState } = require('../.core-test-dist/hydration.js');

const NOW = new Date('2026-07-23T12:00:00Z').getTime();

test('hydration selects persisted state without replacing it with seed data', () => {
  const persisted = createInitialState(NOW);
  persisted.projects[0].name = 'Persistido';

  const hydrated = resolveHydratedState(JSON.stringify(persisted), NOW);

  assert.equal(hydrated.projects[0].name, 'Persistido');
});

test('empty or invalid storage falls back to a valid seed state', () => {
  assert.equal(resolveHydratedState(null, NOW).version, 1);
  assert.equal(resolveHydratedState('{bad json', NOW).version, 1);
});
