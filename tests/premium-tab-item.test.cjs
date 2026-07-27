const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabItemPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabItem.tsx');
const tabBarPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabBar.tsx');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('legacy tab-item motion remains isolated while reviewed navigation no longer renders five tab items', () => {
  assert.ok(fs.existsSync(tabItemPath), 'FocoTabItem may remain as an isolated legacy primitive until cleanup.');
  const item = read(tabItemPath);
  const bar = read(tabBarPath);
  assert.match(item, /useReducedMotion/);
  assert.match(item, /withTiming/);
  assert.match(item, /weight=\{focused \? 'fill' : 'regular'\}/);
  assert.doesNotMatch(bar, /<FocoTabItem/);
  assert.match(bar, /<FocoPressable/);
  assert.match(bar, /feedback="quiet"/);
  assert.match(bar, /currentMeta/);
  assert.doesNotMatch(bar, /state\.routes\.map/);
});
