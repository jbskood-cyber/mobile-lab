import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AnalyticsPeriod } from '@/src/core/analytics';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

const labels: Record<AnalyticsPeriod, string> = { day: 'Día', week: 'Semana', month: 'Mes' };

export function PeriodSelector({ period, anchor, onPeriod, onAnchor }: { period: AnalyticsPeriod; anchor: number; onPeriod: (period: AnalyticsPeriod) => void; onAnchor: (anchor: number) => void }) {
  const move = (direction: -1 | 1) => {
    const date = new Date(anchor);
    if (period === 'day') date.setDate(date.getDate() + direction);
    else if (period === 'week') date.setDate(date.getDate() + direction * 7);
    else date.setMonth(date.getMonth() + direction);
    onAnchor(date.getTime());
    hapticSelection();
  };
  return <View><View style={styles.periods}>{(['day', 'week', 'month'] as AnalyticsPeriod[]).map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: period === item }} onPress={() => { onPeriod(item); hapticSelection(); }} style={({ pressed }) => [styles.period, period === item && styles.periodActive, pressed && pressedStyle]}><Text style={[styles.periodText, period === item && styles.periodTextActive]}>{labels[item]}</Text></Pressable>)}</View><View style={styles.anchorRow}><Pressable accessibilityRole="button" accessibilityLabel="Periodo anterior" onPress={() => move(-1)} style={({ pressed }) => [styles.arrow, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={19} color={foco.colors.text} /></Pressable><Text style={styles.anchor}>{periodLabel(period, anchor)}</Text><Pressable accessibilityRole="button" accessibilityLabel="Periodo siguiente" onPress={() => move(1)} style={({ pressed }) => [styles.arrow, pressed && pressedStyle]}><FocoIcon name="chevron-right" size={19} color={foco.colors.text} /></Pressable></View></View>;
}

function periodLabel(period: AnalyticsPeriod, anchor: number) {
  const date = new Date(anchor);
  if (period === 'day') return date.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  if (period === 'month') return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const weekday = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - weekday);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} ${start.toLocaleDateString('es-MX', { month: 'short' })} – ${end.getDate()} ${end.toLocaleDateString('es-MX', { month: 'short' })}`;
}

const styles = StyleSheet.create({
  periods: { minHeight: 48, marginTop: 15, padding: 3, borderRadius: 15, backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.border, flexDirection: 'row' },
  period: { flex: 1, minHeight: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  periodActive: { backgroundColor: foco.colors.text },
  periodText: { color: foco.colors.muted, fontSize: 13.5, fontWeight: '500' },
  periodTextActive: { color: foco.colors.bg, fontWeight: '700' },
  anchorRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  arrow: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  anchor: { flex: 1, color: foco.colors.text, fontSize: 13.5, fontWeight: '600', textAlign: 'center', textTransform: 'capitalize' },
});
