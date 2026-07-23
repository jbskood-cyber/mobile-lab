import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getAgendaBuckets, getNextAction } from '@/src/core/agenda';
import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, startOfLocalDay, type Task } from '@/src/core/model';
import { TaskEditorSheet } from '@/src/features/tasks/TaskEditorSheet';
import { TaskRow } from '@/src/features/tasks/TaskRow';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { foco } from '@/src/ui/focoTheme';
import { hapticImpact, hapticSuccess, pressedStyle } from '@/src/ui/premium';

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (value) => value.toUpperCase());
}

export function TodayScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { state, createTask, completeTask, reopenTask, deleteTask, storageError } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [draft, setDraft] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const buckets = useMemo(() => getAgendaBuckets(state), [state]);
  const nextAction = useMemo(() => getNextAction(state), [state]);
  const projectMap = useMemo(() => new Map(state.projects.map((project) => [project.id, project.name])), [state.projects]);
  const completedToday = useMemo(() => buckets.completed.filter((task) => task.completedAt !== undefined && task.completedAt >= startOfLocalDay(Date.now())), [buckets.completed]);
  const focusToday = useMemo(() => state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= startOfLocalDay(Date.now())).reduce((sum, session) => sum + session.durationSec, 0), [state.sessions]);
  const taskPomodoros = useMemo(() => {
    const values = new Map<string, number>();
    for (const session of state.sessions) if (session.taskId && session.mode === 'pomodoro' && session.phase === 'focus' && session.completed) values.set(session.taskId, (values.get(session.taskId) ?? 0) + 1);
    return values;
  }, [state.sessions]);

  const openTask = (task: Task) => router.push({ pathname: '/task/[id]', params: { id: task.id } });
  const startFocus = (task?: Task) => {
    hapticImpact();
    router.push({ pathname: '/(tabs)/focus', params: task ? { taskId: task.id } : {} });
  };
  const submitQuick = () => {
    if (!draft.trim()) return;
    const task = createTask({ title: draft, projectId: 'personal', dueAt: Date.now() });
    if (!task) return;
    setDraft('');
    hapticSuccess();
  };
  const toggle = (task: Task) => {
    if (task.completed) { reopenTask(task.id); return; }
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo(`${task.title} completada`, () => { reopenTask(task.id); if (result.generatedTask) deleteTask(result.generatedTask.id); });
  };
  const renderRows = (tasks: Task[]) => tasks.map((task) => <TaskRow key={task.id} task={task} projectName={projectMap.get(task.projectId) ?? 'Sin proyecto'} completedPomodoros={taskPomodoros.get(task.id) ?? 0} onPress={() => openTask(task)} onToggle={() => toggle(task)} />);

  return (
    <>
      <FocoScreen title="Hoy" subtitle={todayLabel()} screenKey="index" rightIcon="plus" rightAccessibilityLabel="Crear tarea" onRightPress={() => setEditorOpen(true)}>
        {storageError ? <View style={styles.warning}><Text style={styles.warningText}>{storageError}</Text></View> : null}
        <View style={styles.summary}><Summary value={String(buckets.today.length + buckets.overdue.length)} label="Por hacer" /><Summary value={String(completedToday.length)} label="Completadas" /><Summary value={formatDuration(focusToday, true)} label="Enfoque" /></View>
        <View style={styles.quickAdd}><Pressable accessibilityRole="button" accessibilityLabel="Escribir tarea" onPress={() => inputRef.current?.focus()} style={({ pressed }) => [styles.quickIcon, pressed && pressedStyle]}><FocoIcon name="plus" size={22} color={foco.colors.muted} /></Pressable><TextInput ref={inputRef} value={draft} onChangeText={setDraft} onSubmitEditing={submitQuick} placeholder="Añadir para hoy" placeholderTextColor={foco.colors.subtle} returnKeyType="done" autoCapitalize="sentences" style={styles.quickInput} /><Pressable accessibilityRole="button" accessibilityLabel="Guardar tarea" disabled={!draft.trim()} onPress={submitQuick} style={({ pressed }) => [styles.quickSave, !draft.trim() && styles.disabled, pressed && pressedStyle]}><FocoIcon name="check" size={18} color={foco.colors.bg} /></Pressable></View>
        <SectionTitle title="Ahora" detail={nextAction ? projectMap.get(nextAction.projectId) : undefined} />
        {nextAction ? <Pressable accessibilityRole="button" accessibilityLabel={`Enfocarse en ${nextAction.title}`} onPress={() => startFocus(nextAction)} style={({ pressed }) => [styles.nextAction, pressed && pressedStyle]}><View style={styles.nextCopy}><Text style={styles.nextTitle} numberOfLines={2}>{nextAction.title}</Text><Text style={styles.nextMeta}>{nextAction.estimatedPomodoros} {nextAction.estimatedPomodoros === 1 ? 'bloque estimado' : 'bloques estimados'}</Text></View><View style={styles.focusButton}><FocoIcon name="play" size={22} color={foco.colors.bg} /></View></Pressable> : <Empty title="Tu día está despejado" copy="Añade una tarea o elige algo desde Agenda." />}
        {buckets.overdue.length > 0 ? <><SectionTitle title="Atrasadas" detail={String(buckets.overdue.length)} />{renderRows(buckets.overdue)}</> : null}
        <SectionTitle title="Hoy" detail={String(buckets.today.length)} />
        {buckets.today.length > 0 ? renderRows(buckets.today) : <Empty title="Sin tareas programadas" copy="Planifica algo para hoy desde el botón +." />}
        {completedToday.length > 0 ? <><SectionTitle title="Completadas" detail={String(completedToday.length)} />{renderRows(completedToday)}</> : null}
      </FocoScreen>
      <TaskEditorSheet visible={editorOpen} defaultDueAt={Date.now()} onClose={() => setEditorOpen(false)} />
    </>
  );
}

