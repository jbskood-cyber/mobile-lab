import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getWeekBounds, getWeekStats, type FocusSession, type TaskPriority } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';
import { formatWeekLabel } from './statsModel';

type Tab = 'Resumen' | 'Pomodoro' | 'Tareas';
type Distribution = { label: string; seconds: number; color: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function levelFor(value: number, max: number) {
  if (value <= 0 || max <= 0) return 0;
  const ratio = value / max;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function sessionDistribution(sessions: FocusSession[]): Distribution[] {
  const totals = sessions.reduce((result, session) => {
    const bucket = session.durationSec >= 45 * 60 ? 0 : session.durationSec >= 20 * 60 ? 1 : 2;
    result[bucket] = (result[bucket] ?? 0) + session.durationSec;
    return result;
  }, [0, 0, 0]);
  return [
    { label: 'Profundo', seconds: totals[0] ?? 0, color: '#D8D8DA' },
    { label: 'Medio', seconds: totals[1] ?? 0, color: '#8A8D93' },
    { label: 'Breve', seconds: totals[2] ?? 0, color: '#555961' },
  ];
}

export function StatsScreen() {
  const { state } = useFocoStore();
  const [tab, setTab] = useState<Tab>('Resumen');
  const [weekOffset, setWeekOffset] = useState(0);
  const week = useMemo(() => getWeekStats(state, weekOffset), [state, weekOffset]);
  const selectedSessions = useMemo(() => tab === 'Pomodoro' ? week.sessions.filter((session) => session.mode === 'pomodoro') : week.sessions, [tab, week.sessions]);

  const taskDayCounts = useMemo(() => {
    const counts = Array.from({ length: 7 }, () => 0);
    for (const task of state.tasks) {
      if (task.completedAt === undefined || task.completedAt < week.start || task.completedAt >= week.end) continue;
      const index = Math.min(6, Math.max(0, Math.floor((startOfDay(task.completedAt) - week.start) / DAY_MS)));
      counts[index] = (counts[index] ?? 0) + 1;
    }
    return counts;
  }, [state.tasks, week.end, week.start]);

  const sessionDaySeconds = useMemo(() => {
    const values = Array.from({ length: 7 }, () => 0);
    for (const session of selectedSessions) {
      const index = Math.min(6, Math.max(0, Math.floor((startOfDay(session.endedAt) - week.start) / DAY_MS)));
      values[index] = (values[index] ?? 0) + session.durationSec;
    }
    return values;
  }, [selectedSessions, week.start]);

  const chartValues = tab === 'Tareas' ? taskDayCounts : sessionDaySeconds;
  const total = chartValues.reduce((sum, value) => sum + value, 0);
  const maximum = Math.max(1, ...chartValues);
  const openTasks = state.tasks.filter((task) => !task.completed).length;
  const completedTotal = state.tasks.filter((task) => task.completed).length;
  const totalTasks = state.tasks.length;
  const taskCompletion = totalTasks === 0 ? 0 : completedTotal / totalTasks;
  const selectedTotal = selectedSessions.reduce((sum, session) => sum + session.durationSec, 0);
  const sessionAverage = selectedSessions.length === 0 ? 0 : selectedTotal / selectedSessions.length;
  const dailyGoal = 2 * 60 * 60;
  const goalRatio = Math.min(1, selectedTotal / (7 * dailyGoal));

  const summary = tab === 'Tareas'
    ? [
      { icon: 'check' as const, value: String(week.completedTasks), label: 'Completadas' },
      { icon: 'list' as const, value: String(openTasks), label: 'Pendientes' },
      { icon: 'target' as const, value: `${Math.round(taskCompletion * 100)}%`, label: 'Progreso' },
    ]
    : tab === 'Pomodoro'
      ? [
        { icon: 'clock' as const, value: formatDuration(selectedTotal, true), label: 'Pomodoro' },
        { icon: 'target' as const, value: String(selectedSessions.length), label: 'Ciclos' },
        { icon: 'check' as const, value: formatDuration(sessionAverage, true), label: 'Promedio' },
      ]
      : [
        { icon: 'clock' as const, value: formatDuration(week.totalSeconds, true), label: 'Tiempo total' },
        { icon: 'target' as const, value: formatDuration(week.totalSeconds / 7, true), label: 'Promedio' },
        { icon: 'check' as const, value: `${Math.round(goalRatio * 100)}%`, label: 'Objetivo' },
      ];

  const heatmap = useMemo(() => {
    const currentBounds = getWeekBounds(weekOffset);
    const start = currentBounds.start - 17 * 7 * DAY_MS;
    const values = Array.from({ length: 126 }, () => 0);
    if (tab === 'Tareas') {
      for (const task of state.tasks) {
        if (task.completedAt === undefined) continue;
        const index = Math.floor((startOfDay(task.completedAt) - start) / DAY_MS);
        if (index >= 0 && index < values.length) values[index] = (values[index] ?? 0) + 1;
      }
    } else {
      for (const session of state.sessions) {
        if (tab === 'Pomodoro' && session.mode !== 'pomodoro') continue;
        const index = Math.floor((startOfDay(session.endedAt) - start) / DAY_MS);
        if (index >= 0 && index < values.length) values[index] = (values[index] ?? 0) + session.durationSec;
      }
    }
    const max = Math.max(1, ...values);
    return values.map((value) => levelFor(value, max));
  }, [state.sessions, state.tasks, tab, weekOffset]);

  const distribution = useMemo(() => {
    if (tab !== 'Tareas') return sessionDistribution(selectedSessions);
    const completed = state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= week.start && task.completedAt < week.end);
    const priorities: Array<{ label: TaskPriority; color: string }> = [
      { label: 'Alta', color: '#D8D8DA' },
      { label: 'Media', color: '#8A8D93' },
      { label: 'Baja', color: '#555961' },
    ];
    return priorities.map((item) => ({
      label: item.label,
      seconds: completed.filter((task) => task.priority === item.label).length,
      color: item.color,
    }));
  }, [selectedSessions, state.tasks, tab, week.end, week.start]);

  const distributionTotal = distribution.reduce((sum, item) => sum + item.seconds, 0);
  const primaryShare = distributionTotal === 0 ? 0 : (distribution[0]?.seconds ?? 0) / distributionTotal;
  const hasWeekData = total > 0;

  return (
    <FocoScreen
      title="Estadísticas"
      screenKey="stats"
      rightIcon="calendar"
      rightAccessibilityLabel="Volver a la semana actual"
      onRightPress={() => { setWeekOffset(0); hapticSelection(); }}
    >
      <View style={styles.tabs}>
        {(['Resumen', 'Pomodoro', 'Tareas'] as Tab[]).map((item) => {
          const selected = item === tab;
          return (
            <Pressable key={item} onPress={() => { setTab(item); hapticSelection(); }} style={({ pressed }) => [styles.tab, pressed && pressedStyle]} accessibilityRole="radio" accessibilityState={{ checked: selected }}>
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{item}</Text>
              {selected ? <View style={styles.tabUnderline} /> : null}
            </Pressable>
          );
        })}
      </View>

      <Surface style={styles.weekPicker}>
        <Pressable accessibilityRole="button" accessibilityLabel="Semana anterior" onPress={() => { setWeekOffset((value) => value - 1); hapticSelection(); }} style={({ pressed }) => [styles.arrowButton, pressed && pressedStyle]}>
          <FocoIcon name="chevron-left" size={20} color={foco.colors.text} />
        </Pressable>
        <Text style={styles.weekText} numberOfLines={1} adjustsFontSizeToFit>{formatWeekLabel(week.start, week.end)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Semana siguiente" onPress={() => { setWeekOffset((value) => value + 1); hapticSelection(); }} style={({ pressed }) => [styles.arrowButton, pressed && pressedStyle]}>
          <FocoIcon name="chevron-right" size={20} color={foco.colors.text} />
        </Pressable>
      </Surface>

      <View style={styles.summaryRow}>
        {summary.map((item) => <Summary key={item.label} icon={item.icon} value={item.value} label={item.label} />)}
      </View>

      {!hasWeekData ? (
        <Surface style={styles.emptyState}>
          <FocoIcon name={tab === 'Tareas' ? 'check' : 'clock'} size={28} color={foco.colors.text} />
          <Text style={styles.emptyTitle}>Semana sin actividad</Text>
          <Text style={styles.emptyCopy}>{tab === 'Tareas' ? 'Completa una tarea para empezar.' : 'Registra una sesión en Enfoque.'}</Text>
        </Surface>
      ) : null}

      <Surface style={styles.heatmapCard}>
        <Text style={styles.cardTitle}>Mapa de actividad</Text>
        <View style={styles.months}><Text style={styles.month}>18 sem</Text><Text style={styles.month}>9 sem</Text><Text style={styles.month}>Ahora</Text></View>
        <View style={styles.heatmapBody} accessibilityLabel="Mapa de actividad de las últimas dieciocho semanas">
          <View style={styles.dayLetters}>{['L','M','X','J','V','S','D'].map((day) => <Text key={day} style={styles.dayLetter}>{day}</Text>)}</View>
          <View style={styles.grid} importantForAccessibility="no-hide-descendants">
            {heatmap.map((level, index) => <View key={`${index}-${level}`} style={[styles.cell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />)}
          </View>
        </View>
        <View style={styles.legend}><Text style={styles.legendText}>Menos</Text>{[0,1,2,3,4].map((level) => <View key={level} style={[styles.legendCell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />)}<Text style={styles.legendText}>Más</Text></View>
      </Surface>

      <Surface style={styles.chartCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>{tab === 'Tareas' ? 'Tareas completadas' : 'Tiempo de concentración'}</Text><Text style={styles.selector}>Diario</Text></View>
        <View style={styles.chartArea}>
          <View style={styles.axisLabels}>
            {[maximum, Math.round(maximum * 0.66), Math.round(maximum * 0.33), 0].map((value, index) => <Text key={`${value}-${index}`} style={styles.axisText}>{tab === 'Tareas' ? value : formatDuration(value, true)}</Text>)}
          </View>
          <View style={styles.barsArea}>
            {chartValues.map((value, index) => (
              <View key={days[index]} style={styles.barSlot} accessibilityLabel={`${days[index]}: ${tab === 'Tareas' ? `${value} tareas` : formatDuration(value, true)}`}>
                <View style={[styles.bar, { height: value === 0 ? 2 : Math.max(8, (value / maximum) * 112) }]} />
                <Text style={styles.dayName}>{days[index]}</Text>
              </View>
            ))}
          </View>
        </View>
      </Surface>

      <Surface style={styles.distributionCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>{tab === 'Tareas' ? 'Por prioridad' : 'Por enfoque'}</Text><Text style={styles.selector}>{tab === 'Tareas' ? 'Tareas' : 'Tiempo'}</Text></View>
        <View style={styles.distributionBody}>
          <ProgressRing size={102} strokeWidth={14} progress={primaryShare} color="#E7E7E8" trackColor="#34373E">
            <Text style={styles.donutValue}>{Math.round(primaryShare * 100)}%</Text>
          </ProgressRing>
          <View style={styles.legendList}>
            {distribution.map((item) => {
              const percent = distributionTotal === 0 ? 0 : Math.round((item.seconds / distributionTotal) * 100);
              const value = tab === 'Tareas' ? `${percent}% (${item.seconds})` : `${percent}% (${formatDuration(item.seconds, true)})`;
              return <LegendRow key={item.label} color={item.color} label={item.label} value={value} />;
            })}
          </View>
        </View>
      </Surface>
    </FocoScreen>
  );
}

function Summary({ icon, value, label }: { icon: 'clock' | 'target' | 'check' | 'list'; value: string; label: string }) {
  return <Surface style={styles.summaryCard}><FocoIcon name={icon} size={27} color={foco.colors.text} /><Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit maxFontSizeMultiplier={1.08}>{value}</Text><Text style={styles.summaryLabel} numberOfLines={1}>{label}</Text></Surface>;
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.legendRow}><View style={[styles.legendDot,{ backgroundColor: color }]} /><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text></View>;
}

const styles = StyleSheet.create({
  tabs: { marginTop: 16, height: 50, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: foco.colors.borderSoft },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: foco.colors.muted, fontSize: 15.5 },
  tabTextSelected: { color: foco.colors.text, fontWeight: '600' },
  tabUnderline: { position: 'absolute', bottom: -1, width: '82%', height: 2, borderRadius: 2, backgroundColor: foco.colors.text },
  weekPicker: { minHeight: 52, marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 5 },
  arrowButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  weekText: { flex: 1, minWidth: 0, color: foco.colors.text, fontSize: 15.5, fontWeight: '500', textAlign: 'center', fontVariant: ['tabular-nums'] },
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  summaryCard: { flex: 1, minWidth: 0, minHeight: 116, padding: 13, justifyContent: 'space-between' },
  summaryValue: { color: foco.colors.text, fontSize: 18, fontWeight: '600', marginTop: 10, fontVariant: ['tabular-nums'] },
  summaryLabel: { color: foco.colors.muted, fontSize: 11.5, marginTop: 5 },
  emptyState: { marginTop: 12, minHeight: 126, alignItems: 'center', justifyContent: 'center', padding: 17 },
  emptyTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '600', marginTop: 9 },
  emptyCopy: { color: foco.colors.muted, fontSize: 12.5, lineHeight: 18, textAlign: 'center', marginTop: 4 },
  heatmapCard: { marginTop: 12, padding: 14, overflow: 'hidden' },
  cardTitle: { flexShrink: 1, color: foco.colors.text, fontSize: 15.5, fontWeight: '600' },
  months: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 26, marginTop: 8 },
  month: { color: foco.colors.muted, fontSize: 10.5 },
  heatmapBody: { flexDirection: 'row', marginTop: 7 },
  dayLetters: { width: 22, gap: 3 },
  dayLetter: { height: 11, color: foco.colors.muted, fontSize: 9, lineHeight: 11 },
  grid: { flex: 1, minWidth: 0, flexDirection: 'column', flexWrap: 'wrap', height: 95, gap: 3, alignContent: 'space-between' },
  cell: { width: 11, height: 11, borderRadius: 2.5, backgroundColor: '#202329' },
  cell1: { backgroundColor: '#34373D' },
  cell2: { backgroundColor: '#666A71' },
  cell3: { backgroundColor: '#B5B7BB' },
  cell4: { backgroundColor: '#F1F1F2' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 9 },
  legendText: { color: foco.colors.muted, fontSize: 10.5 },
  legendCell: { width: 11, height: 11, borderRadius: 2.5, backgroundColor: '#202329' },
  chartCard: { marginTop: 12, padding: 14 },
  cardHeader: { minWidth: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  selector: { color: foco.colors.muted, fontSize: 12.5 },
  chartArea: { height: 172, flexDirection: 'row', marginTop: 10 },
  axisLabels: { width: 38, justifyContent: 'space-between', paddingBottom: 20 },
  axisText: { color: foco.colors.muted, fontSize: 9.5, fontVariant: ['tabular-nums'] },
  barsArea: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: foco.colors.border },
  barSlot: { flex: 1, minWidth: 0, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 20, maxWidth: '70%', maxHeight: 112, borderRadius: 3, backgroundColor: '#E7E7E8' },
  dayName: { color: foco.colors.muted, fontSize: 10.5, marginTop: 7, marginBottom: -18 },
  distributionCard: { marginTop: 12, padding: 14 },
  distributionBody: { minWidth: 0, flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 14 },
  donutValue: { color: foco.colors.text, fontSize: 16, fontWeight: '600', fontVariant: ['tabular-nums'] },
  legendList: { flex: 1, minWidth: 0, gap: 10 },
  legendRow: { minWidth: 0, flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 9, height: 9, borderRadius: 5, marginRight: 7 },
  legendLabel: { color: foco.colors.muted, fontSize: 12.5, flex: 1 },
  legendValue: { flexShrink: 1, color: foco.colors.text, fontSize: 11.5, textAlign: 'right', fontVariant: ['tabular-nums'] },
});
