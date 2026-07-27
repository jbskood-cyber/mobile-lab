import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FocoIcon, type IconName } from './FocoIcon';
import { FocoPressable } from './FocoPressable';
import { useFocoTheme } from './FocoThemeContext';
import { useFocoUI } from './FocoUIContext';

type RouteMeta = { label: string; icon: IconName };
const DEFAULT_ROUTE_META: RouteMeta = { label: 'Hoy', icon: 'home' };
const routeMeta: Record<string, RouteMeta> = {
  index: { label: 'Hoy', icon: 'home' },
  agenda: { label: 'Agenda', icon: 'calendar' },
  focus: { label: 'Enfoque', icon: 'circle' },
  projects: { label: 'Proyectos', icon: 'folder' },
  stats: { label: 'Progreso', icon: 'bars' },
};

export function FocoTabBar({ state }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useFocoTheme();
  const { keyboardVisible, overlayCount, appMenuVisible, focusImmersive, openAppMenu } = useFocoUI();
  const currentRoute = state.routes[state.index];
  const currentMeta = routeMeta[currentRoute?.name ?? 'index'] ?? DEFAULT_ROUTE_META;

  if (keyboardVisible || overlayCount > 0 || appMenuVisible || focusImmersive) return null;

  return (
    <View pointerEvents="box-none" style={[styles.zone, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      <FocoPressable
        feedback="quiet"
        accessibilityRole="button"
        accessibilityLabel={`Abrir navegación. Sección actual: ${currentMeta.label}`}
        onPress={openAppMenu}
        style={[styles.capsule, { backgroundColor: theme.colors.inverse, borderColor: theme.colors.border }]}
      >
        <FocoIcon name={currentMeta.icon} size={18} color={theme.colors.inverseText} weight="fill" />
        <Text style={[styles.capsuleLabel, { color: theme.colors.inverseText }]} numberOfLines={1}>{currentMeta.label}</Text>
        <FocoIcon name="chevron-down" size={15} color={theme.colors.inverseText} style={styles.chevron} />
      </FocoPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  zone: {
    minHeight: 62,
    paddingTop: 5,
    paddingHorizontal: 14,
    alignItems: 'flex-end',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  capsule: {
    minHeight: 46,
    maxWidth: 190,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  capsuleLabel: {
    flexShrink: 1,
    fontFamily: 'InstrumentSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: { transform: [{ rotate: '180deg' }] },
});
