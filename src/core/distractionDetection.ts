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

export type DistractionMetrics = {
  focusSessionId: string;
  count: number;
  detections: DistractionDetection[];
};

const DEFAULT_DEBOUNCE_MS = 10_000;
const DEFAULT_HISTORY_LIMIT = 50;

function normalizePackageName(value: string | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

function normalizeRule(rule: DistractorAppRule): DistractorAppRule | null {
  const packageName = normalizePackageName(rule.packageName);
  if (!packageName) return null;

  return {
    packageName,
    label: rule.label.trim() || packageName,
    enabled: rule.enabled,
    createdAt: rule.createdAt,
  };
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

export function createDistractionMetrics(focusSessionId: string): DistractionMetrics {
  return { focusSessionId, count: 0, detections: [] };
}

export function recordDistractionDetection(
  metrics: DistractionMetrics,
  detection: DistractionDetection,
  historyLimit = DEFAULT_HISTORY_LIMIT,
): DistractionMetrics {
  if (detection.focusSessionId !== metrics.focusSessionId) return metrics;

  const limit = Math.max(0, Math.floor(historyLimit));
  const detections = [...metrics.detections, detection];
  const bounded = limit === 0 ? [] : detections.slice(-limit);

  return {
    focusSessionId: metrics.focusSessionId,
    count: metrics.count + 1,
    detections: bounded,
  };
}

export function upsertDistractorRule(
  rules: DistractorAppRule[],
  incoming: DistractorAppRule,
): DistractorAppRule[] {
  const normalized = normalizeRule(incoming);
  if (!normalized) return rules;

  const existingIndex = rules.findIndex(
    (rule) => normalizePackageName(rule.packageName) === normalized.packageName,
  );
  if (existingIndex < 0) return [...rules, normalized];

  return rules.map((rule, index) => index === existingIndex
    ? { ...normalized, createdAt: rule.createdAt }
    : rule);
}

export function setDistractorRuleEnabled(
  rules: DistractorAppRule[],
  packageName: string,
  enabled: boolean,
): DistractorAppRule[] {
  const target = normalizePackageName(packageName);
  if (!target) return rules;

  return rules.map((rule) => normalizePackageName(rule.packageName) === target
    ? { ...rule, enabled }
    : rule);
}

export function removeDistractorRule(
  rules: DistractorAppRule[],
  packageName: string,
): DistractorAppRule[] {
  const target = normalizePackageName(packageName);
  if (!target) return rules;
  return rules.filter((rule) => normalizePackageName(rule.packageName) !== target);
}
