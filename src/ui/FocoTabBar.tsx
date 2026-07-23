import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { foco } from './focoTheme';

const routeMeta: Record<string, { label: string; icon: IconName }> = {
  index: { label: 'Hoy', icon: 'home' },
  projects: { label: 'Proyectos', icon: 'folder' },
  focus: { label: 'Enfoque', icon: 'circle' },
  stats: { label: 'Estadísticas', icon: 'bars' },
};

export function FocoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrapper, { paddingBottom: Math.max(insets.bottom, 8) }]}> 
      <View style={styles.topLine} />
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const meta = routeMeta[route.name] ?? { label: route.name, icon: 'circle' as IconName };
          const options = descriptors[route.key]?.options;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options?.tabBarAccessibilityLabel ?? meta.label}
              onPress={onPress}
              style={styles.item}
            >
              <View style={[styles.iconHalo, focused && styles.iconHaloActive]}>
                <FocoIcon name={meta.icon} size={focused ? 24 : 23} color={focused ? foco.colors.text : foco.colors.inactive} strokeWidth={focused ? 2.1 : 1.65} />
              </View>
              <Text style={[styles.label, focused && styles.labelActive]} maxFontSizeMultiplier={1.1}>{meta.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: 'rgba(8,9,11,0.98)', paddingTop: 8 },
  topLine: { height: 1, backgroundColor: foco.colors.borderSoft },
  row: { height: 72, flexDirection: 'row', alignItems: 'center' },
  item: { flex: 1, minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconHalo: { width: 38, height: 32, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconHaloActive: { backgroundColor: 'rgba(255,255,255,0.055)' },
  label: { color: foco.colors.inactive, fontSize: 12, fontWeight: '500' },
  labelActive: { color: foco.colors.text, fontWeight: '600' },
});
