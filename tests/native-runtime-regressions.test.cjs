const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

test('React Native source uses portable font weights only', () => {
  const files = walk('src').filter((file) => /\.(ts|tsx)$/.test(file));
  const violations = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    if (/fontWeight:\s*['"](?:[1-9]50|[1-9]80)['"]/.test(source)) violations.push(file);
  }
  assert.deepEqual(violations, []);
});

test('Expo Go startup never calls navigation bar APIs imperatively', () => {
  const source = fs.readFileSync('src/ui/NativeSystemUI.tsx', 'utf8');
  assert.doesNotMatch(source, /expo-navigation-bar/);
  assert.doesNotMatch(source, /NavigationBar\./);
});
