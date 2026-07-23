import * as SystemUI from 'expo-system-ui';
import { createContext, type PropsWithChildren, useContext, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { resolveTheme } from './themeModel';
import { getThemeTokens, type FocoTheme } from './themeTokens';

const FocoThemeContext = createContext<FocoTheme | null>(null);

export function FocoThemeProvider({ children }: PropsWithChildren) {
  const system = useColorScheme();
  const { state } = useFocoStore();
  const resolved = resolveTheme(state.appearance, system === 'light' ? 'light' : system === 'dark' ? 'dark' : null);
  const theme = useMemo(() => getThemeTokens(resolved), [resolved]);

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(theme.colors.bg).catch(() => undefined);
  }, [theme.colors.bg]);

  return <FocoThemeContext.Provider value={theme}>{children}</FocoThemeContext.Provider>;
}

export function useFocoTheme() {
  const value = useContext(FocoThemeContext);
  if (!value) throw new Error('useFocoTheme must be used inside FocoThemeProvider');
  return value;
}
