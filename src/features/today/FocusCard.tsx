import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/ui/Card';
import { colors, radii, spacing, typeScale } from '@/src/ui/theme';

export function FocusCard() {
  return (
    <Card style={styles.card} elevated>
      <View style={styles.copy}>
        <Text style={styles.title}>Bloque 2 · Transformación</Text>
        <Text style={styles.project}>Plan maestro</Text>
        <Text style={styles.timer}>24:36</Text>
        <Text style={styles.objective}>Objetivo: 3 bloques</Text>
      </View>

      <View style={styles.orbit} accessibilityElementsHidden>
        <View style={styles.orbitInner} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Iniciar sesión de enfoque"
        style={({ pressed }) => [
          styles.playButton,
          pressed && styles.playButtonPressed,
        ]}
      >
        <Text style={styles.playIcon}>▶</Text>
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 190,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  copy: {
    zIndex: 2,
    maxWidth: '72%',
  },
  title: {
    color: colors.text,
    fontSize: typeScale.bodyLarge,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  project: {
    color: colors.textMuted,
    fontSize: typeScale.body,
  },
  timer: {
    color: colors.text,
    fontSize: typeScale.timer,
    fontWeight: '300',
    letterSpacing: -1.5,
    marginTop: spacing.xl,
  },
  objective: {
    color: colors.textMuted,
    fontSize: typeScale.body,
    marginTop: 2,
  },
  orbit: {
    position: 'absolute',
    right: -34,
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.75,
  },
  orbitInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  playButton: {
    position: 'absolute',
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.surfaceSoft,
    shadowColor: colors.white,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
    zIndex: 3,
  },
  playButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.85,
  },
  playIcon: {
    color: colors.text,
    fontSize: 24,
    marginLeft: 3,
  },
});