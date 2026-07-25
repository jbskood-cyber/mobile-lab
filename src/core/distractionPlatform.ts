export type DistractionPlatform = 'android' | 'ios' | 'web' | 'unknown';

export type UsageAccessState = 'unknown' | 'denied' | 'granted';

export type DistractionMonitoringStatusInput = {
  platform: DistractionPlatform;
  usageStatsAvailable: boolean;
  usageAccess: UsageAccessState;
};

export type DistractionMonitoringStatus = {
  supported: boolean;
  permission: UsageAccessState | 'unavailable';
  monitoringAllowed: boolean;
  reason?: 'unsupported-platform' | 'usage-stats-unavailable' | 'permission-required';
};

export function resolveDistractionMonitoringStatus(
  input: DistractionMonitoringStatusInput,
): DistractionMonitoringStatus {
  if (input.platform !== 'android') {
    return {
      supported: false,
      permission: 'unavailable',
      monitoringAllowed: false,
      reason: 'unsupported-platform',
    };
  }

  if (!input.usageStatsAvailable) {
    return {
      supported: false,
      permission: 'unavailable',
      monitoringAllowed: false,
      reason: 'usage-stats-unavailable',
    };
  }

  if (input.usageAccess !== 'granted') {
    return {
      supported: true,
      permission: input.usageAccess,
      monitoringAllowed: false,
      reason: 'permission-required',
    };
  }

  return {
    supported: true,
    permission: 'granted',
    monitoringAllowed: true,
  };
}
