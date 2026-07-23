export const typeScale = {
  display: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '700' as const,
    letterSpacing: -1.05,
  },
  title: {
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '650' as const,
    letterSpacing: -0.35,
  },
  section: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '650' as const,
  },
  body: {
    fontSize: 15,
    lineHeight: 20,
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
    fontWeight: '550' as const,
  },
  metric: {
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '650' as const,
    fontVariant: ['tabular-nums'] as const,
  },
} as const;
