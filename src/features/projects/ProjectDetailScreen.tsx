import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getProjectMetrics, type Task } from '@/src/core/model';
import { TaskEditorSheet } from '@/src/features/tasks/TaskEditorSheet';
import { TaskRow } from '@/src/features/tasks/TaskRow';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { hapticImpact, hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';
import { ProjectEditorSheet } from './ProjectEditorSheet';

export function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useFocoTheme();
  const { state, completeTask, reopenTask, deleteTask, toggleProjectArchived } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const project = state.projects.find((item) => item.id === id);
  const tasks = useMemo(() => state.tasks.filter((task) => task.projectId === id).sort((a, b) => Number(a.completed) - Number(b.completed) || (a.plannedStartAt ?? a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.plannedStartAt ?? b.dueAt ?? Number.MAX_SAFE_INTEGER)), [id, state.tasks]);
  const openTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const sessions = useMemo(() => state.sessions.filter((session) => session.projectId === id && session.phase === 'focus').sort((a, b) => b.endedAt - a.endedAt), [id, state.sessions]);
  const projectMap = useMemo(() => new Map(state.projects.map((item) => [item.id, item.name])), [state.projects]);
  const pomodoros = useMemo(() => { const values = new Map<string, number>(); for (const session of sessions) if (session.taskId && session.mode === 'pomodoro' && session.completed) values.set(session.taskId, (values.get(session.taskId) ?? 0) + 1); return values; }, [sessions]);
  const metrics = project ? getProjectMetrics(state, project.id) : null;

  if (!project || !metrics) return <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]}><View style={styles.missing}><Text style={[styles.missingTitle, { color: theme.colors.text }]}>Este proyecto ya no existe</Text><Pressable onPress={() => router.back()} style={[styles.primary, { backgroundColor: theme.colors.inverse }]}><Text style={[styles.primaryText, { color: theme.colors.inverseText }]}>Volver</Text></Pressable></View></SafeAreaView>;

  const toggleTask = (task: Task) => {
    if (task.completed) { reopenTask(task.id); hapticSuccess(); return; }
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo(`${task.title} completada`, () => { reopenTask(task.id); if (result.generatedTask) deleteTask(result.generatedTask.id); });
  };
  const archive = () => { toggleProjectArchived(project.id); hapticSelection(); showUndo(project.archived ? 'Proyecto restaurado' : 'Proyecto archivado', () => toggleProjectArchived(project.id)); if (!project.archived) router.back(); };

  return (
    <>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={['top', 'left', 'right']}>
        <View style={styles.header}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={22} color={theme.colors.text} /></Pressable><Text style={[styles.headerTitle, { color: theme.colors.text }]}>Proyecto</Text><Pressable accessibilityLabel="Editar proyecto" onPress={() => setProjectEditorOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="edit" size={20} color={theme.colors.text} /></Pressable></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.projectHeader}><View style={[styles.projectIcon, { backgroundColor: theme.colors.panelStrong }]}><FocoIcon name={project.icon as IconName} size={24} color={theme.colors.text} /></View><View style={styles.projectCopy}><Text style={[styles.title, { color: theme.colors.text }]}>{project.name}</Text>{project.description ? <Text style={[styles.description, { color: theme.colors.muted }]}>{project.description}</Text> : null}</View></View>
          <View style={[styles.metrics, { borderColor: theme.colors.borderSoft }]}><Metric value={`${Math.round(metrics.progress * 100)}%`} label="Progreso" /><Metric value={`${metrics.completedPomodoros}/${metrics.plannedPomodoros}`} label="Pomodoros" /><Metric value={formatDuration(metrics.focusSeconds, true)} label="Enfoque" /></View>
          <View style={styles.actions}><Action icon="plus" label="Tarea" onPress={() => setTaskEditorOpen(true)} primary /><Action icon="play" label="Enfocar" onPress={() => { hapticImpact(); router.push({ pathname: '/(tabs)/focus', params: { projectId: project.id } }); }} /><Action icon="archive" label={project.archived ? 'Restaurar' : 'Archivar'} onPress={archive} /></View>

          <SectionHeader title="Pendientes" detail={String(openTasks.length)} />
          <View style={[styles.list, { borderTopColor: theme.colors.borderSoft }]}>{openTasks.length > 0 ? openTasks.map((task) => <TaskRow key={task.id} task={task} projectName={projectMap.get(task.projectId) ?? project.name} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} onToggle={() => toggleTask(task)} />) : <Empty text="No quedan tareas pendientes." />}</View>

          <Pressable accessibilityRole="button" onPress={() => setShowCompleted((value) => !value)} style={({ pressed }) => [styles.completedHeader, { borderBottomColor: theme.colors.borderSoft }, pressed && pressedStyle]}><View><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Completadas</Text><Text style={[styles.sectionDetail, { color: theme.colors.muted }]}>{completedTasks.length} tareas</Text></View><FocoIcon name={showCompleted ? 'chevron-down' : 'chevron-right'} size={17} color={theme.colors.muted} /></Pressable>
          {showCompleted ? <View style={[styles.list, { borderTopColor: theme.colors.borderSoft }]}>{completedTasks.map((task) => <TaskRow key={task.id} task={task} projectName={project.name} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} onToggle={() => toggleTask(task)} />)}</View> : null}

          <SectionHeader title="Sesiones recientes" detail={String(sessions.length)} />
          <View style={[styles.sessionList, { borderTopColor: theme.colors.borderSoft }]}>{sessions.length > 0 ? sessions.slice(0, 8).map((session) => { const linkedTask = session.taskId ? state.tasks.find((item) => item.id === session.taskId) : undefined; return <View key={session.id} style={[styles.sessionRow, { borderBottomColor: theme.colors.borderSoft }]}><View style={styles.sessionCopy}><Text style={[styles.sessionTitle, { color: theme.colors.text }]} numberOfLines={1}>{linkedTask?.title ?? project.name}</Text><Text style={[styles.sessionDate, { color: theme.colors.muted }]}>{new Date(session.endedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {session.mode === 'pomodoro' ? `ciclo ${session.cycleNumber}` : 'cronómetro'}</Text></View><Text style={[styles.sessionValue, { color: theme.colors.text }]}>{formatDuration(session.durationSec, true)}</Text></View>; }) : <Empty text="Las sesiones ligadas a este proyecto aparecerán aquí." />}</View>
        </ScrollView>
      </SafeAreaView>
      <TaskEditorSheet visible={taskEditorOpen} defaultProjectId={project.id} onClose={() => setTaskEditorOpen(false)} />
      <ProjectEditorSheet visible={projectEditorOpen} project={project} onClose={() => setProjectEditorOpen(false)} />
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) { const theme = useFocoTheme(); return <View style={styles.metric}><Text style={[styles.metricValue, { color: theme.colors.text }]} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={[styles.metricLabel, { color: theme.colors.muted }]}>{label}</Text></View>; }
function Action({ icon, label, onPress, primary = false }: { icon: 'plus' | 'play' | 'archive'; label: string; onPress: () => void; primary?: boolean }) { const theme = useFocoTheme(); return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, { borderColor: primary ? theme.colors.inverse : theme.colors.border, backgroundColor: primary ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><FocoIcon name={icon} size={18} color={primary ? theme.colors.inverseText : theme.colors.text} /><Text style={[styles.actionText, { color: primary ? theme.colors.inverseText : theme.colors.text }]}>{label}</Text></Pressable>; }
function SectionHeader({ title, detail }: { title: string; detail: string }) { const theme = useFocoTheme(); return <View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.sectionDetail, { color: theme.colors.muted }]}>{detail}</Text></View>; }
function Empty({ text }: { text: string }) { const theme = useFocoTheme(); return <Text style={[styles.empty, { color: theme.colors.muted }]}>{text}</Text>; }

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 }, content: { paddingHorizontal: 14, paddingBottom: 46 },
  projectHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingTop: 7, paddingBottom: 12 }, projectIcon: { width: 44, height: 44, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, projectCopy: { flex: 1, minWidth: 0 }, title: { fontFamily: 'Manrope_700Bold', fontSize: 24, lineHeight: 29, letterSpacing: -0.6 }, description: { fontFamily: 'Manrope_400Regular', fontSize: 11.5, lineHeight: 16, marginTop: 3 },
  metrics: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 11 }, metric: { flex: 1 }, metricValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 16, lineHeight: 20, fontVariant: ['tabular-nums'] }, metricLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9, lineHeight: 12, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6, paddingVertical: 9 }, action: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', gap: 2 }, actionText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, lineHeight: 13 },
  sectionHeader: { minHeight: 37, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sectionTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14.5, lineHeight: 19 }, sectionDetail: { fontFamily: 'Manrope_400Regular', fontSize: 10, lineHeight: 13 }, list: { borderTopWidth: StyleSheet.hairlineWidth },
  completedHeader: { minHeight: 52, marginTop: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth }, sessionList: { borderTopWidth: StyleSheet.hairlineWidth }, sessionRow: { minHeight: 51, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth }, sessionCopy: { flex: 1, minWidth: 0 }, sessionTitle: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 }, sessionDate: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 }, sessionValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15, fontVariant: ['tabular-nums'] }, empty: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 15, paddingVertical: 17, textAlign: 'center' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, missingTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, lineHeight: 23 }, primary: { minHeight: 48, marginTop: 16, borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }, primaryText: { fontFamily: 'Manrope_700Bold', fontSize: 12.5, lineHeight: 16 },
});
