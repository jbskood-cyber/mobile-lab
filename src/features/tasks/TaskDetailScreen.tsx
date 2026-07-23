import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTaskScheduleLabel } from '@/src/core/agenda';
import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration } from '@/src/core/model';
import { TaskEditorSheet } from './TaskEditorSheet';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { hapticImpact, hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

export function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const theme = useFocoTheme();
  const { state, completeTask, reopenTask, deleteTask, restoreTask, duplicateTask, postponeTask, toggleSubtask } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [editorOpen, setEditorOpen] = useState(false);
  const task = state.tasks.find((item) => item.id === id);
  const project = task ? state.projects.find((item) => item.id === task.projectId) : undefined;
  const sessions = useMemo(() => task ? state.sessions.filter((session) => session.taskId === task.id && session.phase === 'focus').sort((a, b) => b.endedAt - a.endedAt) : [], [state.sessions, task]);
  const focusSeconds = sessions.reduce((sum, session) => sum + session.durationSec, 0);
  const completedPomodoros = sessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;

  if (!task) return <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]}><View style={styles.missing}><Text style={[styles.missingTitle, { color: theme.colors.text }]}>Esta tarea ya no existe</Text><Pressable onPress={() => router.back()} style={[styles.primary, { backgroundColor: theme.colors.inverse }]}><Text style={[styles.primaryText, { color: theme.colors.inverseText }]}>Volver</Text></Pressable></View></SafeAreaView>;

  const toggleComplete = () => {
    if (task.completed) { reopenTask(task.id); hapticSuccess(); return; }
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo('Tarea completada', () => { reopenTask(task.id); if (result.generatedTask) deleteTask(result.generatedTask.id); });
  };
  const remove = () => { const snapshot = task; deleteTask(task.id); hapticWarning(); router.back(); showUndo(`${task.title} eliminada`, () => restoreTask(snapshot)); };

  return (
    <>
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={['top', 'left', 'right']}>
        <View style={styles.header}><Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={22} color={theme.colors.text} /></Pressable><Text style={[styles.headerTitle, { color: theme.colors.text }]}>Tarea</Text><Pressable accessibilityLabel="Editar tarea" onPress={() => setEditorOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="edit" size={20} color={theme.colors.text} /></Pressable></View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} onPress={toggleComplete} style={({ pressed }) => [styles.titleRow, pressed && styles.pressed]}><View style={[styles.bigCheck, { borderColor: theme.colors.muted }, task.completed && { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse }]}>{task.completed ? <FocoIcon name="check" size={16} color={theme.colors.inverseText} strokeWidth={2.5} /> : null}</View><Text style={[styles.title, { color: task.completed ? theme.colors.muted : theme.colors.text }, task.completed && styles.titleDone]}>{task.title}</Text></Pressable>

          <View style={styles.metaGrid}>
            <Meta icon="calendar" label={getTaskScheduleLabel(task)} />
            <Meta icon="folder" label={project?.name ?? 'Sin proyecto'} />
            <Meta icon="clock" label={`${task.durationMinutes} min`} />
            <Meta icon="target" label={`${completedPomodoros}/${task.estimatedPomodoros} foco`} />
            <Meta icon="bars" label={formatDuration(focusSeconds, true)} />
            {task.recurrence.kind !== 'none' ? <Meta icon="repeat" label={`${recurrenceLabel(task.recurrence.kind)}${task.recurrence.fromCompletion ? ' desde completar' : ''}`} /> : null}
            {task.reminderAt ? <Meta icon="bell" label={new Date(task.reminderAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} /> : null}
          </View>

          {task.firstStep ? <View style={[styles.firstStep, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent }]}><Text style={[styles.firstLabel, { color: theme.colors.accent }]}>PRIMER PASO</Text><Text style={[styles.firstText, { color: theme.colors.text }]}>{task.firstStep}</Text></View> : null}

          <View style={[styles.actionRow, { borderColor: theme.colors.borderSoft }]}><Action icon="play" label="Enfocar" onPress={() => { hapticImpact(); router.push({ pathname: '/(tabs)/focus', params: { taskId: task.id } }); }} primary /><Action icon="tomorrow" label="Mañana" onPress={() => { postponeTask(task.id, 1); hapticSuccess(); }} /><Action icon="copy" label="Duplicar" onPress={() => { duplicateTask(task.id); hapticSuccess(); }} /></View>

          {task.subtasks.length > 0 ? <Section title="Subtareas" detail={`${task.subtasks.filter((item) => item.completed).length}/${task.subtasks.length}`}>{task.subtasks.map((subtask) => <Pressable key={subtask.id} onPress={() => toggleSubtask(task.id, subtask.id)} style={({ pressed }) => [styles.subtask, { borderBottomColor: theme.colors.borderSoft }, pressed && styles.pressed]}><View style={[styles.smallCheck, { borderColor: theme.colors.muted }, subtask.completed && { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse }]}>{subtask.completed ? <FocoIcon name="check" size={11} color={theme.colors.inverseText} /> : null}</View><Text style={[styles.subtaskText, { color: subtask.completed ? theme.colors.muted : theme.colors.text }, subtask.completed && styles.titleDone]}>{subtask.title}</Text></Pressable>)}</Section> : null}
          {task.notes ? <Section title="Notas"><Text style={[styles.notes, { color: theme.colors.muted }]}>{task.notes}</Text></Section> : null}
          <Section title="Actividad" detail={`${sessions.length} sesiones`}>{sessions.length > 0 ? sessions.slice(0, 8).map((session) => <View key={session.id} style={[styles.sessionRow, { borderBottomColor: theme.colors.borderSoft }]}><View><Text style={[styles.sessionDate, { color: theme.colors.text }]}>{new Date(session.endedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text><Text style={[styles.sessionMode, { color: theme.colors.muted }]}>{session.mode === 'pomodoro' ? `Pomodoro · ciclo ${session.cycleNumber}` : 'Cronómetro'}</Text></View><Text style={[styles.sessionDuration, { color: theme.colors.text }]}>{formatDuration(session.durationSec, true)}</Text></View>) : <Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>Todavía no has enfocado tiempo en esta tarea.</Text>}</Section>
          <Pressable accessibilityRole="button" onPress={remove} style={({ pressed }) => [styles.deleteButton, { backgroundColor: theme.colors.panel, borderColor: theme.colors.danger }, pressed && pressedStyle]}><FocoIcon name="trash" size={18} color={theme.colors.danger} /><Text style={[styles.deleteText, { color: theme.colors.danger }]}>Eliminar tarea</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
      <TaskEditorSheet visible={editorOpen} task={task} onClose={() => setEditorOpen(false)} />
    </>
  );
}

function recurrenceLabel(kind: string) { return ({ daily: 'Diaria', weekdays: 'Laborables', weekly: 'Semanal', monthly: 'Mensual' } as Record<string, string>)[kind] ?? 'Recurrente'; }
function Meta({ icon, label }: { icon: IconName; label: string }) { const theme = useFocoTheme(); return <View style={[styles.meta, { backgroundColor: theme.colors.panelStrong }]}><FocoIcon name={icon} size={15} color={theme.colors.muted} /><Text style={[styles.metaText, { color: theme.colors.muted }]} numberOfLines={1}>{label}</Text></View>; }
function Action({ icon, label, onPress, primary = false }: { icon: 'play' | 'tomorrow' | 'copy'; label: string; onPress: () => void; primary?: boolean }) { const theme = useFocoTheme(); return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, { borderColor: primary ? theme.colors.inverse : theme.colors.border, backgroundColor: primary ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><FocoIcon name={icon} size={18} color={primary ? theme.colors.inverseText : theme.colors.text} /><Text style={[styles.actionText, { color: primary ? theme.colors.inverseText : theme.colors.text }]}>{label}</Text></Pressable>; }
function Section({ title, detail, children }: { title: string; detail?: string; children: React.ReactNode }) { const theme = useFocoTheme(); return <View style={styles.section}><View style={styles.sectionHeader}><Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{title}</Text>{detail ? <Text style={[styles.sectionDetail, { color: theme.colors.muted }]}>{detail}</Text> : null}</View>{children}</View>; }

const styles = StyleSheet.create({
  safe: { flex: 1 }, header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 }, content: { paddingHorizontal: 14, paddingBottom: 48 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12 }, bigCheck: { width: 25, height: 25, marginTop: 2, borderRadius: 13, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' }, title: { flex: 1, fontFamily: 'Manrope_700Bold', fontSize: 23, lineHeight: 29, letterSpacing: -0.55 }, titleDone: { textDecorationLine: 'line-through' }, pressed: { opacity: 0.68 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, paddingBottom: 10 }, meta: { minHeight: 32, maxWidth: '100%', borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9 }, metaText: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, flexShrink: 1 },
  firstStep: { minHeight: 60, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 11, marginVertical: 5 }, firstLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8.5, lineHeight: 12, letterSpacing: 1 }, firstText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 18, marginTop: 3 },
  actionRow: { flexDirection: 'row', gap: 6, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth }, action: { flex: 1, minHeight: 46, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', gap: 2 }, actionText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10, lineHeight: 13 },
  section: { paddingTop: 16 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }, sectionTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 19 }, sectionDetail: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14 }, subtask: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 9, borderBottomWidth: StyleSheet.hairlineWidth }, smallCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.2, alignItems: 'center', justifyContent: 'center' }, subtaskText: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 18 }, notes: { fontFamily: 'Manrope_400Regular', fontSize: 13, lineHeight: 19 },
  sessionRow: { minHeight: 49, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth }, sessionDate: { fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16 }, sessionMode: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 1 }, sessionDuration: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15, fontVariant: ['tabular-nums'] }, emptyCopy: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 15, paddingVertical: 14 },
  deleteButton: { minHeight: 48, marginTop: 22, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 }, deleteText: { fontFamily: 'Manrope_600SemiBold', fontSize: 12, lineHeight: 16 }, missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, missingTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, lineHeight: 23 }, primary: { minHeight: 48, marginTop: 16, borderRadius: 12, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }, primaryText: { fontFamily: 'Manrope_700Bold', fontSize: 12.5, lineHeight: 16 },
});
