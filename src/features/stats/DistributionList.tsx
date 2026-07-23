import { StyleSheet, Text, View } from 'react-native';

import { formatDuration } from '@/src/core/model';
import { foco } from '@/src/ui/focoTheme';

export function DistributionList({ items, emptyCopy }: { items: Array<{ id: string; label: string; focusSeconds: number }>; emptyCopy: string }) {
  const max = Math.max(1, ...items.map((item) => item.focusSeconds));
  const total = items.reduce((sum, item) => sum + item.focusSeconds, 0);

  if (items.length === 0) return <Text style={styles.empty}>{emptyCopy}</Text>;

  return (
    <View style={styles.list}>
      {items.slice(0, 6).map((item, index) => {
        const percentage = total === 0 ? 0 : Math.round((item.focusSeconds / total) * 100);
        return (
          <View key={item.id} style={styles.row} accessibilityLabel={`${item.label}: ${formatDuration(item.focusSeconds, true)}, ${percentage}%`}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={styles.copy}>
              <View style={styles.titleLine}><Text style={styles.label} numberOfLines={1}>{item.label}</Text><Text style={styles.value}>{formatDuration(item.focusSeconds, true)}</Text></View>
              <View style={styles.track}><View style={[styles.fill, { width: `${Math.max(3, (item.focusSeconds / max) * 100)}%` }]} /></View>
            </View>
            <Text style={styles.percent}>{percentage}%</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  rank: { width: 22, color: foco.colors.subtle, fontSize: 11.5, textAlign: 'center', fontVariant: ['tabular-nums'] },
  copy: { flex: 1, minWidth: 0 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1, color: foco.colors.text, fontSize: 13.5, fontWeight: '550' },
  value: { color: foco.colors.muted, fontSize: 11.5, fontVariant: ['tabular-nums'] },
  track: { height: 3, borderRadius: 2, backgroundColor: '#26292F', marginTop: 7, overflow: 'hidden' },
  fill: { height: 3, borderRadius: 2, backgroundColor: '#DCDDDF' },
  percent: { width: 38, color: foco.colors.text, fontSize: 11.5, textAlign: 'right', fontVariant: ['tabular-nums'] },
  empty: { color: foco.colors.muted, fontSize: 12.5, lineHeight: 18, textAlign: 'center', paddingVertical: 24 },
});
