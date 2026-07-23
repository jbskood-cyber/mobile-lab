import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getAgendaBuckets, getTasksForDate, searchTasks } from '@/src/core/agenda';
import { getTasksForCalendarDay } from '@/src/core/calendar';
import { useFocoStore } from '@/src/core/FocoStore';
import { DAY_MS, startOfLocalDay, type Task } from '@/src/core/model';
import { TaskEditorSheet } from '@/src/features/tasks/TaskEditorSheet';
import { TaskRow } from '@/src/features/tasks/TaskRow';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';
import { DayTimeline } from './DayTimeline';
import { MonthCalendar } from './MonthCalendar';

export type AgendaMode = 'Calendario' | 'Día' | 'Listas';
type SmartList = 'Hoy' | 'Próximas' | 'Inbox' | 'Completadas' | 'Todas';

export function AgendaScreen() {
  const router = useRouter();
  const theme = useFocoTheme();
  const { state, completeTask, reopenTask, deleteTask } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [mode, setMode] = useState<AgendaMode>('Calendario');
  const [smartList, setSmartList] = useState<SmartList>('Hoy');
  const [selectedDate, setSelectedDate] = useState(startOfLocalDay(Date.now()));
  const [monthAnchor, setMonthAnchor] = useState(startOfLocalDay(Date.now()));
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const [draftStart, setDraftStart] = useState<number | undefined>();
  const buckets = useMemo(() => getAgendaBuckets(state), [state]);
  const projectMap = useMemo(() => new Map(state.projects.map((project) => [project.id, project.name])), [state.projects]);
  const pomodoros = useMemo(() => {
    const values = new Map<string, number>();
    for (const session of state.sessions) if (session.taskId && session.mode === 'pomodoro' && session.phase === 'focus' && session.completed) values.set(session.taskId, (values.get(session.taskId) ?? 0) + 1);
    return values;
  }, [state.sessions]);

  const dayTasks = useMemo(() => getTasksForCalendarDay(state, selectedDate), [selectedDate, state]);
  const listTasks = useMemo(() => {
    let tasks: Task[];
    if (query.trim()) tasks = searchTasks(state, query);
    else if (smartList === 'Hoy') tasks = [...buckets.overdue, ...getTasksForDate(state, selectedDate).filter((task) => !task.completed)];
    else if (smartList === 'Próximas') tasks = buckets.upcoming;
    else if (smartList === 'Inbox') tasks = state.tasks.filter((task) => task.captured && !task.completed);
    else if (smartList === 'Completadas') tasks = buckets.completed;
    else tasks = state.tasks;
    return [...new Map(tasks.map((task) => [task.id, task])).values()];
  }, [buckets, query, selectedDate, smartList, state]);

  const openTask = (task: Task) => router.push({ pathname: '/task/[id]', params: { id: task.id } });
  const openEditor = (start?: number) => { setDraftStart(start); setEditorOpen(true); };
  const toggle = (task: Task) => {
    if (task.completed) return reopenTask(task.id);
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo(`${task.title} completada`, () => { reopenTask(task.id); if (result.generatedTask) deleteTask(result.generatedTask.id); });
  };

  const renderRows = (tasks: Task[]) => tasks.map((task) => <TaskRow key={task.id} task={task} projectName={projectMap.get(task.projectId) ?? 'Sin proyecto'} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => openTask(task)} onToggle={() => toggle(task)} />);
  const dateLabel = new Date(selectedDate).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^./, (value) => value.toUpperCase());

  return (
    <>
      <FocoScreen title="Agenda" subtitle={dateLabel} screenKey="agenda" rightIcon="plus" rightAccessibilityLabel="Crear tarea" onRightPress={() => openEditor(mode === 'Día' ? selectedDate + 9 * 60 * 60 * 1000 : undefined)}>
        <View style={[styles.search, { borderColor: theme.colors.border, backgroundColor: theme.colors.panel }]}>
          <FocoIcon name="search" size={18} color={theme.colors.muted} />
          <TextInput value={query} onChangeText={(value) => { setQuery(value); if (value) setMode('Listas'); }} placeholder="Buscar tareas, notas o proyectos" placeholderTextColor={theme.colors.subtle} returnKeyType="search" style={[styles.searchInput, { color: theme.colors.text }]} />
          {query ? <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={({ pressed }) => [styles.clear, pressed && pressedStyle]}><FocoIcon name="plus" size={16} color={theme.colors.muted} style={styles.closeIcon} /></Pressable> : null}
        </View>

        <View style={[styles.segmented, { backgroundColor: theme.colors.panelSoft, borderColor: theme.colors.borderSoft }]}>
          {(['Calendario', 'Día', 'Listas'] as AgendaMode[]).map((item) => <Pressable key={item} accessibilityRole="tab" accessibilityState={{ selected: mode === item }} onPress={() => { setMode(item); setQuery(''); hapticSelection(); }} style={({ pressed }) => [styles.segment, mode === item && { backgroundColor: theme.colors.inverse }, pressed && pressedStyle]}><Text style={[styles.segmentText, { color: mode === item ? theme.colors.inverseText : theme.colors.muted }]}>{item}</Text></Pressable>)}
        </View>

        {mode === 'Calendario' ? (
          <>
            <MonthCalendar state={state} anchor={monthAnchor} selected={selectedDate} onAnchor={setMonthAnchor} onSelect={setSelectedDate} />
            <SectionTitle title="Plan del día" detail={`${dayTasks.length} ${dayTasks.length === 1 ? 'elemento' : 'elementos'}`} />
            {dayTasks.length > 0 ? renderRows(dayTasks) : <Empty title="Día disponible" copy="Toca + para planificar o abre la vista Día y toca una hora." />}
          </>
        ) : null}

        {mode === 'Día' ? (
          <>
            <View style={styles.dayNavigator}>
              <Pressable accessibilityLabel="Día anterior" onPress={() => setSelectedDate((value) => value - DAY_MS)} style={({ pressed }) => [styles.dayArrow, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={18} color={theme.colors.muted} /></Pressable>
              <Pressable onPress={() => setSelectedDate(startOfLocalDay(Date.now()))} style={({ pressed }) => [styles.todayButton, { borderColor: theme.colors.border }, pressed && pressedStyle]}><Text style={[styles.todayText, { color: theme.colors.text }]}>Hoy</Text></Pressable>
              <Pressable accessibilityLabel="Día siguiente" onPress={() => setSelectedDate((value) => value + DAY_MS)} style={({ pressed }) => [styles.dayArrow, pressed && pressedStyle]}><FocoIcon name="chevron-right" size={18} color={theme.colors.muted} /></Pressable>
            </View>
            <DayTimeline state={state} day={selectedDate} onTask={openTask} onSlot={openEditor} />
          </>
        ) : null}

        {mode === 'Listas' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartLists}>
              {(['Hoy', 'Próximas', 'Inbox', 'Completadas', 'Todas'] as SmartList[]).map((item) => <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: smartList === item }} onPress={() => { setSmartList(item); setQuery(''); hapticSelection(); }} style={({ pressed }) => [styles.smartChip, { borderColor: theme.colors.border }, smartList === item && { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse }, pressed && pressedStyle]}><Text style={[styles.smartText, { color: smartList === item ? theme.colors.inverseText : theme.colors.muted }]}>{item}</Text></Pressable>)}
            </ScrollView>
            <SectionTitle title={query ? 'Resultados' : smartList} detail={`${listTasks.length} ${listTasks.length === 1 ? 'tarea' : 'tareas'}`} />
            {listTasks.length > 0 ? renderRows(listTasks) : <Empty title="Nada en esta vista" copy="Captura una tarea o cambia el filtro." />}
          </>
        ) : null}
      </FocoScreen>
      <TaskEditorSheet visible={editorOpen} defaultDueAt={draftStart ? draftStart + state.planning.defaultTaskDurationMinutes * 60_000 : selectedDate + 18 * 60 * 60 * 1000} defaultPlannedStartAt={draftStart} onClose={() => { setEditorOpen(false); setDraftStart(undefined); }} />
    </>
  );
}

