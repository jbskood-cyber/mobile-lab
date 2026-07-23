export function parseOptionalInteger(value: string, min: number, max: number): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) return null;
  return parsed;
}

export function normalizeIntegerDraft(value: string, fallback: number, min: number, max: number): string {
  const trimmed = value.trim();
  if (!/^-?\d+$/.test(trimmed)) return String(fallback);
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return String(fallback);
  return String(Math.min(max, Math.max(min, Math.round(parsed))));
}
