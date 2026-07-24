export type DistractorAppRule = {
  packageName: string;
  label: string;
  enabled: boolean;
  createdAt: string;
};

export type DistractionDetection = {
  packageName: string;
  detectedAt: string;
  focusSessionId?: string;
};

export type DistractionObservationInput = {
  nowMs: number;
  focusActive: boolean;
  focusSessionId?: string;
  foregroundPackage?: string;
  rules: DistractorAppRule[];
  previousDetection?: DistractionDetection;
  debounceMs?: number;
};

export type DistractionObservationResult = {
  distracting: boolean;
  matchedRule?: DistractorAppRule;
  detection?: DistractionDetection;
  reason?: 'inactive-focus' | 'missing-package' | 'no-match' | 'debounced';
};

const DEFAULT_DEBOUNCE_MS = 10_000;

function normalizePackageName(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function findEnabledRule(rules: DistractorAppRule[], packageName: string) {
  return rules.find((rule) => rule.enabled && normalizePackageName(rule.packageName) === packageName);
}

function isDebounced(
  previousDetection: DistractionDetection | undefined,
  packageName: string,
  focusSessionId: string | undefined,
  nowMs: number,
  debounceMs: number,
) {
  if (!previousDetection || normalizePackageName(previousDetection.packageName) !== packageName) return false;
  if (previousDetection.focusSessionId !== focusSessionId) return false;

  const previousMs = Date.parse(previousDetection.detectedAt);
  if (!Number.isFinite(previousMs)) return false;

  return nowMs >= previousMs && nowMs - previousMs < debounceMs;
}

export function evaluateDistractionObservation(input: DistractionObservationInput): DistractionObservationResult {
  if (!input.focusActive) return { distracting: false, reason: 'inactive-focus' };

  const packageName = normalizePackageName(input.foregroundPackage);
  if (!packageName) return { distracting: false, reason: 'missing-package' };

  const matchedRule = findEnabledRule(Array.isArray(input.rules) ? input.rules : [], packageName);
  if (!matchedRule) return { distracting: false, reason: 'no-match' };

  const debounceMs = Math.max(0, input.debounceMs ?? DEFAULT_DEBOUNCE_MS);
  if (isDebounced(input.previousDetection, packageName, input.focusSessionId, input.nowMs, debounceMs)) {
    return { distracting: false, matchedRule, reason: 'debounced' };
  }

  const detection: DistractionDetection = {
    packageName: matchedRule.packageName,
    detectedAt: new Date(input.nowMs).toISOString(),
    ...(input.focusSessionId ? { focusSessionId: input.focusSessionId } : {}),
  };

  return { distracting: true, matchedRule, detection };
}
