const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createDistractionState,
  hydrateDistractionState,
  serializeDistractionState,
} = require('../.core-test-dist/core/distractionDetection.js');

const RULE = {
  packageName: 'com.instagram.android',
  label: 'Instagram',
  enabled: true,
  createdAt: '2026-07-24T22:00:00.000Z',
};

const METRICS = {
  focusSessionId: 'focus-1',
  count: 1,
  detections: [{
    packageName: 'com.instagram.android',
    detectedAt: '2026-07-24T22:05:00.000Z',
    focusSessionId: 'focus-1',
  }],
};

test('creates an empty serializable distraction state', () => {
  assert.deepEqual(createDistractionState(), { rules: [], metrics: [] });
});

test('hydrates persisted rules and session metrics', () => {
  const raw = JSON.stringify({ rules: [RULE], metrics: [METRICS] });
  assert.deepEqual(hydrateDistractionState(raw), { rules: [RULE], metrics: [METRICS] });
});

test('falls back safely when persisted distraction data is malformed', () => {
  assert.deepEqual(hydrateDistractionState('{not-json'), { rules: [], metrics: [] });
  assert.deepEqual(hydrateDistractionState(JSON.stringify({ rules: 'bad', metrics: null })), { rules: [], metrics: [] });
});

test('serializes without mutating the caller state', () => {
  const state = { rules: [RULE], metrics: [METRICS] };
  const before = structuredClone(state);
  const serialized = serializeDistractionState(state);

  assert.deepEqual(JSON.parse(serialized), before);
  assert.deepEqual(state, before);
});
