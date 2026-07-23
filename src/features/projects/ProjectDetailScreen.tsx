import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getProjectMetrics, type Task } from '@/src/core/model';
import { TaskEditorSheet } from '@/src/features/tasks/TaskEditorSheet';
import { TaskRow } from '@/src/features/tasks/TaskRow';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { foco } from '@/src/ui/focoTheme';
import { hapticImpact, hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';
import { ProjectEditorSheet } from './ProjectEditorSheet';

export function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, completeTask, reopenTask, deleteTask, toggleProjectArchived } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [taskEditorOpen, setTaskEditorOpen] = useState(false);
  const [projectEditorOpen, setProjectEditorOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const project = state.projects.find((item) => item.id === id);
  const tasks = useMemo(() => state.tasks.filter((task) => task.projectId === id).sort((a, b) => Number(a.completed) - Number(b.completed) || (a.dueAt ?? Number.MAX_SAFE_INTEGER) - (b.dueAt ?? Number.MAX_SAFE_INTEGER)), [id, state.tasks]);
  const openTasks = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);
  const sessions = useMemo(() => state.sessions.filter((session) => session.projectId === id && session.phase === 'focus').sort((a, b) => b.endedAt - a.endedAt), [id, state.sessions]);
  const projectMap = useMemo(() => new Map(state.projects.map((item) => [item.id, item.name])), [state.projects]);
  const pomodoros = useMemo(() => {
    const values = new Map<string, number>();
    for (const session of sessions) if (session.taskId && session.mode === 'pomodoro' && session.completed) values.set(session.taskId, (values.get(session.taskId) ?? 0) + 1);
    return values;
  }, [sessions]);
  const metrics = project ? getProjectMetrics(state, project.id) : null;

  if (!project || !metrics) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>Este proyecto ya no existe</Text>
          <Pressable onPress={() => router.back()} style={styles.primary}><Text style={styles.primaryText}>Volver</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const toggleTask = (task: Task) => {
    if (task.completed) {
      reopenTask(task.id);
      hapticSuccess();
      return;
    }
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo(`${task.title} completada`, () => {
      reopenTask(task.id);
      if (result.generatedTask) deleteTask(result.generatedTask.id);
    });
  };

  const archive = () => {
    toggleProjectArchived(project.id);
    hapticSelection();
    showUndo(project.archived ? 'Proyecto restaurado' : 'Proyecto archivado', () => toggleProjectArchived(project.id));
    if (!project.archived) router.back();
  };

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={23} color={foco.colors.text} /></Pressable>
          <Text style={styles.headerTitle}>Proyecto</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Editar proyecto" onPress={() => setProjectEditorOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="edit" size={22} color={foco.colors.text} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.projectHeader}>
            <View style={styles.projectIcon}><FocoIcon name={project.icon as IconName} size={27} color={foco.colors.text} /></View>
            <View style={styles.projectCopy}>
              <Text style={styles.title}>{project.name}</Text>
              {project.description ? <Text style={styles.description}>{project.description}</Text> : null}
            </View>
          </View>

          <View style={styles.metrics}>
            <Metric value={`${Math.round(metrics.progress * 100)}%`} label="Progreso" />
            <Metric value={`${metrics.completedPomodoros}/${metrics.plannedPomodoros}`} label="Pomodoros" />
            <Metric value={formatDuration(metrics.focusSeconds, true)} label="Enfoque" />
          </View>

          <View style={styles.actions}>
            <Action icon="plus" label="Tarea" onPress={() => setTaskEditorOpen(true)} primary />
            <Action icon="play" label="Enfocar" onPress={() => { hapticImpact(); router.push({ pathname: '/(tabs)/focus', params: { projectId: project.id } }); }} />
            <Action icon="archive" label={project.archived ? 'Restaurar' : 'Archivar'} onPress={archive} />
          </View>

          <SectionHeader title="Pendientes" detail={String(openTasks.length)} />
          <View style={styles.list}>
            {openTasks.length > 0 ? openTasks.map((task) => (
              <TaskRow key={task.id} task={task} projectName={projectMap.get(task.projectId) ?? project.name} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} onToggle={() => toggleTask(task)} />
            )) : <Empty text="No quedan tareas pendientes." />}
          </View>

          <Pressable accessibilityRole="button" onPress={() => setShowCompleted((value) => !value)} style={({ pressed }) => [styles.completedHeader, pressed && pressedStyle]}>
            <View><Text style={styles.sectionTitle}>Completadas</Text><Text style={styles.sectionDetail}>{completedTasks.length} tareas</Text></View>
            <FocoIcon name={showCompleted ? 'chevron-down' : 'chevron-right'} size={18} color={foco.colors.muted} />
          </Pressable>
          {showCompleted ? <View style={styles.list}>{completedTasks.map((task) => <TaskRow key={task.id} task={task} projectName={project.name} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} onToggle={() => toggleTask(task)} />)}</View> : null}

          <SectionHeader title="Sesiones recientes" detail={String(sessions.length)} />
          <View style={styles.sessionList}>
            {sessions.length > 0 ? sessions.slice(0, 8).map((session) => {
              const task = session.taskId ? state.tasks.find((item) => item.id === session.taskId) : undefined;
              return (
                <View key={session.id} style={styles.sessionRow}>
                  <View style={styles.sessionCopy}><Text style={styles.sessionTitle} numberOfLines={1}>{task?.title ?? project.name}</Text><Text style={styles.sessionDate}>{new Date(session.endedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })} · {session.mode === 'pomodoro' ? `ciclo ${session.cycleNumber}` : 'cronómetro'}</Text></View>
                  <Text style={styles.sessionValue}>{formatDuration(session.durationSec, true)}</Text>
                </View>
              );
            }) : <Empty text="Las sesiones ligadas a este proyecto aparecerán aquí." />}
          </View>
        </ScrollView>
      </SafeAreaView>
      <TaskEditorSheet visible={taskEditorOpen} defaultProjectId={project.id} onClose={() => setTaskEditorOpen(false)} />
      <ProjectEditorSheet visible={projectEditorOpen} project={project} onClose={() => setProjectEditorOpen(false)} />
    </>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return <View style={styles.metric}><Text style={styles.metricValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.metricLabel}>{label}</Text></View>;
}
function Action({ icon, label, onPress, primary = false }: { icon: 'plus' | 'play' | 'archive'; label: string; onPress: () => void; primary?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.actionPrimary, pressed && pressedStyle]}><FocoIcon name={icon} size={20} color={primary ? foco.colors.bg : foco.colors.text} /><Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text></Pressable>;
}
function SectionHeader({ title, detail }: { title: string; detail: string }) {
  return <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text><Text style={styles.sectionDetail}>{detail}</Text></View>;
}
function Empty({ text }: { text: string }) { return <Text style={styles.empty}>{text}</Text>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: foco.colors.bg },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '650' },
  content: { paddingHorizontal: 16, paddingBottom: 48 },
  projectHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingTop: 10, paddingBottom: 18 },
  projectIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center' },
  projectCopy: { flex: 1, minWidth: 0 },
  title: { color: foco.colors.text, fontSize: 30, lineHeight: 35, fontWeight: '700', letterSpacing: -0.8 },
  description: { color: foco.colors.muted, fontSize: 13.5, lineHeight: 19, marginTop: 5 },
  metrics: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft, paddingVertical: 15 },
  metric: { flex: 1 },
  metricValue: { color: foco.colors.text, fontSize: 19, fontWeight: '650', fontVariant: ['tabular-nums'] },
  metricLabel: { color: foco.colors.muted, fontSize: 11.5, marginTop: 4 },
  actions: { flexDirection: 'row', gap: 8, paddingVertical: 13 },
  action: { flex: 1, minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center', gap: 3 },
  actionPrimary: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  actionText: { color: foco.colors.text, fontSize: 11.5, fontWeight: '650' },
  actionTextPrimary: { color: foco.colors.bg },
  sectionHeader: { minHeight: 44, marginTop: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: foco.colors.text, fontSize: 17, fontWeight: '650' },
  sectionDetail: { color: foco.colors.muted, fontSize: 12.5 },
  list: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft },
  completedHeader: { minHeight: 58, marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  sessionList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft },
  sessionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  sessionCopy: { flex: 1, minWidth: 0 },
  sessionTitle: { color: foco.colors.text, fontSize: 14.5, fontWeight: '550' },
  sessionDate: { color: foco.colors.muted, fontSize: 11.5, marginTop: 4 },
  sessionValue: { color: foco.colors.text, fontSize: 13.5, fontVariant: ['tabular-nums'] },
  empty: { color: foco.colors.muted, fontSize: 13, lineHeight: 19, paddingVertical: 22, textAlign: 'center' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingTitle: { color: foco.colors.text, fontSize: 20, fontWeight: '650' },
  primary: { minHeight: 48, marginTop: 18, borderRadius: 14, backgroundColor: foco.colors.text, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: foco.colors.bg, fontWeight: '700' },
});
