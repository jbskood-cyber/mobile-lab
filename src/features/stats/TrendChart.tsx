import { StyleSheet, Text, View } from 'react-native';

import type { AnalyticsPeriod, PeriodSeriesPoint } from '@/src/core/analytics';
import { formatDuration } from '@/src/core/model';
import { foco } from '@/src/ui/focoTheme';

export function TrendChart({ series, period }: { series: PeriodSeriesPoint[]; period: AnalyticsPeriod }) {
  const max = Math.max(1, ...series.map((point) => point.focusSeconds));
  const visible = period === 'day'
    ? series.map((point, index) => ({ ...point, label: index % 6 === 0 ? `${index}h` : '' }))
    : period === 'week'
      ? series.map((point) => ({ ...point, label: new Date(point.start).toLocaleDateString('es-MX', { weekday: 'short' }).slice(0, 2) }))
      : series.map((point, index) => ({ ...point, label: index % 5 === 0 ? String(index + 1) : '' }));

  return (
    <View style={styles.root} accessibilityRole="summary">
      <View style={styles.chart}>
        {visible.map((point, index) => (
          <View key={point.start} style={styles.slot} accessibilityLabel={`${chartLabel(period, point.start)}: ${formatDuration(point.focusSeconds, true)}, ${point.completedTasks} tareas`}>
            <View style={[styles.bar, { height: point.focusSeconds === 0 ? 2 : Math.max(8, (point.focusSeconds / max) * 116) }]} />
            <Text style={styles.label}>{point.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.axis}><Text style={styles.axisText}>{formatDuration(max, true)}</Text><Text style={styles.axisText}>0m</Text></View>
    </View>
  );
}

function chartLabel(period: AnalyticsPeriod, timestamp: number) {
  const date = new Date(timestamp);
  if (period === 'day') return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}

const styles = StyleSheet.create({
  root: { minHeight: 160, flexDirection: 'row', paddingTop: 12 },
  chart: { flex: 1, height: 142, flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  slot: { flex: 1, height: 142, minWidth: 2, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '52%', minWidth: 2, maxWidth: 22, borderTopLeftRadius: 3, borderTopRightRadius: 3, backgroundColor: '#DEDFE1' },
  label: { height: 19, color: foco.colors.muted, fontSize: 9.5, lineHeight: 19, textAlign: 'center' },
  axis: { width: 38, height: 124, justifyContent: 'space-between', alignItems: 'flex-end', paddingLeft: 6 },
  axisText: { color: foco.colors.subtle, fontSize: 9.5 },
});
