import { StyleSheet, Text, View } from 'react-native';

import type { HourlyProductivity } from '@/src/core/analytics';
import { formatDuration } from '@/src/core/model';
import { foco } from '@/src/ui/focoTheme';

export function ProductiveHoursChart({ values }: { values: HourlyProductivity[] }) {
  const max = Math.max(1, ...values.map((item) => item.focusSeconds));
  const best = [...values].sort((a, b) => b.focusSeconds - a.focusSeconds)[0];

  if (!best || best.focusSeconds === 0) return <Text style={styles.empty}>Completa más sesiones para descubrir tus horas más productivas.</Text>;

  return (
    <View style={styles.root}>
      <View style={styles.chart}>
        {values.map((item) => (
          <View key={item.hour} style={styles.slot} accessibilityLabel={`${String(item.hour).padStart(2, '0')}:00, ${formatDuration(item.focusSeconds, true)}`}>
            <View style={[styles.bar, item.hour === best.hour && styles.bestBar, { height: item.focusSeconds === 0 ? 2 : Math.max(6, (item.focusSeconds / max) * 72) }]} />
            <Text style={styles.label}>{item.hour % 6 === 0 ? `${item.hour}h` : ''}</Text>
          </View>
        ))}
      </View>
      <View style={styles.insight}>
        <Text style={styles.insightLabel}>Mejor franja</Text>
        <Text style={styles.insightValue}>{String(best.hour).padStart(2, '0')}:00–{String((best.hour + 1) % 24).padStart(2, '0')}:00 · {formatDuration(best.focusSeconds, true)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft, paddingTop: 12 },
  chart: { height: 96, flexDirection: 'row', alignItems: 'flex-end' },
  slot: { flex: 1, height: 96, minWidth: 2, alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: '56%', minWidth: 2, borderTopLeftRadius: 2, borderTopRightRadius: 2, backgroundColor: '#4C5058' },
  bestBar: { backgroundColor: '#E7E7E8' },
  label: { height: 18, color: foco.colors.muted, fontSize: 8.5, lineHeight: 18 },
  insight: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  insightLabel: { color: foco.colors.muted, fontSize: 11.5 },
  insightValue: { color: foco.colors.text, fontSize: 11.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  empty: { color: foco.colors.muted, fontSize: 12.5, textAlign: 'center', paddingVertical: 24, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft },
});
