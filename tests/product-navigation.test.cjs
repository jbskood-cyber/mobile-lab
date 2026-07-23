const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const layout = fs.readFileSync('app/(tabs)/_layout.tsx', 'utf8');
const tabBar = fs.readFileSync('src/ui/FocoTabBar.tsx', 'utf8');

const expected = [
  ['index', 'Hoy'],
  ['agenda', 'Agenda'],
  ['focus', 'Enfoque'],
  ['projects', 'Proyectos'],
  ['stats', 'Progreso'],
];

test('primary navigation exposes the five product jobs in order', () => {
  let cursor = -1;
  for (const [route, title] of expected) {
    const location = layout.indexOf(`name=\"${route}\"`);
    assert.ok(location > cursor, `${route} must appear after the previous tab`);
    assert.ok(layout.includes(`title: '${title}'`));
    cursor = location;
  }
});

test('custom tab bar has labels and icons for every route', () => {
  for (const [route, label] of expected) {
    assert.match(tabBar, new RegExp(`${route}: \\{ label: '${label}'`));
  }
});
