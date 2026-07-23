export const foco = {
  colors: {
    bg: '#050607',
    bgRaised: '#090A0C',
    panel: '#111317',
    panelSoft: '#0D0F12',
    panelStrong: '#17191E',
    border: '#2B2E34',
    borderSoft: '#202329',
    text: '#F7F7F8',
    muted: '#A5A8AF',
    subtle: '#6F737C',
    inactive: '#555A63',
    white: '#FFFFFF',
    accent: '#FF7A1A',
  },
  radius: { sm: 12, md: 18, lg: 22, pill: 999 },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
} as const;

export const shadowGlow = {
  shadowColor: '#FFFFFF',
  shadowOpacity: 0.16,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 0 },
  elevation: 8,
} as const;
