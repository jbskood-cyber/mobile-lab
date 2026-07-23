import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { foco, shadowGlow } from './focoTheme';
import { pressedStyle } from './premium';

export function UndoBar({ message, actionLabel = 'Deshacer', onAction }: { message: string; actionLabel?: string; onAction: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View accessibilityLiveRegion="polite" style={[styles.bar, { bottom: Math.max(82, insets.bottom + 74) }]}>
      <Text style={styles.message} numberOfLines={2}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={actionLabel}
        onPress={onAction}
        style={({ pressed }) => [styles.action, pressed && pressedStyle]}
      >
        <Text style={styles.actionText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    zIndex: 50,
    elevation: 14,
    left: 16,
    right: 16,
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: foco.colors.border,
    backgroundColor: '#17191E',
    paddingLeft: 15,
    paddingRight: 7,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadowGlow,
  },
  message: { flex: 1, color: foco.colors.text, fontSize: 13.5, lineHeight: 18 },
  action: { minWidth: 80, minHeight: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  actionText: { color: foco.colors.text, fontSize: 13.5, fontWeight: '700' },
});
