export type DistractionPlatform = 'android' | 'ios' | 'web' | 'unknown';

export type UsageAccessState = 'unknown' | 'notGranted' | 'granted';

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

export type DistractionPlatformAdapter = {
  platform: DistractionPlatform;
  usageStatsAvailable: boolean;
  getUsageAccess: () => Promise<UsageAccessState>;
  getForegroundPackage: () => Promise<string | undefined>;
};

export type DistractionPlatformSnapshot = {
  status: DistractionMonitoringStatus;
  foregroundPackage?: string;
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

export async function readDistractionPlatformSnapshot(
  adapter: DistractionPlatformAdapter,
): Promise<DistractionPlatformSnapshot> {
  const usageAccess = await adapter.getUsageAccess();
  const status = resolveDistractionMonitoringStatus({
    platform: adapter.platform,
    usageStatsAvailable: adapter.usageStatsAvailable,
    usageAccess,
  });

  if (!status.monitoringAllowed) return { status };

  const foregroundPackage = (await adapter.getForegroundPackage())?.trim().toLowerCase();
  return foregroundPackage ? { status, foregroundPackage } : { status };
}