function Empty({ title, copy }: { title: string; copy: string }) {
  const theme = useFocoTheme();
  return <View style={[styles.empty, { borderBottomColor: theme.colors.borderSoft }]}><FocoIcon name="calendar" size={23} color={theme.colors.text} /><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>{title}</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>{copy}</Text></View>;
}

const styles = StyleSheet.create({
  search: { minHeight: 46, marginTop: 10, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', paddingLeft: 12 },
  searchInput: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13.5, lineHeight: 18, paddingHorizontal: 9, paddingVertical: 10 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  segmented: { minHeight: 44, marginTop: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', padding: 3 },
  segment: { flex: 1, minHeight: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  segmentText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15 },
  dayNavigator: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 5 },
  dayArrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  todayButton: { minHeight: 36, borderWidth: StyleSheet.hairlineWidth, borderRadius: 11, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  todayText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5 },
  smartLists: { gap: 6, paddingVertical: 9 },
  smartChip: { minHeight: 38, paddingHorizontal: 12, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  smartText: { fontFamily: 'Manrope_500Medium', fontSize: 11.5, lineHeight: 15 },
  empty: { minHeight: 126, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 18 },
  emptyTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18, marginTop: 8 },
  emptyCopy: { fontFamily: 'Manrope_400Regular', fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: 3 },
});
