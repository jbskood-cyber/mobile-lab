import { useEffect } from 'react';
import { Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { FocoIcon, type IconName } from './FocoIcon';
import { motion } from './motion';
import { useReducedMotion } from './premium';
import { fontFamilies, typeScale } from './themeTokens';

type Props = {
  focused: boolean;
  icon: IconName;
  label: string;
  activeColor: string;
  inactiveColor: string;
};

export function FocoTabItem({ focused, icon, label, activeColor, inactiveColor }: Props) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    const target = focused ? 1 : 0;
    progress.value = reducedMotion
      ? target
      : withTiming(target, { duration: motion.micro });
  }, [focused, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: 0.78 + progress.value * 0.22,
    transform: [{ scale: 0.985 + progress.value * 0.015 }],
  }));

  const color = focused ? activeColor : inactiveColor;

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center', gap: 2 }, animatedStyle]}>
      <FocoIcon
        name={icon}
        size={focused ? 21 : 20}
        color={color}
        weight={focused ? 'fill' : 'regular'}
      />
      <Text
        style={[
          typeScale.caption,
          {
            color,
            fontFamily: focused ? fontFamilies.semibold : fontFamilies.medium,
          },
        ]}
        maxFontSizeMultiplier={1.08}
      >
        {label}
      </Text>
    </Animated.View>
  );
}
