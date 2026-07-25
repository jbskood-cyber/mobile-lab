const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabBarPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabBar.tsx');
const premiumPath = path.join(process.cwd(), 'src', 'ui', 'premium.ts');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('routine bottom-tab navigation does not trigger selection haptics', () => {
  const source = read(tabBarPath);
  assert.doesNotMatch(source, /hapticSelection\s*\(/, 'Bottom-tab navigation must stay haptic-free; reserve haptics for meaningful actions.');
});

test('premium press feedback exposes restrained semantic variants', () => {
  const premium = read(premiumPath);
  const tabBar = read(tabBarPath);
  assert.match(premium, /pressFeedback/);
  assert.match(premium, /quiet/);
  assert.match(premium, /control/);
  assert.match(premium, /primary/);
  assert.doesNotMatch(premium, /opacity:\s*0\.72/);
  assert.match(tabBar, /pressFeedback\.quiet/);
});
