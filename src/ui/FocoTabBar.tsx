import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { useFocoUI } from './FocoUIContext';
import { foco } from './focoTheme';
import { hapticSelection, pressedStyle } from './premium';

const routeMeta: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Hoy', icon: 'home' },
  agenda: { label: 'Agenda', icon: 'calendar' },
  focus: { label: 'Enfoque', icon: 'circle' },
  projects: { label: 'Proyectos', icon: 'folder' },
  stats: { label: 'Progreso', icon: 'bars' },
};

export function FocoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { keyboardVisible, overlayCount, appMenuVisible, focusImmersive, scrollToTop } = useFocoUI();

  if (keyboardVisible || overlayCount > 0 || appMenuVisible || focusImmersive) return null;

  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 6) }]}>
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
              <FocoIcon name={meta.icon} size={focused ? 23 : 21} color={focused ? foco.colors.text : foco.colors.inactive} strokeWidth={focused ? 2.1 : 1.55} />
              <Text style={[styles.label, focused && styles.labelActive]} maxFontSizeMultiplier={1.08}>{meta.label}</Text>
              {focused ? <View style={styles.activeLine} /> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: '#08090B' },
  topLine: { height: StyleSheet.hairlineWidth, backgroundColor: foco.colors.borderSoft },
  row: { height: 66, flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, minHeight: 62, alignItems: 'center', justifyContent: 'center', gap: 4 },
  label: { color: foco.colors.inactive, fontSize: 10.3, fontWeight: '550' },
  labelActive: { color: foco.colors.text, fontWeight: '700' },
  activeLine: { position: 'absolute', top: 0, width: 24, height: 2, borderRadius: 1, backgroundColor: foco.colors.text },
});
