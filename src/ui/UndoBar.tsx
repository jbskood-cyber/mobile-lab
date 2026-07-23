import { Pressable, StyleSheet, Text, View } from 'react-native';

import { foco, shadowGlow } from './focoTheme';
import { pressedStyle } from './premium';

export function UndoBar({ message, actionLabel = 'Deshacer', onAction }: { message: string; actionLabel?: string; onAction: () => void }) {
  return (
    <View accessibilityLiveRegion="polite" style={styles.bar}>
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
    left: 18,
    right: 18,
    bottom: 92,
    minHeight: 58,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: foco.colors.border,
    backgroundColor: '#17191E',
    paddingLeft: 16,
    paddingRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadowGlow,
  },
  message: { flex: 1, color: foco.colors.text, fontSize: 14 },
  action: { minWidth: 82, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 13 },
  actionText: { color: foco.colors.text, fontSize: 14, fontWeight: '700' },
});
