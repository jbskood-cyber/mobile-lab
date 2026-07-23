import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { useFocoUI } from './FocoUIContext';
import { foco } from './focoTheme';
import { hapticSelection, pressedStyle } from './premium';

const routeMeta: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Hoy', icon: 'home' },
  projects: { label: 'Proyectos', icon: 'folder' },
  focus: { label: 'Enfoque', icon: 'circle' },
  stats: { label: 'Estadísticas', icon: 'bars' },
};

export function FocoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { keyboardVisible, overlayCount, scrollToTop } = useFocoUI();

  if (keyboardVisible || overlayCount > 0) return null;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 7) }]}>
      <View style={styles.topLine} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = routeMeta[route.name] ?? { label: route.name, icon: 'circle' as IconName };
          const options = descriptors[route.key]?.options;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (event.defaultPrevented) return;
            hapticSelection();
            scrollToTop(route.name);
            if (!focused) navigation.navigate(route.name);
          };
          const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? meta.label}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [styles.item, pressed && pressedStyle]}
            >
              <View style={[styles.iconHalo, focused && styles.iconHaloActive]}>
                <FocoIcon name={meta.icon} size={focused ? 23 : 22} color={focused ? foco.colors.text : foco.colors.inactive} strokeWidth={focused ? 2.05 : 1.6} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} maxFontSizeMultiplier={1.12}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#08090B', paddingTop: 6 },
  topLine: { height: 1, backgroundColor: foco.colors.borderSoft },
  row: { height: 68, flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 3 },
  iconHalo: { width: 42, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  iconHaloActive: { backgroundColor: 'rgba(255,255,255,0.06)' },
  label: { color: foco.colors.inactive, fontSize: 11.5, fontWeight: '500' },
  labelActive: { color: foco.colors.text, fontWeight: '600' },
});
