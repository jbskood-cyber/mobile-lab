import { fontFamilies } from './themeTokens';

export const typeScale = {
  display: {
    fontFamily: fontFamilies.bold,
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '700' as const,
    letterSpacing: -0.75,
  },
  title: {
    fontFamily: fontFamilies.semibold,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '600' as const,
    letterSpacing: -0.25,
  },
  section: {
    fontFamily: fontFamilies.semibold,
    fontSize: 15.5,
    lineHeight: 20,
    fontWeight: '600' as const,
  },
  body: {
    fontFamily: fontFamilies.regular,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '400' as const,
  },
  metadata: {
    fontFamily: fontFamilies.regular,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: fontFamilies.medium,
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '500' as const,
  },
  metric: {
    fontFamily: fontFamilies.semibold,
    fontSize: 19,
    lineHeight: 23,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;
