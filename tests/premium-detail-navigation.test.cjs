const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const rootLayoutPath = path.join(process.cwd(), 'app', '_layout.tsx');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('normal detail navigation uses one restrained native push policy', () => {
  const layout = read(rootLayoutPath);
  assert.match(layout, /<Stack\s+screenOptions=/);
  assert.doesNotMatch(layout, /animation:\s*'none'/);
  assert.match(layout, /animation:\s*'slide_from_right'/);
  assert.match(layout, /contentStyle:\s*\{\s*backgroundColor:\s*theme\.colors\.bg\s*\}/);
});
