const assert = require('node:assert/strict');
const test = require('node:test');

const { formatWeekLabel } = require('../.core-test-dist/features/stats/statsModel.js');

test('week label uses a compact single-month range', () => {
  const start = new Date(2026, 6, 6).getTime();
  const end = new Date(2026, 6, 13).getTime();
  assert.equal(formatWeekLabel(start, end), '6 – 12 jul 2026');
});

test('week label keeps both months when a range crosses month boundary', () => {
  const start = new Date(2026, 5, 29).getTime();
  const end = new Date(2026, 6, 6).getTime();
  assert.equal(formatWeekLabel(start, end), '29 jun – 5 jul 2026');
});
