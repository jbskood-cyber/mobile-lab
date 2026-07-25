const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabBarPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabBar.tsx');

function readTabBar() {
  return fs.readFileSync(tabBarPath, 'utf8');
}

test('routine bottom-tab navigation does not trigger selection haptics', () => {
  const source = readTabBar();
  assert.doesNotMatch(source, /hapticSelection\s*\(/, 'Bottom-tab navigation must stay haptic-free; reserve haptics for meaningful actions.');
});
