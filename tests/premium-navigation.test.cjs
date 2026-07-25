const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const tabBarPath = path.join(process.cwd(), 'src', 'ui', 'FocoTabBar.tsx');
const premiumPath = path.join(process.cwd(), 'src', 'ui', 'premium.ts');
const motionPath = path.join(process.cwd(), 'src', 'ui', 'motion.ts');
const themeTokensPath = path.join(process.cwd(), 'src', 'ui', 'themeTokens.ts');
const iconPath = path.join(process.cwd(), 'src', 'ui', 'FocoIcon.tsx');
const packagePath = path.join(process.cwd(), 'package.json');
const layoutPath = path.join(process.cwd(), 'app', '_layout.tsx');

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

test('motion foundation centralizes semantic timings and reduced-motion resolution', () => {
  const motion = read(motionPath);
  for (const token of ['micro', 'fast', 'standard', 'softSpring', 'snappySpring', 'fade', 'crossfade', 'shortSlide']) {
    assert.match(motion, new RegExp(token));
  }
  assert.match(motion, /resolveMotionDuration/);
});

test('typography foundation exposes semantic roles and stable numeric variants', () => {
  const theme = read(themeTokensPath);
  assert.match(theme, /typeScale/);
  for (const role of ['display', 'screenTitle', 'section', 'body', 'metadata', 'caption', 'metric', 'timer', 'control']) {
    assert.match(theme, new RegExp(`${role}:`));
  }
  assert.match(theme, /fontVariant:\s*\['tabular-nums'\]/);
});

test('premium typography loads Instrument Sans with real weights', () => {
  const packageJson = read(packagePath);
  const layout = read(layoutPath);
  const theme = read(themeTokensPath);
  assert.match(packageJson, /@expo-google-fonts\/instrument-sans/);
  for (const weight of ['400Regular', '500Medium', '600SemiBold', '700Bold']) {
    assert.match(layout, new RegExp(`InstrumentSans_${weight}`));
    assert.match(theme, new RegExp(`InstrumentSans_${weight}`));
  }
  assert.doesNotMatch(layout, /Manrope_/);
  assert.doesNotMatch(theme, /Manrope_/);
});

test('navigation icons use one professional family with explicit active weight', () => {
  const icon = read(iconPath);
  const tabBar = read(tabBarPath);
  assert.match(icon, /PHOSPHOR_NAV_ICONS/);
  assert.match(icon, /weight\?:\s*'regular'\s*\|\s*'fill'/);
  for (const iconName of ['home', 'calendar', 'circle', 'folder', 'bars']) {
    assert.match(icon, new RegExp(`${iconName}:`));
  }
  assert.match(tabBar, /weight=\{focused \? 'fill' : 'regular'\}/);
});

test('primary shared controls use the same Phosphor icon language', () => {
  const icon = read(iconPath);
  assert.match(icon, /PHOSPHOR_CONTROL_ICONS/);
  for (const iconName of ['plus', 'sliders', 'play', 'pause', 'stop', 'more', 'chevron-right', 'chevron-left', 'chevron-down', 'search', 'check']) {
    assert.match(icon, new RegExp(`['\"]?${iconName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['\"]?\s*:`));
  }
});
