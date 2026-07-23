import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getWeekBounds, getWeekStats, type FocusSession, type TaskPriority } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

type Tab = 'Resumen' | 'Pomodoro' | 'Tareas';
type Distribution = { label: string; seconds: number; color: string };

const DAY_MS = 24 * 60 * 60 * 1000;
const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const monthNames = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function formatWeekLabel(start: number, end: number) {
  const first = new Date(start);
  const last = new Date(end - 1);
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} – ${last.getDate()} ${monthNames[first.getMonth()]} ${last.getFullYear()}`;
  }
  return `${first.getDate()} ${monthNames[first.getMonth()]} – ${last.getDate()} ${monthNames[last.getMonth()]} ${last.getFullYear()}`;
}

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
  const sessionAverage = selectedSessions.length === 0 ? 0 : selectedSessions.reduce((sum, session) => sum + session.durationSec, 0) / selectedSessions.length;
  const dailyGoal = 2 * 60 * 60;
  const goalRatio = Math.min(1, selectedSessions.reduce((sum, session) => sum + session.durationSec, 0) / (7 * dailyGoal));

  const summary = tab === 'Tareas'
    ? [
      { icon: 'check' as const, value: String(week.completedTasks), label: 'Completadas' },
      { icon: 'list' as const, value: String(openTasks), label: 'Pendientes' },
      { icon: 'target' as const, value: `${Math.round(taskCompletion * 100)}%`, label: 'Progreso total' },
    ]
    : tab === 'Pomodoro'
      ? [
        { icon: 'clock' as const, value: formatDuration(selectedSessions.reduce((sum, session) => sum + session.durationSec, 0), true), label: 'Tiempo Pomodoro' },
        { icon: 'target' as const, value: String(selectedSessions.length), label: 'Ciclos' },
        { icon: 'check' as const, value: formatDuration(sessionAverage, true), label: 'Promedio' },
      ]
      : [
        { icon: 'clock' as const, value: formatDuration(week.totalSeconds, true), label: 'Tiempo total' },
        { icon: 'target' as const, value: formatDuration(week.totalSeconds / 7, true), label: 'Promedio diario' },
        { icon: 'check' as const, value: `${Math.round(goalRatio * 100)}%`, label: 'Objetivo semanal' },
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
    <FocoScreen title="Estadísticas" rightIcon="calendar">
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
        <Text style={styles.weekText}>{formatWeekLabel(week.start, week.end)}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Semana siguiente" onPress={() => { setWeekOffset((value) => value + 1); hapticSelection(); }} style={({ pressed }) => [styles.arrowButton, pressed && pressedStyle]}>
          <FocoIcon name="chevron-right" size={20} color={foco.colors.text} />
        </Pressable>
      </Surface>

      <View style={styles.summaryRow}>
        {summary.map((item) => <Summary key={item.label} icon={item.icon} value={item.value} label={item.label} />)}
      </View>

      {!hasWeekData ? (
        <Surface style={styles.emptyState}>
          <FocoIcon name={tab === 'Tareas' ? 'check' : 'clock'} size={30} color={foco.colors.text} />
          <Text style={styles.emptyTitle}>Semana sin actividad</Text>
          <Text style={styles.emptyCopy}>{tab === 'Tareas' ? 'Completa tareas para construir tu historial.' : 'Las sesiones que registres en Enfoque aparecerán aquí.'}</Text>
        </Surface>
      ) : null}

      <Surface style={styles.heatmapCard}>
        <Text style={styles.cardTitle}>Mapa de actividad</Text>
        <View style={styles.months}><Text style={styles.month}>Hace 18 sem</Text><Text style={styles.month}>Hace 9 sem</Text><Text style={styles.month}>Ahora</Text></View>
        <View style={styles.heatmapBody}>
          <View style={styles.dayLetters}>{['L','M','X','J','V','S','D'].map((day) => <Text key={day} style={styles.dayLetter}>{day}</Text>)}</View>
          <View style={styles.grid}>
            {heatmap.map((level, index) => <View key={`${index}-${level}`} accessibilityLabel={`Actividad nivel ${level} de 4`} style={[styles.cell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />)}
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
              <View key={days[index]} style={styles.barSlot}>
                <View accessibilityLabel={`${days[index]}: ${tab === 'Tareas' ? `${value} tareas` : formatDuration(value, true)}`} style={[styles.bar, { height: value === 0 ? 2 : Math.max(8, (value / maximum) * 122) }]} />
                <Text style={styles.dayName}>{days[index]}</Text>
              </View>
            ))}
          </View>
        </View>
      </Surface>

      <Surface style={styles.distributionCard}>
        <View style={styles.cardHeader}><Text style={styles.cardTitle}>{tab === 'Tareas' ? 'Distribución por prioridad' : 'Distribución por enfoque'}</Text><Text style={styles.selector}>{tab === 'Tareas' ? 'Por tareas' : 'Por tiempo'}</Text></View>
        <View style={styles.distributionBody}>
          <ProgressRing size={112} strokeWidth={15} progress={primaryShare} color="#E7E7E8" trackColor="#34373E">
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
  return <Surface style={styles.summaryCard}><FocoIcon name={icon} size={31} color={foco.colors.text} /><Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></Surface>;
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return <View style={styles.legendRow}><View style={[styles.legendDot,{ backgroundColor: color }]} /><Text style={styles.legendLabel}>{label}</Text><Text style={styles.legendValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  tabs: { marginTop: 18, height: 52, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: foco.colors.borderSoft },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  tabText: { color: foco.colors.muted, fontSize: 16 },
  tabTextSelected: { color: foco.colors.text, fontWeight: '600' },
  tabUnderline: { position: 'absolute', bottom: -1, width: '85%', height: 2, borderRadius: 2, backgroundColor: foco.colors.text },
  weekPicker: { minHeight: 54, marginTop: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  arrowButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  weekText: { color: foco.colors.text, fontSize: 16, fontWeight: '500', fontVariant: ['tabular-nums'] },
  summaryRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  summaryCard: { flex: 1, minHeight: 132, padding: 15, justifyContent: 'space-between' },
  summaryValue: { color: foco.colors.text, fontSize: 19, fontWeight: '600', marginTop: 12, fontVariant: ['tabular-nums'] },
  summaryLabel: { color: foco.colors.muted, fontSize: 12, marginTop: 6 },
  emptyState: { marginTop: 14, minHeight: 142, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { color: foco.colors.text, fontSize: 17, fontWeight: '600', marginTop: 12 },
  emptyCopy: { color: foco.colors.muted, fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6 },
  heatmapCard: { marginTop: 14, padding: 16 },
  cardTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '600' },
  months: { flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 30, marginTop: 9 },
  month: { color: foco.colors.muted, fontSize: 11.5 },
  heatmapBody: { flexDirection: 'row', marginTop: 7 },
  dayLetters: { width: 24, gap: 5 },
  dayLetter: { height: 13, color: foco.colors.muted, fontSize: 10, lineHeight: 13 },
  grid: { flex: 1, flexDirection: 'column', flexWrap: 'wrap', height: 121, gap: 4, alignContent: 'space-between' },
  cell: { width: 13, height: 13, borderRadius: 3, backgroundColor: '#202329' },
  cell1: { backgroundColor: '#34373D' },
  cell2: { backgroundColor: '#666A71' },
  cell3: { backgroundColor: '#B5B7BB' },
  cell4: { backgroundColor: '#F1F1F2' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10 },
  legendText: { color: foco.colors.muted, fontSize: 11 },
  legendCell: { width: 12, height: 12, borderRadius: 3, backgroundColor: '#202329' },
  chartCard: { marginTop: 14, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  selector: { color: foco.colors.muted, fontSize: 13.5 },
  chartArea: { height: 184, flexDirection: 'row', marginTop: 12 },
  axisLabels: { width: 42, justifyContent: 'space-between', paddingBottom: 22 },
  axisText: { color: foco.colors.muted, fontSize: 10 },
  barsArea: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: foco.colors.border },
  barSlot: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 24, maxHeight: 122, borderRadius: 3, backgroundColor: '#E7E7E8' },
  dayName: { color: foco.colors.muted, fontSize: 11.5, marginTop: 8, marginBottom: -20 },
  distributionCard: { marginTop: 14, padding: 16 },
  distributionBody: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 16 },
  donutValue: { color: foco.colors.text, fontSize: 17, fontWeight: '600' },
  legendList: { flex: 1, gap: 12 },
  legendRow: { flexDirection: 'row', alignItems: 'center' },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendLabel: { color: foco.colors.muted, fontSize: 13.5, flex: 1 },
  legendValue: { color: foco.colors.text, fontSize: 12.5, fontVariant: ['tabular-nums'] },
});
