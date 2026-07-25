const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabItemPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabItem.tsx');
const tabBarPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabBar.tsx');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('tab icon and label use restrained focused-state motion with reduced-motion fallback', () => {
  assert.ok(fs.existsSync(tabItemPath), 'FocoTabItem must isolate tab state motion from navigation wiring.');
  const item = read(tabItemPath);
  const bar = read(tabBarPath);
  assert.match(item, /useSharedValue/);
  assert.match(item, /useAnimatedStyle/);
  assert.match(item, /withTiming/);
  assert.match(item, /useReducedMotion/);
  assert.match(item, /opacity/);
  assert.match(item, /scale/);
  assert.match(item, /weight=\{focused \? 'fill' : 'regular'\}/);
  assert.match(bar, /<FocoTabItem/);
  assert.match(bar, /accessibilityState=\{\{ selected: focused \}\}/);
  assert.match(bar, /onLongPress=/);
});
