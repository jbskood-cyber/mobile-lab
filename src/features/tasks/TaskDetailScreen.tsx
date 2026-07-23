import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTaskScheduleLabel } from '@/src/core/agenda';
import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration } from '@/src/core/model';
import { TaskEditorSheet } from './TaskEditorSheet';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { foco } from '@/src/ui/focoTheme';
import { hapticImpact, hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

export function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { state, completeTask, reopenTask, deleteTask, restoreTask, duplicateTask, postponeTask, toggleSubtask } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [editorOpen, setEditorOpen] = useState(false);
  const task = state.tasks.find((item) => item.id === id);
  const project = task ? state.projects.find((item) => item.id === task.projectId) : undefined;
  const sessions = useMemo(() => task ? state.sessions.filter((session) => session.taskId === task.id && session.phase === 'focus').sort((a, b) => b.endedAt - a.endedAt) : [], [state.sessions, task]);
  const focusSeconds = sessions.reduce((sum, session) => sum + session.durationSec, 0);
  const completedPomodoros = sessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}><Text style={styles.missingTitle}>Esta tarea ya no existe</Text><Pressable onPress={() => router.back()} style={styles.primary}><Text style={styles.primaryText}>Volver</Text></Pressable></View>
      </SafeAreaView>
    );
  }

  const toggleComplete = () => {
    if (task.completed) {
      reopenTask(task.id);
      hapticSuccess();
      return;
    }
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo('Tarea completada', () => {
      reopenTask(task.id);
      if (result.generatedTask) deleteTask(result.generatedTask.id);
    });
  };

  const remove = () => {
    const snapshot = task;
    deleteTask(task.id);
    hapticWarning();
    router.back();
    showUndo(`${task.title} eliminada`, () => restoreTask(snapshot));
  };

  return (
    <>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={23} color={foco.colors.text} /></Pressable>
          <Text style={styles.headerTitle}>Tarea</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Editar tarea" onPress={() => setEditorOpen(true)} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="edit" size={22} color={foco.colors.text} /></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} onPress={toggleComplete} style={({ pressed }) => [styles.titleRow, pressed && styles.pressed]}>
            <View style={[styles.bigCheck, task.completed && styles.bigCheckDone]}>{task.completed ? <FocoIcon name="check" size={18} color={foco.colors.bg} strokeWidth={2.5} /> : null}</View>
            <Text style={[styles.title, task.completed && styles.titleDone]}>{task.title}</Text>
          </Pressable>

          <View style={styles.metaGrid}>
            <Meta icon="calendar" label={getTaskScheduleLabel(task)} />
            <Meta icon="folder" label={project?.name ?? 'Sin proyecto'} />
            <Meta icon="target" label={`${completedPomodoros}/${task.estimatedPomodoros} pomodoros`} />
            <Meta icon="clock" label={formatDuration(focusSeconds, true)} />
            {task.recurrence.kind !== 'none' ? <Meta icon="repeat" label={recurrenceLabel(task.recurrence.kind)} /> : null}
            {task.reminderAt ? <Meta icon="bell" label={new Date(task.reminderAt).toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} /> : null}
          </View>

          <View style={styles.actionRow}>
            <Action icon="play" label="Enfocar" onPress={() => { hapticImpact(); router.push({ pathname: '/(tabs)/focus', params: { taskId: task.id } }); }} primary />
            <Action icon="tomorrow" label="Mañana" onPress={() => { postponeTask(task.id, 1); hapticSuccess(); }} />
            <Action icon="copy" label="Duplicar" onPress={() => { duplicateTask(task.id); hapticSuccess(); }} />
          </View>

          {task.subtasks.length > 0 ? (
            <Section title="Subtareas" detail={`${task.subtasks.filter((item) => item.completed).length}/${task.subtasks.length}`}>
              {task.subtasks.map((subtask) => (
                <Pressable key={subtask.id} onPress={() => toggleSubtask(task.id, subtask.id)} style={({ pressed }) => [styles.subtask, pressed && styles.pressed]}>
                  <View style={[styles.smallCheck, subtask.completed && styles.bigCheckDone]}>{subtask.completed ? <FocoIcon name="check" size={12} color={foco.colors.bg} /> : null}</View>
                  <Text style={[styles.subtaskText, subtask.completed && styles.titleDone]}>{subtask.title}</Text>
                </Pressable>
              ))}
            </Section>
          ) : null}

          {task.notes ? <Section title="Notas"><Text style={styles.notes}>{task.notes}</Text></Section> : null}

          <Section title="Actividad" detail={`${sessions.length} sesiones`}>
            {sessions.length > 0 ? sessions.slice(0, 8).map((session) => (
              <View key={session.id} style={styles.sessionRow}><View><Text style={styles.sessionDate}>{new Date(session.endedAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text><Text style={styles.sessionMode}>{session.mode === 'pomodoro' ? `Pomodoro · ciclo ${session.cycleNumber}` : 'Cronómetro'}</Text></View><Text style={styles.sessionDuration}>{formatDuration(session.durationSec, true)}</Text></View>
            )) : <Text style={styles.emptyCopy}>Todavía no has enfocado tiempo en esta tarea.</Text>}
          </Section>

          <Pressable accessibilityRole="button" onPress={remove} style={({ pressed }) => [styles.deleteButton, pressed && pressedStyle]}><FocoIcon name="trash" size={19} color="#DCA8AF" /><Text style={styles.deleteText}>Eliminar tarea</Text></Pressable>
        </ScrollView>
      </SafeAreaView>
      <TaskEditorSheet visible={editorOpen} task={task} onClose={() => setEditorOpen(false)} />
    </>
  );
}

function recurrenceLabel(kind: string) {
  return ({ daily: 'Diaria', weekdays: 'Días laborables', weekly: 'Semanal', monthly: 'Mensual' } as Record<string, string>)[kind] ?? 'Recurrente';
}
function Meta({ icon, label }: { icon: 'calendar' | 'folder' | 'target' | 'clock' | 'repeat' | 'bell'; label: string }) {
  return <View style={styles.meta}><FocoIcon name={icon} size={17} color={foco.colors.muted} /><Text style={styles.metaText} numberOfLines={1}>{label}</Text></View>;
}
function Action({ icon, label, onPress, primary = false }: { icon: 'play' | 'tomorrow' | 'copy'; label: string; onPress: () => void; primary?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.action, primary && styles.actionPrimary, pressed && pressedStyle]}><FocoIcon name={icon} size={20} color={primary ? foco.colors.bg : foco.colors.text} /><Text style={[styles.actionText, primary && styles.actionTextPrimary]}>{label}</Text></Pressable>;
}
function Section({ title, detail, children }: { title: string; detail?: string; children: React.ReactNode }) {
  return <View style={styles.section}><View style={styles.sectionHeader}><Text style={styles.sectionTitle}>{title}</Text>{detail ? <Text style={styles.sectionDetail}>{detail}</Text> : null}</View>{children}</View>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: foco.colors.bg },
  header: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  iconButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '650' },
  content: { paddingHorizontal: 16, paddingBottom: 50 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 13, paddingVertical: 16 },
  bigCheck: { width: 28, height: 28, marginTop: 3, borderRadius: 14, borderWidth: 1.6, borderColor: foco.colors.muted, alignItems: 'center', justifyContent: 'center' },
  bigCheckDone: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  title: { flex: 1, color: foco.colors.text, fontSize: 28, lineHeight: 34, fontWeight: '680', letterSpacing: -0.7 },
  titleDone: { color: foco.colors.muted, textDecorationLine: 'line-through' },
  pressed: { opacity: 0.7 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingBottom: 16 },
  meta: { minHeight: 36, maxWidth: '100%', borderRadius: 12, backgroundColor: foco.colors.panelStrong, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 11 },
  metaText: { color: foco.colors.muted, fontSize: 12.5, flexShrink: 1 },
  actionRow: { flexDirection: 'row', gap: 8, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft },
  action: { flex: 1, minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center', gap: 4 },
  actionPrimary: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  actionText: { color: foco.colors.text, fontSize: 11.5, fontWeight: '600' },
  actionTextPrimary: { color: foco.colors.bg },
  section: { paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { color: foco.colors.text, fontSize: 17, fontWeight: '650' },
  sectionDetail: { color: foco.colors.muted, fontSize: 12.5 },
  subtask: { minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  smallCheck: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.3, borderColor: foco.colors.muted, alignItems: 'center', justifyContent: 'center' },
  subtaskText: { flex: 1, color: foco.colors.text, fontSize: 14.5 },
  notes: { color: foco.colors.muted, fontSize: 14.5, lineHeight: 21 },
  sessionRow: { minHeight: 56, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  sessionDate: { color: foco.colors.text, fontSize: 14.5, fontWeight: '550' },
  sessionMode: { color: foco.colors.muted, fontSize: 11.5, marginTop: 3 },
  sessionDuration: { color: foco.colors.text, fontSize: 14, fontVariant: ['tabular-nums'] },
  emptyCopy: { color: foco.colors.muted, fontSize: 13, paddingVertical: 18 },
  deleteButton: { minHeight: 52, marginTop: 28, borderRadius: 14, backgroundColor: '#211719', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  deleteText: { color: '#DCA8AF', fontSize: 14, fontWeight: '600' },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingTitle: { color: foco.colors.text, fontSize: 20, fontWeight: '650' },
  primary: { minHeight: 48, marginTop: 18, borderRadius: 14, backgroundColor: foco.colors.text, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: foco.colors.bg, fontWeight: '700' },
});
