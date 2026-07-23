import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  getActivityHeatmap,
  getPeriodStats,
  getProjectDistribution,
  getRecentSessions,
  getStreak,
  getTaskDistribution,
  type AnalyticsPeriod,
} from '@/src/core/analytics';
import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { foco } from '@/src/ui/focoTheme';
import { pressedStyle } from '@/src/ui/premium';
import { DistributionList } from './DistributionList';
import { PeriodSelector } from './PeriodSelector';
import { SessionTimeline } from './SessionTimeline';
import { TrendChart } from './TrendChart';

export function StatsScreen() {
  const router = useRouter();
  const { state } = useFocoStore();
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [anchor, setAnchor] = useState(Date.now());
  const stats = useMemo(() => getPeriodStats(state, period, anchor), [anchor, period, state]);
  const streak = useMemo(() => getStreak(state), [state]);
  const projects = useMemo(() => getProjectDistribution(state, period, anchor).map((item) => ({ id: item.projectId, label: item.projectName, focusSeconds: item.focusSeconds })), [anchor, period, state]);
  const tasks = useMemo(() => getTaskDistribution(state, period, anchor).map((item) => ({ id: item.taskId, label: item.taskTitle, focusSeconds: item.focusSeconds })), [anchor, period, state]);
  const recent = useMemo(() => getRecentSessions(state, 8), [state]);
  const heatmap = useMemo(() => getActivityHeatmap(state, 91), [state]);
  const maxActivity = Math.max(1, ...heatmap.map((point) => point.focusSeconds / 1800 + point.completedTasks));
  const changeLabel = stats.changePercent === 0 ? 'Sin cambio' : `${stats.changePercent > 0 ? '+' : ''}${Math.round(stats.changePercent)}%`;
  const completionRatio = stats.plannedPomodoros === 0 ? 0 : Math.min(1, stats.completedPomodoros / stats.plannedPomodoros);

  return (
    <FocoScreen title="Progreso" subtitle="Lo que hiciste, no lo que planeabas hacer." screenKey="stats" rightIcon="calendar" rightAccessibilityLabel="Volver al periodo actual" onRightPress={() => setAnchor(Date.now())}>
      <PeriodSelector period={period} anchor={anchor} onPeriod={setPeriod} onAnchor={setAnchor} />

      <View style={styles.metrics}>
        <Metric icon="clock" value={formatDuration(stats.totalFocusSec, true)} label="Enfoque" />
        <Metric icon="target" value={String(stats.completedPomodoros)} label="Pomodoros" />
        <Metric icon="check" value={String(stats.completedTasks)} label="Tareas" />
        <Metric icon="flame" value={String(streak)} label="Racha" />
      </View>

      {stats.totalFocusSec === 0 && stats.completedTasks === 0 ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Iniciar una sesión" onPress={() => router.push('/(tabs)/focus')} style={({ pressed }) => [styles.emptyHero, pressed && pressedStyle]}>
          <FocoIcon name="play" size={22} color={foco.colors.bg} />
          <View style={styles.emptyCopy}><Text style={styles.emptyTitle}>Periodo sin actividad</Text><Text style={styles.emptyText}>Inicia una sesión o completa una tarea.</Text></View>
          <FocoIcon name="chevron-right" size={17} color={foco.colors.bg} />
        </Pressable>
      ) : null}

      <SectionTitle title="Tendencia de enfoque" detail={changeLabel} />
      <View style={styles.flatSection}>
        <TrendChart series={stats.series} period={period} />
        <View style={styles.trendFooter}>
          <Text style={styles.trendLabel}>Promedio por sesión</Text>
          <Text style={styles.trendValue}>{formatDuration(stats.averageSessionSec, true)}</Text>
        </View>
      </View>

      <SectionTitle title="Plan frente a ejecución" detail={`${Math.round(completionRatio * 100)}%`} />
      <View style={styles.planSection}>
        <View style={styles.planNumbers}>
          <View><Text style={styles.planValue}>{stats.completedPomodoros}</Text><Text style={styles.planLabel}>Completados</Text></View>
          <View style={styles.planRight}><Text style={styles.planValue}>{stats.plannedPomodoros}</Text><Text style={styles.planLabel}>Planificados</Text></View>
        </View>
        <View style={styles.planTrack}><View style={[styles.planFill, { width: `${Math.round(completionRatio * 100)}%` }]} /></View>
        <Text style={styles.goalCopy}>Objetivo de tiempo alcanzado: {Math.round(stats.goalRate * 100)}%</Text>
      </View>

      <SectionTitle title="Por proyecto" detail={`${projects.length}`} />
      <DistributionList items={projects} emptyCopy="Las sesiones ligadas a proyectos aparecerán aquí." />

      <SectionTitle title="Por tarea" detail={`${tasks.length}`} />
      <DistributionList items={tasks} emptyCopy="Selecciona una tarea antes de iniciar el temporizador para ver esta distribución." />

      <SectionTitle title="Actividad de 90 días" />
      <View style={styles.heatmapSection}>
        <View style={styles.heatmapLabels}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((label) => <Text key={label} style={styles.dayLabel}>{label}</Text>)}</View>
        <View style={styles.heatmap}>
          {heatmap.map((point) => {
            const value = point.focusSeconds / 1800 + point.completedTasks;
            const level = value === 0 ? 0 : value / maxActivity <= 0.25 ? 1 : value / maxActivity <= 0.5 ? 2 : value / maxActivity <= 0.75 ? 3 : 4;
            return <View key={point.start} accessibilityLabel={`${new Date(point.start).toLocaleDateString('es-MX')}: ${formatDuration(point.focusSeconds, true)}, ${point.completedTasks} tareas`} style={[styles.cell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />;
          })}
        </View>
        <View style={styles.legend}><Text style={styles.legendText}>Menos</Text>{[0, 1, 2, 3, 4].map((level) => <View key={level} style={[styles.legendCell, level === 1 && styles.cell1, level === 2 && styles.cell2, level === 3 && styles.cell3, level === 4 && styles.cell4]} />)}<Text style={styles.legendText}>Más</Text></View>
      </View>

      <SectionTitle title="Sesiones recientes" detail={`${recent.length}`} />
      <SessionTimeline sessions={recent} />
    </FocoScreen>
  );
}

