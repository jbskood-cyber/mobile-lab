import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconName } from './FocoIcon';
import { FocoPressable } from './FocoPressable';
import { FocoTabItem } from './FocoTabItem';
import { useFocoTheme } from './FocoThemeContext';
import { useFocoUI } from './FocoUIContext';
import { motion } from './motion';
import { useReducedMotion } from './premium';

const routeMeta: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Hoy', icon: 'home' },
  agenda: { label: 'Agenda', icon: 'calendar' },
  focus: { label: 'Enfoque', icon: 'circle' },
  projects: { label: 'Proyectos', icon: 'folder' },
  stats: { label: 'Progreso', icon: 'bars' },
};

const INDICATOR_WIDTH = 20;

export function FocoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useFocoTheme();
  const reducedMotion = useReducedMotion();
  const { keyboardVisible, overlayCount, appMenuVisible, focusImmersive, scrollToTop } = useFocoUI();
  const [barWidth, setBarWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const tabWidth = state.routes.length > 0 ? barWidth / state.routes.length : 0;

  useEffect(() => {
    const target = tabWidth > 0
      ? state.index * tabWidth + Math.max(0, (tabWidth - INDICATOR_WIDTH) / 2)
      : 0;
    indicatorX.value = reducedMotion
      ? target
      : withTiming(target, { duration: motion.fast });
  }, [indicatorX, reducedMotion, state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  if (keyboardVisible || overlayCount > 0 || appMenuVisible || focusImmersive) return null;

  return (
    <View style={{ backgroundColor: theme.colors.bgRaised, paddingBottom: Math.max(insets.bottom, 4) }}>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.borderSoft }} />
      <View
        onLayout={(event) => setBarWidth(event.nativeEvent.layout.width)}
        style={{ height: theme.density.tabBarHeight, flexDirection: 'row', alignItems: 'center' }}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.activeIndicator, { backgroundColor: theme.colors.accent }, indicatorStyle]}
        />
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = routeMeta[route.name] ?? { label: route.name, icon: 'circle' as IconName };
          const options = descriptors[route.key]?.options;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (event.defaultPrevented) return;
            if (focused) scrollToTop(route.name);
            else navigation.navigate(route.name);
          };
          return (
            <FocoPressable
              key={route.key}
              feedback="quiet"
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? meta.label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={styles.item}
            >
              <FocoTabItem
                focused={focused}
                icon={meta.icon}
                label={meta.label}
                activeColor={theme.colors.text}
                inactiveColor={theme.colors.inactive}
              />
            </FocoPressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2 },
  activeIndicator: { position: 'absolute', top: 0, left: 0, width: INDICATOR_WIDTH, height: 2, borderRadius: 1, zIndex: 2 },
});
