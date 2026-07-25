import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { motionDurations } from './motion';
import { useReducedMotion } from './premium';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  size: number;
  strokeWidth?: number;
  progress: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
  glow?: boolean;
};

export function ProgressRing({
  size,
  strokeWidth = 4,
  progress,
  color = '#F7F7F8',
  trackColor = '#34373E',
  children,
  glow = false,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalized = Math.max(0, Math.min(1, progress));
  const reducedMotion = useReducedMotion();
  const animatedProgress = useSharedValue(normalized);

  useEffect(() => {
    animatedProgress.value = withTiming(normalized, { duration: reducedMotion ? 0 : motionDurations.micro });
  }, [animatedProgress, normalized, reducedMotion]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: glow ? '#FFFFFF' : 'transparent',
        shadowOpacity: glow ? 0.2 : 0,
        shadowRadius: glow ? 14 : 0,
        shadowOffset: { width: 0, height: 0 },
        elevation: glow ? 6 : 0,
      }}
      accessibilityElementsHidden
    >
      <Svg width={size} height={size} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
        />
      </Svg>
      {children}
    </View>
  );
}
