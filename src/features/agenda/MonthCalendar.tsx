import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { buildMonthGrid, shiftMonth } from '@/src/core/calendar';
import type { FocoState } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';
import type { FocoTheme } from '@/src/ui/themeTokens';

const weekdays = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

export function MonthCalendar({ state, anchor, selected, onAnchor, onSelect }: {
  state: FocoState;
  anchor: number;
  selected: number;
  onAnchor: (value: number) => void;
  onSelect: (value: number) => void;
}) {
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const days = useMemo(() => buildMonthGrid(state, anchor), [anchor, state]);
  const monthLabel = new Date(anchor).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^./, (value) => value.toUpperCase());

  return (
    <View style={styles.root}>
      <View style={styles.monthHeader}>
        <Pressable accessibilityLabel="Mes anterior" onPress={() => { onAnchor(shiftMonth(anchor, -1)); hapticSelection(); }} style={({ pressed }) => [styles.arrow, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={18} color={theme.colors.muted} /></Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable accessibilityLabel="Mes siguiente" onPress={() => { onAnchor(shiftMonth(anchor, 1)); hapticSelection(); }} style={({ pressed }) => [styles.arrow, pressed && pressedStyle]}><FocoIcon name="chevron-right" size={18} color={theme.colors.muted} /></Pressable>
      </View>
      <View style={styles.weekdays}>{weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}</View>
      <View style={styles.grid}>
        {days.map((day) => {
          const active = day.timestamp === selected;
          return (
            <Pressable
              key={day.timestamp}
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${new Date(day.timestamp).toLocaleDateString('es-MX')}, ${day.taskCount} tareas`}
              onPress={() => { onSelect(day.timestamp); hapticSelection(); }}
              style={({ pressed }) => [styles.cell, active && styles.cellActive, pressed && pressedStyle]}
            >
              <Text style={[styles.day, !day.inMonth && styles.outside, active && styles.dayActive]}>{day.day}</Text>
              <View style={styles.indicators}>
                {day.taskCount > 0 ? <View style={[styles.dot, { backgroundColor: day.completedCount === day.taskCount ? theme.colors.success : theme.colors.accent }]} /> : null}
                {day.focusSeconds > 0 ? <View style={[styles.dot, styles.focusDot]} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    root: { marginTop: 10, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.borderSoft },
    monthHeader: { height: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    arrow: { width: 44, height: 38, alignItems: 'center', justifyContent: 'center' },
    monthLabel: { color: theme.colors.text, fontFamily: theme.fonts.semibold, fontSize: 15, lineHeight: 19 },
    weekdays: { flexDirection: 'row', paddingBottom: 4 },
    weekday: { width: '14.2857%', textAlign: 'center', color: theme.colors.subtle, fontFamily: theme.fonts.medium, fontSize: 10, lineHeight: 14 },
    grid: { flexDirection: 'row', flexWrap: 'wrap' },
    cell: { width: '14.2857%', height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
    cellActive: { backgroundColor: theme.colors.inverse },
    day: { color: theme.colors.text, fontFamily: theme.fonts.medium, fontSize: 13, lineHeight: 16, fontVariant: ['tabular-nums'] },
    dayActive: { color: theme.colors.inverseText, fontFamily: theme.fonts.semibold },
    outside: { color: theme.colors.inactive },
    indicators: { height: 5, marginTop: 2, flexDirection: 'row', gap: 2 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    focusDot: { backgroundColor: theme.colors.muted },
  });
}
