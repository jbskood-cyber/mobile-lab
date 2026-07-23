import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { buildDayPlan, getMomentumTask, getReplanQueue } from '@/src/core/dayPlan';
import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, startOfLocalDay, type Task } from '@/src/core/model';
import { InboxSheet } from '@/src/features/inbox/InboxSheet';
import { ReplanSheet } from '@/src/features/replan/ReplanSheet';
import { TaskEditorSheet } from '@/src/features/tasks/TaskEditorSheet';
import { TaskRow } from '@/src/features/tasks/TaskRow';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { hapticImpact, hapticSuccess, pressedStyle } from '@/src/ui/premium';

function todayLabel() {
  return new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (value) => value.toUpperCase());
}

export function TodayScreen() {
  const router = useRouter();
  const theme = useFocoTheme();
  const inputRef = useRef<TextInput>(null);
  const { state, createTask, completeTask, reopenTask, deleteTask, storageError } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [draft, setDraft] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(false);
  const [replanOpen, setReplanOpen] = useState(false);
  const plan = useMemo(() => buildDayPlan(state), [state]);
  const replan = useMemo(() => getReplanQueue(state), [state]);
  const momentum = useMemo(() => getMomentumTask(state), [state]);
  const projectMap = useMemo(() => new Map(state.projects.map((project) => [project.id, project.name])), [state.projects]);
  const completedToday = useMemo(() => state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= startOfLocalDay(Date.now())), [state.tasks]);
  const focusToday = useMemo(() => state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= startOfLocalDay(Date.now())).reduce((sum, session) => sum + session.durationSec, 0), [state.sessions]);
  const taskPomodoros = useMemo(() => {
    const values = new Map<string, number>();
    for (const session of state.sessions) if (session.taskId && session.mode === 'pomodoro' && session.phase === 'focus' && session.completed) values.set(session.taskId, (values.get(session.taskId) ?? 0) + 1);
    return values;
  }, [state.sessions]);

  const openTask = (task: Task) => router.push({ pathname: '/task/[id]', params: { id: task.id } });
  const submitQuick = () => {
    if (!draft.trim()) return;
    const task = createTask({ title: draft, projectId: 'ideas', captured: true, durationMinutes: state.planning.defaultTaskDurationMinutes });
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
  const loadRatio = plan.capacityMinutes === 0 ? 0 : Math.min(1, (plan.scheduledMinutes + plan.flexibleMinutes) / plan.capacityMinutes);

  return (
    <>
      <FocoScreen title="Hoy" subtitle={todayLabel()} screenKey="index" rightIcon="plus" rightAccessibilityLabel="Crear tarea" onRightPress={() => setEditorOpen(true)}>
        {storageError ? <View style={[styles.warning, { backgroundColor: theme.colors.accentSoft }]}><Text style={[styles.warningText, { color: theme.colors.danger }]}>{storageError}</Text></View> : null}

        <View style={[styles.capture, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir Inbox" onPress={() => setInboxOpen(true)} style={({ pressed }) => [styles.captureIcon, pressed && pressedStyle]}><FocoIcon name="inbox" size={19} color={theme.colors.muted} /></Pressable>
          <TextInput ref={inputRef} value={draft} onChangeText={setDraft} onSubmitEditing={submitQuick} placeholder="Captura algo para después" placeholderTextColor={theme.colors.subtle} returnKeyType="done" autoCapitalize="sentences" style={[styles.captureInput, { color: theme.colors.text }]} />
          <Pressable accessibilityRole="button" accessibilityLabel="Guardar en Inbox" disabled={!draft.trim()} onPress={submitQuick} style={({ pressed }) => [styles.captureSave, { backgroundColor: theme.colors.inverse }, !draft.trim() && styles.disabled, pressed && pressedStyle]}><FocoIcon name="plus" size={18} color={theme.colors.inverseText} /></Pressable>
        </View>

        <View style={[styles.capacity, { borderBottomColor: theme.colors.borderSoft }]}>
          <View style={styles.capacityCopy}>
            <Text style={[styles.capacityTitle, { color: plan.overloadMinutes > 0 ? theme.colors.danger : theme.colors.text }]}>{plan.overloadMinutes > 0 ? `${plan.overloadMinutes} min de exceso` : `${plan.freeMinutes} min libres`}</Text>
            <Text style={[styles.capacityMeta, { color: theme.colors.muted }]}>{plan.scheduled.length} fijas · {plan.flexible.length} flexibles · {formatDuration(focusToday, true)} enfocado</Text>
          </View>
          <View style={[styles.track, { backgroundColor: theme.colors.panelStrong }]}><View style={[styles.fill, { width: `${Math.round(loadRatio * 100)}%`, backgroundColor: plan.overloadMinutes > 0 ? theme.colors.danger : theme.colors.accent }]} /></View>
        </View>

        {replan.length > 0 ? (
          <Pressable accessibilityRole="button" onPress={() => setReplanOpen(true)} style={({ pressed }) => [styles.replan, { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent }, pressed && pressedStyle]}>
            <View><Text style={[styles.replanTitle, { color: theme.colors.text }]}>{replan.length} pendientes por recuperar</Text><Text style={[styles.replanCopy, { color: theme.colors.muted }]}>Decide qué pasa con ellas sin perderlas.</Text></View>
            <FocoIcon name="chevron-right" size={17} color={theme.colors.accent} />
          </Pressable>
        ) : null}

        <SectionTitle title="Ahora" detail={momentum ? projectMap.get(momentum.projectId) : undefined} action={momentum ? <Pressable accessibilityLabel="Abrir modo Impulso" onPress={() => router.push('/momentum')} style={({ pressed }) => [styles.impulseLink, pressed && pressedStyle]}><Text style={[styles.impulseText, { color: theme.colors.accent }]}>Impulso</Text></Pressable> : undefined} />
        {momentum ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Enfocarse en ${momentum.title}`} onPress={() => { hapticImpact(); router.push({ pathname: '/(tabs)/focus', params: { taskId: momentum.id } }); }} style={({ pressed }) => [styles.nextAction, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }, pressed && pressedStyle]}>
            <View style={styles.nextCopy}><Text style={[styles.nextTitle, { color: theme.colors.text }]} numberOfLines={2}>{momentum.title}</Text><Text style={[styles.nextMeta, { color: theme.colors.muted }]}>{momentum.firstStep || `${momentum.durationMinutes} min · ${momentum.estimatedPomodoros} foco`}</Text></View>
            <View style={[styles.focusButton, { backgroundColor: theme.colors.inverse }]}><FocoIcon name="play" size={20} color={theme.colors.inverseText} /></View>
          </Pressable>
        ) : <Empty title="Tu día está despejado" copy="Captura una idea o planifica algo desde Agenda." />}

        <SectionTitle title="Planificado" detail={String(plan.scheduled.length)} />
        {plan.scheduled.length > 0 ? renderRows(plan.scheduled) : <Empty title="Sin bloques fijos" copy="Agenda una hora concreta para verla aquí." />}
        {plan.flexible.length > 0 ? <><SectionTitle title="Flexible" detail={String(plan.flexible.length)} />{renderRows(plan.flexible)}</> : null}
        {completedToday.length > 0 ? <><SectionTitle title="Completadas" detail={String(completedToday.length)} />{renderRows(completedToday)}</> : null}
      </FocoScreen>
      <TaskEditorSheet visible={editorOpen} defaultDueAt={Date.now() + state.planning.defaultTaskDurationMinutes * 60_000} defaultPlannedStartAt={Date.now()} onClose={() => setEditorOpen(false)} />
      <InboxSheet visible={inboxOpen} onClose={() => setInboxOpen(false)} onOpenTask={(task) => { setInboxOpen(false); openTask(task); }} />
      <ReplanSheet visible={replanOpen} onClose={() => setReplanOpen(false)} onOpenTask={(task) => { setReplanOpen(false); openTask(task); }} />
    </>
  );
}

function Empty({ title, copy }: { title: string; copy: string }) {
  const theme = useFocoTheme();
  return <View style={[styles.empty, { borderBottomColor: theme.colors.borderSoft }]}><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>{copy}</Text></View>;
}

const styles = StyleSheet.create({
  warning: { marginTop: 8, borderRadius: 10, padding: 9 },
  warningText: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, lineHeight: 14 },
  capture: { minHeight: 48, marginTop: 9, flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  captureIcon: { width: 42, height: 46, alignItems: 'center', justifyContent: 'center' },
  captureInput: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13.5, lineHeight: 18, paddingVertical: 10 },
  captureSave: { width: 36, height: 36, marginRight: 5, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.28 },
  capacity: { minHeight: 65, flexDirection: 'row', alignItems: 'center', gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  capacityCopy: { flex: 1 },
  capacityTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, lineHeight: 18 },
  capacityMeta: { fontFamily: 'Manrope_400Regular', fontSize: 10, lineHeight: 14, marginTop: 2 },
  track: { width: 72, height: 5, borderRadius: 3, overflow: 'hidden' },
  fill: { height: 5, borderRadius: 3 },
  replan: { minHeight: 58, marginTop: 9, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  replanTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, lineHeight: 16 },
  replanCopy: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  impulseLink: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 4 },
  impulseText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 },
  nextAction: { minHeight: 72, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, paddingLeft: 13, paddingRight: 8, flexDirection: 'row', alignItems: 'center' },
  nextCopy: { flex: 1, paddingRight: 10 },
  nextTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 15.5, lineHeight: 20 },
  nextMeta: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14, marginTop: 3 },
  focusButton: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  empty: { minHeight: 74, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 18 },
  emptyTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, lineHeight: 18 },
  emptyCopy: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14, textAlign: 'center', marginTop: 3 },
});
