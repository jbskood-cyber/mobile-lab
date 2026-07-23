import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { getAgendaBuckets, getTasksForDate, searchTasks } from '@/src/core/agenda';
import { useFocoStore } from '@/src/core/FocoStore';
import { startOfLocalDay, type Task } from '@/src/core/model';
import { TaskEditorSheet } from '@/src/features/tasks/TaskEditorSheet';
import { TaskRow } from '@/src/features/tasks/TaskRow';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle } from '@/src/ui/FocoShell';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';

type SmartList = 'Hoy' | 'Próximas' | 'Sin fecha' | 'Completadas' | 'Todas';
const DAY = 24 * 60 * 60 * 1000;

export function AgendaScreen() {
  const router = useRouter();
  const { state, completeTask, reopenTask, deleteTask } = useFocoStore();
  const { showUndo } = useFocoUI();
  const [smartList, setSmartList] = useState<SmartList>('Hoy');
  const [selectedDate, setSelectedDate] = useState(startOfLocalDay(Date.now()));
  const [query, setQuery] = useState('');
  const [editorOpen, setEditorOpen] = useState(false);
  const buckets = useMemo(() => getAgendaBuckets(state), [state]);
  const projectMap = useMemo(() => new Map(state.projects.map((project) => [project.id, project.name])), [state.projects]);
  const pomodoros = useMemo(() => {
    const values = new Map<string, number>();
    for (const session of state.sessions) if (session.taskId && session.mode === 'pomodoro' && session.phase === 'focus' && session.completed) values.set(session.taskId, (values.get(session.taskId) ?? 0) + 1);
    return values;
  }, [state.sessions]);

  const listTasks = useMemo(() => {
    let tasks: Task[];
    if (query.trim()) tasks = searchTasks(state, query);
    else if (smartList === 'Hoy') tasks = [...buckets.overdue, ...getTasksForDate(state, selectedDate).filter((task) => !task.completed)];
    else if (smartList === 'Próximas') tasks = buckets.upcoming;
    else if (smartList === 'Sin fecha') tasks = buckets.noDate;
    else if (smartList === 'Completadas') tasks = buckets.completed;
    else tasks = state.tasks;
    return [...new Map(tasks.map((task) => [task.id, task])).values()];
  }, [buckets, query, selectedDate, smartList, state]);

  const toggle = (task: Task) => {
    if (task.completed) return reopenTask(task.id);
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo(`${task.title} completada`, () => {
      reopenTask(task.id);
      if (result.generatedTask) deleteTask(result.generatedTask.id);
    });
  };

  return (
    <>
      <FocoScreen title="Agenda" subtitle="Organiza por fecha, no por tarjetas." screenKey="agenda" rightIcon="plus" rightAccessibilityLabel="Crear tarea" onRightPress={() => setEditorOpen(true)}>
        <View style={styles.search}>
          <FocoIcon name="search" size={20} color={foco.colors.muted} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar tareas, notas o proyectos" placeholderTextColor={foco.colors.subtle} returnKeyType="search" style={styles.searchInput} />
          {query ? <Pressable accessibilityLabel="Limpiar búsqueda" onPress={() => setQuery('')} style={({ pressed }) => [styles.clear, pressed && pressedStyle]}><FocoIcon name="plus" size={17} color={foco.colors.muted} style={styles.closeIcon} /></Pressable> : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.smartLists}>
          {(['Hoy', 'Próximas', 'Sin fecha', 'Completadas', 'Todas'] as SmartList[]).map((item) => (
            <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: smartList === item }} onPress={() => { setSmartList(item); setQuery(''); hapticSelection(); }} style={({ pressed }) => [styles.smartChip, smartList === item && styles.smartChipActive, pressed && pressedStyle]}>
              <Text style={[styles.smartText, smartList === item && styles.smartTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {smartList === 'Hoy' && !query ? <DateStrip selected={selectedDate} onSelect={setSelectedDate} /> : null}

        <SectionTitle title={query ? 'Resultados' : smartList} detail={`${listTasks.length} ${listTasks.length === 1 ? 'tarea' : 'tareas'}`} />
        {listTasks.length > 0 ? listTasks.map((task) => (
          <TaskRow key={task.id} task={task} projectName={projectMap.get(task.projectId) ?? 'Sin proyecto'} completedPomodoros={pomodoros.get(task.id) ?? 0} onPress={() => router.push({ pathname: '/task/[id]', params: { id: task.id } })} onToggle={() => toggle(task)} />
        )) : <View style={styles.empty}><FocoIcon name="calendar" size={27} color={foco.colors.text} /><Text style={styles.emptyTitle}>Nada en esta vista</Text><Text style={styles.emptyCopy}>Crea una tarea o cambia el filtro.</Text></View>}
      </FocoScreen>
      <TaskEditorSheet visible={editorOpen} defaultDueAt={smartList === 'Sin fecha' ? undefined : selectedDate + 9 * 60 * 60 * 1000} onClose={() => setEditorOpen(false)} />
    </>
  );
}

function DateStrip({ selected, onSelect }: { selected: number; onSelect: (value: number) => void }) {
  const start = startOfLocalDay(Date.now()) - 2 * DAY;
  return (
    <View style={styles.dateStrip}>
      {Array.from({ length: 7 }, (_, index) => start + index * DAY).map((timestamp) => {
        const date = new Date(timestamp);
        const active = timestamp === selected;
        return (
          <Pressable key={timestamp} accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => { onSelect(timestamp); hapticSelection(); }} style={({ pressed }) => [styles.dateItem, active && styles.dateActive, pressed && pressedStyle]}>
            <Text style={[styles.weekday, active && styles.dateTextActive]}>{date.toLocaleDateString('es-MX', { weekday: 'short' }).slice(0, 2)}</Text>
            <Text style={[styles.day, active && styles.dateTextActive]}>{date.getDate()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  search: { minHeight: 54, marginTop: 16, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, flexDirection: 'row', alignItems: 'center', paddingLeft: 14 },
  searchInput: { flex: 1, color: foco.colors.text, fontSize: 14.5, paddingHorizontal: 11, paddingVertical: 13 },
  clear: { width: 46, height: 52, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  smartLists: { gap: 7, paddingVertical: 12 },
  smartChip: { minHeight: 42, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center' },
  smartChipActive: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  smartText: { color: foco.colors.muted, fontSize: 13 },
  smartTextActive: { color: foco.colors.bg, fontWeight: '700' },
  dateStrip: { flexDirection: 'row', gap: 5, paddingVertical: 4 },
  dateItem: { flex: 1, minHeight: 58, borderRadius: 14, alignItems: 'center', justifyContent: 'center', gap: 3 },
  dateActive: { backgroundColor: foco.colors.panelStrong },
  weekday: { color: foco.colors.muted, fontSize: 10.5, textTransform: 'uppercase' },
  day: { color: foco.colors.text, fontSize: 16, fontWeight: '650', fontVariant: ['tabular-nums'] },
  dateTextActive: { color: foco.colors.white },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  emptyTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '650', marginTop: 12 },
  emptyCopy: { color: foco.colors.muted, fontSize: 12.5, marginTop: 5 },
});
