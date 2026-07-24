const assert = require('node:assert/strict');
const test = require('node:test');

const {
  createDistractionMetrics,
  recordDistractionDetection,
} = require('../.core-test-dist/core/distractionDetection.js');

const FIRST = {
  packageName: 'com.instagram.android',
  detectedAt: '2026-07-24T22:00:00.000Z',
  focusSessionId: 'focus-1',
};
const SECOND = {
  packageName: 'com.reddit.frontpage',
  detectedAt: '2026-07-24T22:05:00.000Z',
  focusSessionId: 'focus-1',
};

test('creates empty local metrics for one focus session', () => {
  assert.deepEqual(createDistractionMetrics('focus-1'), {
    focusSessionId: 'focus-1',
    count: 0,
    detections: [],
  });
});

test('records serializable detections and increments count', () => {
  const initial = createDistractionMetrics('focus-1');
  const once = recordDistractionDetection(initial, FIRST);
  const twice = recordDistractionDetection(once, SECOND);

  assert.equal(twice.count, 2);
  assert.deepEqual(twice.detections, [FIRST, SECOND]);
  assert.deepEqual(initial, { focusSessionId: 'focus-1', count: 0, detections: [] });
});

test('ignores a detection from a different focus session', () => {
  const initial = createDistractionMetrics('focus-1');
  const foreign = { ...FIRST, focusSessionId: 'focus-2' };

  assert.deepEqual(recordDistractionDetection(initial, foreign), initial);
});

test('keeps only the newest bounded history while preserving total count', () => {
  let metrics = createDistractionMetrics('focus-1');
  for (let index = 0; index < 5; index += 1) {
    metrics = recordDistractionDetection(metrics, {
      packageName: `app.${index}`,
      detectedAt: new Date(Date.parse(FIRST.detectedAt) + index * 1000).toISOString(),
      focusSessionId: 'focus-1',
    }, 3);
  }

  assert.equal(metrics.count, 5);
  assert.deepEqual(metrics.detections.map((item) => item.packageName), ['app.2', 'app.3', 'app.4']);
});