function Metric({ icon, value, label }: { icon: 'clock' | 'target' | 'check' | 'flame'; value: string; label: string }) {
  return <View style={styles.metric}><FocoIcon name={icon} size={19} color={foco.colors.muted} /><Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  metrics: { flexDirection: 'row', paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft },
  metric: { flex: 1, minWidth: 0, gap: 4 },
  metricValue: { color: foco.colors.text, fontSize: 18, fontWeight: '650', fontVariant: ['tabular-nums'] },
  metricLabel: { color: foco.colors.muted, fontSize: 10.8 },
  emptyHero: { minHeight: 70, marginTop: 13, borderRadius: 15, backgroundColor: foco.colors.text, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 15 },
  emptyCopy: { flex: 1 },
  emptyTitle: { color: foco.colors.bg, fontSize: 14.5, fontWeight: '700' },
  emptyText: { color: '#4B4D52', fontSize: 11.5, marginTop: 3 },
  flatSection: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft },
  trendFooter: { minHeight: 43, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  trendLabel: { color: foco.colors.muted, fontSize: 12 },
  trendValue: { color: foco.colors.text, fontSize: 12.5, fontWeight: '600', fontVariant: ['tabular-nums'] },
  planSection: { paddingVertical: 13, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft },
  planNumbers: { flexDirection: 'row', justifyContent: 'space-between' },
  planRight: { alignItems: 'flex-end' },
  planValue: { color: foco.colors.text, fontSize: 20, fontWeight: '650', fontVariant: ['tabular-nums'] },
  planLabel: { color: foco.colors.muted, fontSize: 11.5, marginTop: 3 },
  planTrack: { height: 5, borderRadius: 3, backgroundColor: '#282B31', marginTop: 12, overflow: 'hidden' },
  planFill: { height: 5, borderRadius: 3, backgroundColor: foco.colors.text },
  goalCopy: { color: foco.colors.muted, fontSize: 11.5, marginTop: 8 },
  heatmapSection: { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft, paddingVertical: 13 },
  heatmapLabels: { position: 'absolute', left: 0, top: 13, gap: 4 },
  dayLabel: { width: 14, height: 12, color: foco.colors.muted, fontSize: 8.5, lineHeight: 12 },
  heatmap: { marginLeft: 20, height: 108, flexDirection: 'column', flexWrap: 'wrap', alignContent: 'space-between', gap: 3 },
  cell: { width: 11, height: 11, borderRadius: 2.5, backgroundColor: '#202329' },
  cell1: { backgroundColor: '#34373D' },
  cell2: { backgroundColor: '#666A71' },
  cell3: { backgroundColor: '#B5B7BB' },
  cell4: { backgroundColor: '#F1F1F2' },
  legend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5, marginTop: 9 },
  legendText: { color: foco.colors.muted, fontSize: 10 },
  legendCell: { width: 11, height: 11, borderRadius: 2.5, backgroundColor: '#202329' },
});
