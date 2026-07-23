const assert = require('node:assert/strict');
const test = require('node:test');

const appConfig = require('../app.json').expo;
const packageConfig = require('../package.json');

test('FOCO native identity and Android integration remain configured', () => {
  assert.equal(appConfig.name, 'FOCO');
  assert.equal(appConfig.slug, 'foco');
  assert.equal(appConfig.scheme, 'foco');
  assert.equal(appConfig.android.edgeToEdgeEnabled, true);
  assert.equal(appConfig.android.predictiveBackGestureEnabled, true);
  assert.equal(appConfig.android.package, 'com.jbskoodcyber.foco');
  assert.equal(appConfig.ios.bundleIdentifier, 'com.jbskoodcyber.foco');
  assert.ok(appConfig.plugins.some((entry) => Array.isArray(entry) && entry[0] === 'expo-splash-screen'));
});

test('native system modules stay pinned to Expo SDK 54 compatible versions', () => {
  assert.equal(packageConfig.dependencies['expo-navigation-bar'], '~5.0.10');
  assert.equal(packageConfig.dependencies['expo-splash-screen'], '~31.0.13');
});
