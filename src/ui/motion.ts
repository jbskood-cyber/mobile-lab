export const motionDurations = {
  micro: 90,
  fast: 150,
  standard: 220,
} as const;

export const motionSprings = {
  softSpring: {
    damping: 22,
    stiffness: 190,
    mass: 0.9,
  },
  snappySpring: {
    damping: 20,
    stiffness: 300,
    mass: 0.75,
  },
} as const;

export const motionTransitions = {
  fade: {
    duration: motionDurations.fast,
  },
  crossfade: {
    duration: 180,
  },
  shortSlide: {
    duration: motionDurations.standard,
    distance: 8,
  },
} as const;

export function resolveMotionDuration(reducedMotion: boolean, duration: number) {
  return reducedMotion ? 0 : duration;
}

export const motion = {
  ...motionDurations,
  ...motionSprings,
  ...motionTransitions,
} as const;
