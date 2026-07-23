import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocoTheme } from './FocoThemeContext';
import { pressedStyle } from './premium';

export function UndoBar({ message, actionLabel = 'Deshacer', onAction }: { message: string; actionLabel?: string; onAction: () => void }) {
  const insets = useSafeAreaInsets();
  const theme = useFocoTheme();
  return (
    <View accessibilityLiveRegion="polite" style={[styles.bar, { bottom: Math.max(70, insets.bottom + 64), borderColor: theme.colors.border, backgroundColor: theme.colors.elevated, shadowColor: theme.colors.shadow }]}>
      <Text style={[styles.message, { color: theme.colors.text }]} numberOfLines={2}>{message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={({ pressed }) => [styles.action, pressed && pressedStyle]}>
        <Text style={[styles.actionText, { color: theme.colors.accent }]}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', zIndex: 50, left: 14, right: 14, minHeight: 50, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingLeft: 12, paddingRight: 5, flexDirection: 'row', alignItems: 'center', shadowOpacity: 0.18, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  message: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 11.5, lineHeight: 16 },
  action: { minWidth: 76, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  actionText: { fontFamily: 'Manrope_700Bold', fontSize: 11.5, lineHeight: 15 },
});
