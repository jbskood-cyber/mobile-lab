const assert = require('node:assert/strict');
const test = require('node:test');

const { createUIState, reduceUIState } = require('../.core-test-dist/ui/uiState.js');

test('overlay ownership never becomes negative', () => {
  const state = reduceUIState(createUIState(), { type: 'close-overlay' });
  assert.equal(state.overlays, 0);
});

test('overlay ownership increments and decrements deterministically', () => {
  const opened = reduceUIState(createUIState(), { type: 'open-overlay' });
  const twice = reduceUIState(opened, { type: 'open-overlay' });
  const closed = reduceUIState(twice, { type: 'close-overlay' });

  assert.equal(opened.overlays, 1);
  assert.equal(twice.overlays, 2);
  assert.equal(closed.overlays, 1);
});

test('local reset requires an explicit second action', () => {
  const armed = reduceUIState(createUIState(), { type: 'request-reset' });
  const cancelled = reduceUIState(armed, { type: 'cancel-reset' });

  assert.equal(armed.resetArmed, true);
  assert.equal(cancelled.resetArmed, false);
});
