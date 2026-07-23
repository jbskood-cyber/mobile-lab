import type { AppearancePreference } from '../core/model';

export type ResolvedTheme = 'light' | 'dark';

export function resolveTheme(preference: AppearancePreference, system: ResolvedTheme | null | undefined): ResolvedTheme {
  if (preference === 'light' || preference === 'dark') return preference;
  return system === 'light' ? 'light' : 'dark';
}

export function isAppearancePreference(value: unknown): value is AppearancePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}
