export const typeScale = {
  display: {
    fontSize: 44,
    lineHeight: 49,
    fontWeight: '700' as const,
    letterSpacing: -1.5,
  },
  title: {
    fontSize: 23,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
  },
  section: {
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 15.5,
    lineHeight: 21,
    fontWeight: '400' as const,
  },
  metadata: {
    fontSize: 12.5,
    lineHeight: 17,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11.5,
    lineHeight: 15,
    fontWeight: '500' as const,
  },
  metric: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '600' as const,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;
