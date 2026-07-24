const assert = require('node:assert/strict');
const test = require('node:test');

const { evaluateDistractionObservation } = require('../.core-test-dist/core/distractionDetection.js');

const NOW = new Date('2026-07-24T22:00:00Z').getTime();
const RULES = [
  { packageName: 'com.instagram.android', label: 'Instagram', enabled: true, createdAt: '2026-07-24T00:00:00Z' },
  { packageName: 'com.google.android.youtube', label: 'YouTube', enabled: false, createdAt: '2026-07-24T00:00:00Z' },
];

test('detects an enabled distractor while focus is active', () => {
  const result = evaluateDistractionObservation({
    nowMs: NOW,
    focusActive: true,
    foregroundPackage: 'com.instagram.android',
    rules: RULES,
  });

  assert.equal(result.distracting, true);
  assert.equal(result.matchedRule?.packageName, 'com.instagram.android');
  assert.equal(result.detection?.packageName, 'com.instagram.android');
  assert.equal(result.detection?.detectedAt, new Date(NOW).toISOString());
});

test('ignores disabled rules, inactive focus and unrelated packages', () => {
  assert.equal(evaluateDistractionObservation({ nowMs: NOW, focusActive: true, foregroundPackage: 'com.google.android.youtube', rules: RULES }).distracting, false);
  assert.equal(evaluateDistractionObservation({ nowMs: NOW, focusActive: false, foregroundPackage: 'com.instagram.android', rules: RULES }).distracting, false);
  assert.equal(evaluateDistractionObservation({ nowMs: NOW, focusActive: true, foregroundPackage: 'com.whatsapp', rules: RULES }).distracting, false);
});

test('deduplicates repeated observations inside the debounce window', () => {
  const previousDetection = {
    packageName: 'com.instagram.android',
    detectedAt: new Date(NOW - 5_000).toISOString(),
    focusSessionId: 'focus-1',
  };

  const result = evaluateDistractionObservation({
    nowMs: NOW,
    focusActive: true,
    focusSessionId: 'focus-1',
    foregroundPackage: 'com.instagram.android',
    rules: RULES,
    previousDetection,
    debounceMs: 10_000,
  });

  assert.equal(result.distracting, false);
  assert.equal(result.reason, 'debounced');
});

test('creates a new detection after the debounce window and preserves session id', () => {
  const previousDetection = {
    packageName: 'com.instagram.android',
    detectedAt: new Date(NOW - 20_000).toISOString(),
    focusSessionId: 'focus-1',
  };

  const result = evaluateDistractionObservation({
    nowMs: NOW,
    focusActive: true,
    focusSessionId: 'focus-1',
    foregroundPackage: 'com.instagram.android',
    rules: RULES,
    previousDetection,
    debounceMs: 10_000,
  });

  assert.equal(result.distracting, true);
  assert.equal(result.detection?.focusSessionId, 'focus-1');
});

test('empty or malformed package observations are safe no-ops', () => {
  assert.equal(evaluateDistractionObservation({ nowMs: NOW, focusActive: true, foregroundPackage: '', rules: [] }).distracting, false);
  assert.equal(evaluateDistractionObservation({ nowMs: NOW, focusActive: true, foregroundPackage: '   ', rules: RULES }).distracting, false);
});
