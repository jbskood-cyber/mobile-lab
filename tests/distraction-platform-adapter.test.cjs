const assert = require('node:assert/strict');
const test = require('node:test');

const {
  readDistractionPlatformSnapshot,
} = require('../.core-test-dist/core/distractionPlatform.js');

test('does not read foreground package when Usage Access is not granted', async () => {
  let foregroundReads = 0;
  const snapshot = await readDistractionPlatformSnapshot({
    platform: 'android',
    usageStatsAvailable: true,
    getUsageAccess: async () => 'notGranted',
    getForegroundPackage: async () => {
      foregroundReads += 1;
      return 'com.instagram.android';
    },
  });

  assert.equal(foregroundReads, 0);
  assert.deepEqual(snapshot, {
    status: {
      supported: true,
      permission: 'notGranted',
      monitoringAllowed: false,
      reason: 'permission-required',
    },
  });
});

test('reads and normalizes foreground package only after explicit Usage Access grant', async () => {
  let foregroundReads = 0;
  const snapshot = await readDistractionPlatformSnapshot({
    platform: 'android',
    usageStatsAvailable: true,
    getUsageAccess: async () => 'granted',
    getForegroundPackage: async () => {
      foregroundReads += 1;
      return '  COM.INSTAGRAM.ANDROID  ';
    },
  });

  assert.equal(foregroundReads, 1);
  assert.deepEqual(snapshot, {
    status: {
      supported: true,
      permission: 'granted',
      monitoringAllowed: true,
    },
    foregroundPackage: 'com.instagram.android',
  });
});

test('keeps unsupported platforms side-effect free', async () => {
  let foregroundReads = 0;
  const snapshot = await readDistractionPlatformSnapshot({
    platform: 'web',
    usageStatsAvailable: false,
    getUsageAccess: async () => 'unknown',
    getForegroundPackage: async () => {
      foregroundReads += 1;
      return 'com.example';
    },
  });

  assert.equal(foregroundReads, 0);
  assert.equal(snapshot.status.monitoringAllowed, false);
  assert.equal(snapshot.status.reason, 'unsupported-platform');
});
