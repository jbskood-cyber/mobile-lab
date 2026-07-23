import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typeScale } from './theme';

type SectionHeaderProps = {
  title: string;
  detail?: string;
};

export function SectionHeader({ title, detail }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {detail ? <Text style={styles.detail}>{detail}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    color: colors.text,
    fontSize: typeScale.section,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  detail: {
    color: colors.textMuted,
    fontSize: typeScale.body,
  },
});