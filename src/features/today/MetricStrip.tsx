import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/ui/Card';
import { colors, spacing, typeScale } from '@/src/ui/theme';

import type { TodayMetrics } from './model';

type MetricStripProps = {
  focusTime: string;
  metrics: TodayMetrics;
};

type MetricProps = {
  icon: string;
  value: string;
  label: string;
  last?: boolean;
};

function Metric({ icon, value, label, last = false }: MetricProps) {
  return (
    <View style={[styles.metric, !last && styles.metricBorder]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

export function MetricStrip({ focusTime, metrics }: MetricStripProps) {
  return (
    <Card style={styles.card}>
      <Metric icon="◷" value={focusTime} label="Tiempo foco" />
      <Metric icon="≡" value={String(metrics.pending)} label="Pendientes" />
      <Metric icon="○" value={String(metrics.active)} label="En curso" />
      <Metric
        icon="✓"
        value={String(metrics.completed)}
        label="Completadas"
        last
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: spacing.lg,
  },
  metric: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  metricBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  icon: {
    color: colors.textMuted,
    fontSize: 19,
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: typeScale.metric,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  label: {
    color: colors.textSubtle,
    fontSize: 11,
    marginTop: 3,
  },
});