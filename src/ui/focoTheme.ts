import { getThemeTokens } from './themeTokens';

// Compatibility export for components being migrated incrementally. New code must
// consume `useFocoTheme()` so light/dark changes update at runtime.
export const foco = getThemeTokens('dark');

export const shadowGlow = {
  shadowColor: foco.colors.shadow,
  shadowOpacity: 0.18,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 3 },
  elevation: 5,
} as const;
