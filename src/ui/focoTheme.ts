export const foco = {
  colors: {
    bg: '#050607',
    bgRaised: '#090A0C',
    panel: '#111317',
    panelSoft: '#0D0F12',
    panelStrong: '#17191E',
    border: '#2B2E34',
    borderSoft: '#22252B',
    text: '#F7F7F8',
    muted: '#AAADB4',
    subtle: '#7E828B',
    inactive: '#626771',
    white: '#FFFFFF',
    accent: '#FF7A1A',
  },
  radius: {
    control: 14,
    row: 15,
    surface: 17,
    sheet: 26,
    sm: 12,
    md: 17,
    lg: 22,
    pill: 999,
  },
  space: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 },
} as const;

export const shadowGlow = {
  shadowColor: '#FFFFFF',
  shadowOpacity: 0.14,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 0 },
  elevation: 7,
} as const;
