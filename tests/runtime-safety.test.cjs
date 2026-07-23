const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

test('Expo Go runtime avoids the imperative navigation-bar call that crashed on Samsung', () => {
  const source = read('src/ui/NativeSystemUI.tsx');
  assert.doesNotMatch(source, /expo-navigation-bar/);
  assert.doesNotMatch(source, /NavigationBar\./);
});

test('runtime styles use only React Native portable font weights', () => {
  const src = path.join(root, 'src');
  const files = walk(src).filter((file) => /\.(ts|tsx)$/.test(file));
  const invalid = [];
  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const matches = source.matchAll(/fontWeight:\s*['"](\d+)['"]/g);
    for (const match of matches) {
      if (!['100', '200', '300', '400', '500', '600', '700', '800', '900'].includes(match[1])) invalid.push(`${path.relative(root, file)}:${match[1]}`);
    }
  }
  assert.deepEqual(invalid, []);
});

test('light, dark and system appearance are wired through app config and semantic tokens', () => {
  const app = JSON.parse(read('app.json'));
  const tokens = read('src/ui/themeTokens.ts');
  const context = read('src/ui/FocoThemeContext.tsx');
  assert.equal(app.expo.userInterfaceStyle, 'automatic');
  assert.match(tokens, /const dark:/);
  assert.match(tokens, /const light:/);
  assert.match(context, /state\.appearance/);
  assert.match(context, /useColorScheme/);
});

test('compact navigation and typography keep the product dense without shrinking touch targets', () => {
  const tokens = read('src/ui/themeTokens.ts');
  const typeScale = read('src/ui/typeScale.ts');
  const tabBar = read('src/ui/FocoTabBar.tsx');
  assert.match(tokens, /tabBarHeight:\s*58/);
  assert.match(tokens, /rowMinHeight:\s*58/);
  assert.match(tokens, /controlHeight:\s*44/);
  assert.match(typeScale, /fontSize:\s*28/);
  assert.doesNotMatch(typeScale, /fontSize:\s*(?:3[6-9]|[4-9]\d)/);
  assert.match(tabBar, /minHeight:\s*54/);
});

test('Adaptive Day routes and detailed Agenda remain reachable', () => {
  assert.equal(fs.existsSync(path.join(root, 'app/momentum.tsx')), true);
  assert.equal(fs.existsSync(path.join(root, 'app/preferences.tsx')), true);
  const agenda = read('src/features/agenda/AgendaScreen.tsx');
  assert.match(agenda, /Calendario/);
  assert.match(agenda, /DayTimeline/);
  assert.match(agenda, /RoutinesSheet/);
  assert.match(agenda, /Inbox/);
});
