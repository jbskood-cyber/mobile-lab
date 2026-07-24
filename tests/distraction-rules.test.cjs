const assert = require('node:assert/strict');
const test = require('node:test');

const {
  upsertDistractorRule,
  setDistractorRuleEnabled,
  removeDistractorRule,
} = require('../.core-test-dist/core/distractionDetection.js');

const CREATED_AT = '2026-07-24T22:20:00.000Z';

test('adds a normalized user-selected distractor rule', () => {
  const rules = upsertDistractorRule([], {
    packageName: '  COM.INSTAGRAM.ANDROID ',
    label: ' Instagram ',
    enabled: true,
    createdAt: CREATED_AT,
  });

  assert.deepEqual(rules, [{
    packageName: 'com.instagram.android',
    label: 'Instagram',
    enabled: true,
    createdAt: CREATED_AT,
  }]);
});

test('updates an existing package without duplicating it', () => {
  const initial = [{
    packageName: 'com.instagram.android',
    label: 'Instagram',
    enabled: true,
    createdAt: CREATED_AT,
  }];

  const rules = upsertDistractorRule(initial, {
    packageName: 'COM.INSTAGRAM.ANDROID',
    label: 'Instagram Reels',
    enabled: false,
    createdAt: '2026-07-25T00:00:00.000Z',
  });

  assert.equal(rules.length, 1);
  assert.deepEqual(rules[0], {
    packageName: 'com.instagram.android',
    label: 'Instagram Reels',
    enabled: false,
    createdAt: CREATED_AT,
  });
  assert.equal(initial[0].enabled, true);
});

test('toggles one rule without mutating the original list', () => {
  const initial = [{
    packageName: 'com.instagram.android',
    label: 'Instagram',
    enabled: true,
    createdAt: CREATED_AT,
  }];

  const rules = setDistractorRuleEnabled(initial, 'COM.INSTAGRAM.ANDROID', false);

  assert.equal(rules[0].enabled, false);
  assert.equal(initial[0].enabled, true);
});

test('removes one rule by normalized package name', () => {
  const initial = [
    { packageName: 'com.instagram.android', label: 'Instagram', enabled: true, createdAt: CREATED_AT },
    { packageName: 'com.reddit.frontpage', label: 'Reddit', enabled: true, createdAt: CREATED_AT },
  ];

  assert.deepEqual(removeDistractorRule(initial, ' COM.REDDIT.FRONTPAGE '), [initial[0]]);
});

test('rejects an empty package name instead of persisting an invalid rule', () => {
  assert.deepEqual(upsertDistractorRule([], { packageName: '   ', label: 'Bad', enabled: true, createdAt: CREATED_AT }), []);
});
