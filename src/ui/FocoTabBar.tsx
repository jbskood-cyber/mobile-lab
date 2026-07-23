import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { useFocoTheme } from './FocoThemeContext';
import { useFocoUI } from './FocoUIContext';
import { hapticSelection, pressedStyle } from './premium';
import { fontFamilies } from './themeTokens';

const routeMeta: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Hoy', icon: 'home' },
  agenda: { label: 'Agenda', icon: 'calendar' },
  focus: { label: 'Enfoque', icon: 'circle' },
  projects: { label: 'Proyectos', icon: 'folder' },
  stats: { label: 'Progreso', icon: 'bars' },
};

export function FocoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useFocoTheme();
  const { keyboardVisible, overlayCount, appMenuVisible, focusImmersive, scrollToTop } = useFocoUI();
  if (keyboardVisible || overlayCount > 0 || appMenuVisible || focusImmersive) return null;

  return (
    <View style={{ backgroundColor: theme.colors.bgRaised, paddingBottom: Math.max(insets.bottom, 4) }}>
      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: theme.colors.borderSoft }} />
      <View style={{ height: theme.density.tabBarHeight, flexDirection: 'row', alignItems: 'center' }}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = routeMeta[route.name] ?? { label: route.name, icon: 'circle' as IconName };
          const options = descriptors[route.key]?.options;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (event.defaultPrevented) return;
            hapticSelection();
            if (focused) scrollToTop(route.name);
            else navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? meta.label}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: 'tabLongPress', target: route.key })}
              style={({ pressed }) => [styles.item, pressed && pressedStyle]}
            >
              <FocoIcon name={meta.icon} size={focused ? 21 : 20} color={focused ? theme.colors.text : theme.colors.inactive} strokeWidth={focused ? 2.05 : 1.55} />
              <Text style={{ color: focused ? theme.colors.text : theme.colors.inactive, fontFamily: focused ? fontFamilies.semibold : fontFamilies.medium, fontSize: 9.5, lineHeight: 12 }} maxFontSizeMultiplier={1.08}>{meta.label}</Text>
              {focused ? <View style={{ position: 'absolute', top: 0, width: 20, height: 2, borderRadius: 1, backgroundColor: theme.colors.accent }} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2 },
});
