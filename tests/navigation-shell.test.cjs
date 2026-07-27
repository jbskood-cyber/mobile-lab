const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (...parts) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8');

test('primary routes remain stable while the tab bar becomes one current-section capsule', () => {
  const layout = read('app', '(tabs)', '_layout.tsx');
  const nav = read('src', 'ui', 'FocoTabBar.tsx');
  for (const route of ['index', 'agenda', 'focus', 'projects', 'stats']) {
    assert.match(layout, new RegExp(`name=["']${route}["']`));
  }
  assert.match(nav, /openAppMenu/);
  assert.match(nav, /currentRoute|currentMeta|state\.routes\[state\.index\]/);
  assert.match(nav, /capsule/);
  assert.doesNotMatch(nav, /state\.routes\.map/);
  assert.doesNotMatch(nav, /activeIndicator/);
});

test('main screens no longer expose a top-left hamburger', () => {
  const shell = read('src', 'ui', 'FocoShell.tsx');
  assert.doesNotMatch(shell, /Abrir menú de FOCO/);
  assert.doesNotMatch(shell, /name=["']menu["']/);
  assert.doesNotMatch(shell, /openAppMenu/);
});

test('navigation capsule hides around keyboard overlays menu and immersive focus', () => {
  const nav = read('src', 'ui', 'FocoTabBar.tsx');
  for (const token of ['keyboardVisible', 'overlayCount', 'appMenuVisible', 'focusImmersive']) {
    assert.match(nav, new RegExp(token));
  }
});

test('navigation sheet separates primary and secondary destinations without routine haptics', () => {
  const menu = read('src', 'ui', 'FocoAppMenu.tsx');
  assert.match(menu, /primaryDestinations/);
  assert.match(menu, /secondaryDestinations/);
  assert.doesNotMatch(menu, /hapticSelection\s*\(\)/);
});