function Summary({ value, label }: { value: string; label: string }) { return <View style={styles.summaryItem}><Text style={styles.summaryValue}>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>; }
function Empty({ title, copy }: { title: string; copy: string }) { return <View style={styles.empty}><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.emptyCopy}>{copy}</Text></View>; }

const styles = StyleSheet.create({
  warning: { marginTop: 12, borderRadius: 12, backgroundColor: '#211719', padding: 11 },
  warningText: { color: '#E4B8BE', fontSize: 12.5, lineHeight: 18 },
  summary: { flexDirection: 'row', paddingVertical: 18, marginTop: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  summaryItem: { flex: 1 },
  summaryValue: { color: foco.colors.text, fontSize: 20, fontWeight: '600', fontVariant: ['tabular-nums'] },
  summaryLabel: { color: foco.colors.muted, fontSize: 11.5, marginTop: 4 },
  quickAdd: { minHeight: 56, marginTop: 12, flexDirection: 'row', alignItems: 'center', borderRadius: 15, backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.border },
  quickIcon: { width: 46, height: 54, alignItems: 'center', justifyContent: 'center' },
  quickInput: { flex: 1, color: foco.colors.text, fontSize: 15.5, paddingVertical: 13 },
  quickSave: { width: 38, height: 38, marginRight: 8, borderRadius: 19, backgroundColor: foco.colors.text, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.25 },
  nextAction: { minHeight: 88, borderRadius: 16, backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.border, paddingLeft: 16, paddingRight: 10, flexDirection: 'row', alignItems: 'center' },
  nextCopy: { flex: 1, paddingRight: 12 },
  nextTitle: { color: foco.colors.text, fontSize: 18, lineHeight: 23, fontWeight: '600' },
  nextMeta: { color: foco.colors.muted, fontSize: 12.5, marginTop: 5 },
  focusButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: foco.colors.text, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 92, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft, paddingHorizontal: 18 },
  emptyTitle: { color: foco.colors.text, fontSize: 15.5, fontWeight: '600' },
  emptyCopy: { color: foco.colors.muted, fontSize: 12.5, textAlign: 'center', marginTop: 5 },
});
