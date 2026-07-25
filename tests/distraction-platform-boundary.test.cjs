const assert = require('node:assert/strict');
const test = require('node:test');

const {
  resolveDistractionMonitoringStatus,
} = require('../.core-test-dist/core/distractionDetection.js');

test('reports unsupported platforms without requesting sensitive access', () => {
  assert.deepEqual(
    resolveDistractionMonitoringStatus({
      platform: 'ios',
      usageStatsAvailable: false,
      usageAccess: 'unknown',
    }),
    {
      supported: false,
      permission: 'unavailable',
      monitoringAllowed: false,
      reason: 'unsupported-platform',
    },
  );
});

test('keeps Android monitoring blocked until Usage Access is granted', () => {
  assert.deepEqual(
    resolveDistractionMonitoringStatus({
      platform: 'android',
      usageStatsAvailable: true,
      usageAccess: 'denied',
    }),
    {
      supported: true,
      permission: 'denied',
      monitoringAllowed: false,
      reason: 'permission-required',
    },
  );
});

test('allows monitoring only when Android Usage Access is explicitly granted', () => {
  assert.deepEqual(
    resolveDistractionMonitoringStatus({
      platform: 'android',
      usageStatsAvailable: true,
      usageAccess: 'granted',
    }),
    {
      supported: true,
      permission: 'granted',
      monitoringAllowed: true,
    },
  );
});

test('treats missing UsageStats capability as unavailable even on Android', () => {
  assert.deepEqual(
    resolveDistractionMonitoringStatus({
      platform: 'android',
      usageStatsAvailable: false,
      usageAccess: 'granted',
    }),
    {
      supported: false,
      permission: 'unavailable',
      monitoringAllowed: false,
      reason: 'usage-stats-unavailable',
    },
  );
});
