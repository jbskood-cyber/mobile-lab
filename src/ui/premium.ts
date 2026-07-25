import * as Haptics from 'expo-haptics';
import { AccessibilityInfo } from 'react-native';
import { useEffect, useState } from 'react';

export function hapticSelection() {
  void Haptics.selectionAsync().catch(() => undefined);
}

export function hapticSuccess() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function hapticWarning() {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}

export function hapticImpact() {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => subscription.remove();
  }, []);

  return reduced;
}

export const pressFeedback = {
  quiet: {
    opacity: 0.94,
    transform: [{ scale: 0.996 }],
  },
  control: {
    opacity: 0.92,
    transform: [{ scale: 0.992 }],
  },
  primary: {
    opacity: 0.96,
    transform: [{ scale: 0.988 }],
  },
} as const;

// Compatibility alias for surfaces that have not yet migrated to a semantic press variant.
export const pressedStyle = pressFeedback.control;
