const assert = require('node:assert/strict');
const test = require('node:test');

const { normalizeIntegerDraft, parseOptionalInteger } = require('../.core-test-dist/formModel.js');

test('numeric drafts allow an empty intermediate editing state', () => {
  assert.equal(parseOptionalInteger('', 1, 90), null);
  assert.equal(parseOptionalInteger('25', 1, 90), 25);
  assert.equal(parseOptionalInteger('2.5', 1, 90), null);
});

test('numeric drafts reject values outside the allowed range', () => {
  assert.equal(parseOptionalInteger('0', 1, 90), null);
  assert.equal(parseOptionalInteger('91', 1, 90), null);
});

test('numeric values normalize only at a commit boundary', () => {
  assert.equal(normalizeIntegerDraft('', 25, 1, 90), '25');
  assert.equal(normalizeIntegerDraft('120', 25, 1, 90), '90');
  assert.equal(normalizeIntegerDraft('-3', 25, 1, 90), '1');
  assert.equal(normalizeIntegerDraft('abc', 25, 1, 90), '25');
});
