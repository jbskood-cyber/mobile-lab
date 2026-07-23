import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getActivityHeatmap, getPeriodStats, getProjectDistribution, getRecentSessions, getStreak, getTaskDistribution, type AnalyticsPeriod } from '@/src/core/analytics';
import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration } from '@/src/core/model';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

const periods: Array<{ value: AnalyticsPeriod; label: string }> = [{ value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }];

export function StatsScreen() {
  const router = useRouter();
  const theme = useFocoTheme();
  const { state } = useFocoStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [anchor, setAnchor] = useState(Date.now());
  const stats = useMemo(() => getPeriodStats(state, period, anchor), [anchor, period, state]);
  const streak = useMemo(() => getStreak(state), [state]);
  const projects = useMemo(() => getProjectDistribution(state, period, anchor).slice(0, 5), [anchor, period, state]);
  const tasks = useMemo(() => getTaskDistribution(state, period, anchor).slice(0, 5), [anchor, period, state]);
  const recent = useMemo(() => getRecentSessions(state, 6), [state]);
  const heatmap = useMemo(() => getActivityHeatmap(state, 91), [state]);
  const maxActivity = Math.max(1, ...heatmap.map((point) => point.focusSeconds / 1800 + point.completedTasks));
  const maxSeries = Math.max(1, ...stats.series.map((point) => point.focusSeconds));
  const maxDistribution = Math.max(1, ...projects.map((item) => item.focusSeconds), ...tasks.map((item) => item.focusSeconds));
  const completionRatio = stats.plannedPomodoros === 0 ? 0 : Math.min(1, stats.completedPomodoros / stats.plannedPomodoros);
  const productiveHours = useMemo(() => {
    const values = Array.from({ length: 24 }, () => 0);
    for (const session of state.sessions) if (session.phase === 'focus') values[new Date(session.endedAt).getHours()] = (values[new Date(session.endedAt).getHours()] ?? 0) + session.durationSec;
    return values.map((seconds, hour) => ({ hour, seconds })).sort((a, b) => b.seconds - a.seconds).slice(0, 3);
  }, [state.sessions]);

  return (
    <FocoScreen title="Progreso" subtitle="Datos que ayudan a ajustar tu siguiente día." screenKey="stats" rightIcon="calendar" rightAccessibilityLabel="Volver al periodo actual" onRightPress={() => setAnchor(Date.now())}>
      <View style={[styles.periods, { backgroundColor: theme.colors.panelSoft, borderColor: theme.colors.borderSoft }]}>{periods.map((item) => { const active = period === item.value; return <Pressable key={item.value} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => { setPeriod(item.value); hapticSelection(); }} style={({ pressed }) => [styles.period, active && { backgroundColor: theme.colors.inverse }, pressed && pressedStyle]}><Text style={[styles.periodText, { color: active ? theme.colors.inverseText : theme.colors.muted }]}>{item.label}</Text></Pressable>; })}</View>
      <View style={styles.anchorRow}><Pressable accessibilityLabel="Periodo anterior" onPress={() => setAnchor((value) => shiftAnchor(value, period, -1))} style={({ pressed }) => [styles.anchorButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={17} color={theme.colors.muted} /></Pressable><Text style={[styles.anchorLabel, { color: theme.colors.text }]}>{periodLabel(period, anchor)}</Text><Pressable accessibilityLabel="Periodo siguiente" onPress={() => setAnchor((value) => shiftAnchor(value, period, 1))} style={({ pressed }) => [styles.anchorButton, pressed && pressedStyle]}><FocoIcon name="chevron-right" size={17} color={theme.colors.muted} /></Pressable></View>

      <View style={[styles.metrics, { borderColor: theme.colors.borderSoft }]}><Metric icon="clock" value={formatDuration(stats.totalFocusSec, true)} label="Enfoque" /><Metric icon="target" value={String(stats.completedPomodoros)} label="Pomodoros" /><Metric icon="check" value={String(stats.completedTasks)} label="Tareas" /><Metric icon="flame" value={String(streak)} label="Racha" /></View>

      {stats.totalFocusSec === 0 && stats.completedTasks === 0 ? <Pressable accessibilityRole="button" accessibilityLabel="Iniciar una sesión" onPress={() => router.push('/(tabs)/focus')} style={({ pressed }) => [styles.emptyHero, { backgroundColor: theme.colors.inverse }, pressed && pressedStyle]}><FocoIcon name="play" size={20} color={theme.colors.inverseText} /><View style={styles.emptyHeroCopy}><Text style={[styles.emptyHeroTitle, { color: theme.colors.inverseText }]}>Periodo sin actividad</Text><Text style={[styles.emptyHeroText, { color: theme.colors.inverseText }]}>Un bloque pequeño es suficiente para empezar.</Text></View><FocoIcon name="chevron-right" size={16} color={theme.colors.inverseText} /></Pressable> : null}

      <SectionTitle title="Tendencia" detail={stats.changePercent === 0 ? 'Sin cambio' : `${stats.changePercent > 0 ? '+' : ''}${Math.round(stats.changePercent)}%`} />
      <View style={[styles.chart, { borderColor: theme.colors.borderSoft }]}>{stats.series.map((point, index) => <View key={point.start} style={styles.barColumn}><View style={styles.barSpace}><View style={[styles.bar, { height: `${Math.max(4, point.focusSeconds / maxSeries * 100)}%`, backgroundColor: theme.colors.accent }]} /></View><Text style={[styles.barLabel, { color: theme.colors.subtle }]}>{seriesLabel(period, point.start, index)}</Text></View>)}</View>
      <View style={styles.trendFooter}><Text style={[styles.smallLabel, { color: theme.colors.muted }]}>Promedio por sesión</Text><Text style={[styles.smallValue, { color: theme.colors.text }]}>{formatDuration(stats.averageSessionSec, true)}</Text></View>

      <SectionTitle title="Plan frente a ejecución" detail={`${Math.round(completionRatio * 100)}%`} />
      <View style={[styles.plan, { borderColor: theme.colors.borderSoft }]}><View style={styles.planNumbers}><PlanValue value={stats.completedPomodoros} label="Completados" /><PlanValue value={stats.plannedPomodoros} label="Planificados" align="right" /></View><View style={[styles.track, { backgroundColor: theme.colors.panelStrong }]}><View style={[styles.fill, { width: `${Math.round(completionRatio * 100)}%`, backgroundColor: theme.colors.accent }]} /></View><Text style={[styles.goalCopy, { color: theme.colors.muted }]}>Objetivo de tiempo alcanzado: {Math.round(stats.goalRate * 100)}%</Text></View>

      <SectionTitle title="Por proyecto" detail={String(projects.length)} />
      <Distribution items={projects.map((item) => ({ id: item.projectId, label: item.projectName, value: item.focusSeconds }))} max={maxDistribution} empty="Las sesiones ligadas a proyectos aparecerán aquí." />
      <SectionTitle title="Por tarea" detail={String(tasks.length)} />
      <Distribution items={tasks.map((item) => ({ id: item.taskId, label: item.taskTitle, value: item.focusSeconds }))} max={maxDistribution} empty="Selecciona una tarea antes de iniciar el temporizador." />

      <SectionTitle title="Horas más productivas" />
      <View style={[styles.productive, { borderColor: theme.colors.borderSoft }]}>{productiveHours.map((item, index) => <View key={item.hour} style={styles.productiveItem}><Text style={[styles.productiveRank, { color: theme.colors.accent }]}>#{index + 1}</Text><Text style={[styles.productiveHour, { color: theme.colors.text }]}>{String(item.hour).padStart(2, '0')}:00</Text><Text style={[styles.productiveTime, { color: theme.colors.muted }]}>{formatDuration(item.seconds, true)}</Text></View>)}</View>

      <SectionTitle title="Actividad de 90 días" />
      <View style={[styles.heatmapSection, { borderColor: theme.colors.borderSoft }]}><View style={styles.heatmapLabels}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label) => <Text key={label} style={[styles.dayLabel, { color: theme.colors.subtle }]}>{label}</Text>)}</View><View style={styles.heatmap}>{heatmap.map((point) => { const value = point.focusSeconds / 1800 + point.completedTasks; const level = value === 0 ? 0 : Math.min(4, Math.ceil(value / maxActivity * 4)); const palette = [theme.colors.panelStrong, theme.colors.accentSoft, theme.colors.muted, theme.colors.accent, theme.colors.text]; return <View key={point.start} accessibilityLabel={`${new Date(point.start).toLocaleDateString('es-MX')}: ${formatDuration(point.focusSeconds, true)}, ${point.completedTasks} tareas`} style={[styles.cell, { backgroundColor: palette[level] }]} />; })}</View></View>

      <SectionTitle title="Sesiones recientes" detail={String(recent.length)} />
      {recent.length === 0 ? <Text style={[styles.emptyText, { color: theme.colors.muted }]}>Las sesiones aparecerán aquí.</Text> : recent.map((session) => <View key={session.id} style={[styles.session, { borderBottomColor: theme.colors.borderSoft }]}><View style={styles.sessionCopy}><Text style={[styles.sessionTitle, { color: theme.colors.text }]} numberOfLines={1}>{session.taskTitle ?? session.projectName}</Text><Text style={[styles.sessionMeta, { color: theme.colors.muted }]}>{new Date(session.endedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {session.projectName}</Text></View><Text style={[styles.sessionTime, { color: theme.colors.text }]}>{formatDuration(session.durationSec, true)}</Text></View>)}
    </FocoScreen>
  );
}

function Metric({ icon, value, label }: { icon: IconName; value: string; label: string }) { const theme = useFocoTheme(); return <View style={styles.metric}><FocoIcon name={icon} size={17} color={theme.colors.muted} /><Text style={[styles.metricValue, { color: theme.colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={[styles.metricLabel, { color: theme.colors.muted }]}>{label}</Text></View>; }
function PlanValue({ value, label, align = 'left' }: { value: number; label: string; align?: 'left' | 'right' }) { const theme = useFocoTheme(); return <View style={{ alignItems: align === 'right' ? 'flex-end' : 'flex-start' }}><Text style={[styles.planValue, { color: theme.colors.text }]}>{value}</Text><Text style={[styles.planLabel, { color: theme.colors.muted }]}>{label}</Text></View>; }
function Distribution({ items, max, empty }: { items: Array<{ id: string; label: string; value: number }>; max: number; empty: string }) { const theme = useFocoTheme(); return items.length === 0 ? <Text style={[styles.emptyText, { color: theme.colors.muted }]}>{empty}</Text> : <View style={[styles.distribution, { borderColor: theme.colors.borderSoft }]}>{items.map((item) => <View key={item.id} style={styles.distributionRow}><View style={styles.distributionTop}><Text style={[styles.distributionLabel, { color: theme.colors.text }]} numberOfLines={1}>{item.label}</Text><Text style={[styles.distributionTime, { color: theme.colors.muted }]}>{formatDuration(item.value, true)}</Text></View><View style={[styles.distributionTrack, { backgroundColor: theme.colors.panelStrong }]}><View style={[styles.distributionFill, { width: `${Math.max(3, item.value / max * 100)}%`, backgroundColor: theme.colors.accent }]} /></View></View>)}</View>; }

function shiftAnchor(anchor: number, period: AnalyticsPeriod, direction: number) { const date = new Date(anchor); if (period === 'day') date.setDate(date.getDate() + direction); else if (period === 'week') date.setDate(date.getDate() + direction * 7); else date.setMonth(date.getMonth() + direction); return date.getTime(); }
function periodLabel(period: AnalyticsPeriod, anchor: number) { const date = new Date(anchor); if (period === 'day') return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' }); if (period === 'week') return `Semana del ${date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`; return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }).replace(/^./, (value) => value.toUpperCase()); }
function seriesLabel(period: AnalyticsPeriod, timestamp: number, index: number) { if (period === 'day') return index % 4 === 0 ? `${index}h` : ''; if (period === 'week') return ['L', 'M', 'X', 'J', 'V', 'S', 'D'][index] ?? ''; return new Date(timestamp).getDate() % 5 === 1 ? String(new Date(timestamp).getDate()) : ''; }

const styles = StyleSheet.create({
  periods: { minHeight: 42, marginTop: 9, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', padding: 3 },
  period: { flex: 1, minHeight: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  periodText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 },
  anchorRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  anchorButton: { width: 44, height: 40, alignItems: 'center', justifyContent: 'center' },
  anchorLabel: { minWidth: 150, textAlign: 'center', fontFamily: 'Manrope_500Medium', fontSize: 11.5, lineHeight: 15 },
  metrics: { flexDirection: 'row', paddingVertical: 11, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  metric: { flex: 1, minWidth: 0, gap: 2 },
  metricValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, lineHeight: 20, fontVariant: ['tabular-nums'] },
  metricLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9, lineHeight: 12 },
  emptyHero: { minHeight: 60, marginTop: 9, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13 },
  emptyHeroCopy: { flex: 1 },
  emptyHeroTitle: { fontFamily: 'Manrope_700Bold', fontSize: 12.5, lineHeight: 16 },
  emptyHeroText: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2, opacity: 0.72 },
  chart: { height: 120, flexDirection: 'row', alignItems: 'flex-end', gap: 3, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  barColumn: { flex: 1, height: '100%', alignItems: 'center' },
  barSpace: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  bar: { width: '68%', minHeight: 3, alignSelf: 'center', borderTopLeftRadius: 3, borderTopRightRadius: 3 },
  barLabel: { height: 17, fontFamily: 'Manrope_400Regular', fontSize: 8.5, lineHeight: 12, paddingTop: 3 },
  trendFooter: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  smallLabel: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14 },
  smallValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14, fontVariant: ['tabular-nums'] },
  plan: { paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  planNumbers: { flexDirection: 'row', justifyContent: 'space-between' },
  planValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 17, lineHeight: 21, fontVariant: ['tabular-nums'] },
  planLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 12, marginTop: 1 },
  track: { height: 4, borderRadius: 2, marginTop: 9, overflow: 'hidden' },
  fill: { height: 4, borderRadius: 2 },
  goalCopy: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 6 },
  distribution: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 5 },
  distributionRow: { minHeight: 43, justifyContent: 'center' },
  distributionTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  distributionLabel: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 11.5, lineHeight: 15 },
  distributionTime: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, lineHeight: 14, fontVariant: ['tabular-nums'] },
  distributionTrack: { height: 3, borderRadius: 2, marginTop: 5, overflow: 'hidden' },
  distributionFill: { height: 3, borderRadius: 2 },
  productive: { minHeight: 62, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  productiveItem: { flex: 1, justifyContent: 'center' },
  productiveRank: { fontFamily: 'Manrope_700Bold', fontSize: 9, lineHeight: 12 },
  productiveHour: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 17, fontVariant: ['tabular-nums'] },
  productiveTime: { fontFamily: 'Manrope_400Regular', fontSize: 9, lineHeight: 12 },
  heatmapSection: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  heatmapLabels: { position: 'absolute', left: 0, top: 10, gap: 3 },
  dayLabel: { width: 13, height: 10, fontFamily: 'Manrope_400Regular', fontSize: 7.5, lineHeight: 10 },
  heatmap: { marginLeft: 18, height: 91, flexDirection: 'column', flexWrap: 'wrap', alignContent: 'space-between', gap: 3 },
  cell: { width: 9, height: 9, borderRadius: 2 },
  session: { minHeight: 51, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  sessionCopy: { flex: 1, minWidth: 0 },
  sessionTitle: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, lineHeight: 15 },
  sessionMeta: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  sessionTime: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14, fontVariant: ['tabular-nums'] },
  emptyText: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 15, paddingVertical: 16 },
});
