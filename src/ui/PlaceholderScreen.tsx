import { StyleSheet, Text, View } from 'react-native';

import { Card } from './Card';
import { Screen } from './Screen';
import { colors, spacing, typeScale } from './theme';

type PlaceholderScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PlaceholderScreen({
  eyebrow,
  title,
  description,
}: PlaceholderScreenProps) {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>

      <Card style={styles.card} elevated>
        <View style={styles.mark} />
        <Text style={styles.cardTitle}>Base visual activa</Text>
        <Text style={styles.description}>{description}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  eyebrow: {
    color: colors.textSubtle,
    fontSize: typeScale.eyebrow,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: typeScale.title,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  card: {
    minHeight: 220,
    justifyContent: 'center',
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 6,
    borderColor: colors.text,
    borderTopColor: colors.inactive,
    marginBottom: spacing.xl,
  },
  cardTitle: {
    color: colors.text,
    fontSize: typeScale.section,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  description: {
    color: colors.textMuted,
    fontSize: typeScale.bodyLarge,
    lineHeight: 25,
  },
});