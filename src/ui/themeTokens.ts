import type { ResolvedTheme } from './themeModel';

export type FocoColors = {
  bg: string;
  bgRaised: string;
  panel: string;
  panelSoft: string;
  panelStrong: string;
  elevated: string;
  border: string;
  borderSoft: string;
  text: string;
  muted: string;
  subtle: string;
  inactive: string;
  inverse: string;
  inverseText: string;
  accent: string;
  accentSoft: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
  shadow: string;
};

const dark: FocoColors = {
  bg: '#08090B',
  bgRaised: '#0C0E11',
  panel: '#121419',
  panelSoft: '#0E1014',
  panelStrong: '#191C22',
  elevated: '#20242B',
  border: '#2C3038',
  borderSoft: '#22262D',
  text: '#F6F7F9',
  muted: '#A6ABB5',
  subtle: '#747B87',
  inactive: '#59606B',
  inverse: '#F6F7F9',
  inverseText: '#0A0B0D',
  accent: '#FF8A2A',
  accentSoft: '#322012',
  success: '#7FC7A1',
  warning: '#E2B36C',
  danger: '#DDA0A8',
  overlay: 'rgba(0,0,0,0.66)',
  shadow: '#000000',
};

const light: FocoColors = {
  bg: '#F6F7F9',
  bgRaised: '#EEF0F3',
  panel: '#FFFFFF',
  panelSoft: '#F2F4F7',
  panelStrong: '#E8EBEF',
  elevated: '#FFFFFF',
  border: '#D5D9E0',
  borderSoft: '#E3E6EB',
  text: '#15171B',
  muted: '#646A74',
  subtle: '#8A909A',
  inactive: '#A5ABB4',
  inverse: '#17191D',
  inverseText: '#FFFFFF',
  accent: '#E96712',
  accentSoft: '#FFF0E5',
  success: '#287A50',
  warning: '#9B671F',
  danger: '#A43D4B',
  overlay: 'rgba(18,20,24,0.36)',
  shadow: '#1A1D22',
};

export const density = {
  pageHorizontal: 14,
  toolbarHeight: 46,
  tabBarHeight: 58,
  rowMinHeight: 58,
  compactRowMinHeight: 48,
  controlHeight: 44,
  primaryControlHeight: 48,
  sheetRadius: 22,
  surfaceRadius: 14,
  controlRadius: 12,
  chipRadius: 11,
  sectionTop: 14,
  sectionBottom: 5,
} as const;

export const fontFamilies = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semibold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
} as const;

export function getThemeTokens(theme: ResolvedTheme) {
  return {
    mode: theme,
    colors: theme === 'light' ? light : dark,
    radius: { control: 12, row: 13, surface: 14, sheet: 22, sm: 10, md: 14, lg: 18, pill: 999 },
    space: { xs: 3, sm: 6, md: 10, lg: 14, xl: 18, xxl: 22, xxxl: 28 },
    density,
    fonts: fontFamilies,
  } as const;
}

export type FocoTheme = ReturnType<typeof getThemeTokens>;
