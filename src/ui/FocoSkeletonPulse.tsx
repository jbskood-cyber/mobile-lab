import { type PropsWithChildren, useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { motionDurations } from './motion';
import { useReducedMotion } from './premium';

export function FocoSkeletonPulse({ children }: PropsWithChildren) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (reducedMotion) {
      opacity.value = 1;
      return;
    }
    opacity.value = withRepeat(
      withTiming(0.66, { duration: motionDurations.standard * 3 }),
      -1,
      true,
    );
  }, [opacity, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[{ flex: 1 }, animatedStyle]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {children}
    </Animated.View>
  );
}
