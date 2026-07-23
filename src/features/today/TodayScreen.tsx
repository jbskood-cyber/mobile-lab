import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getTodaySummary, type Task, type TaskPriority } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle, Surface } from '@/src/ui/FocoShell';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { UndoBar } from '@/src/ui/UndoBar';
import { foco, shadowGlow } from '@/src/ui/focoTheme';
import { hapticImpact, hapticSelection, hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
type TaskFilter = 'Todas' | 'En curso' | 'Favoritas' | 'Alta prioridad';

function getTodayLabel() {
  const now = new Date();
  const label = `${weekdays[now.getDay()] ?? ''}, ${now.getDate()} de ${months[now.getMonth()] ?? ''}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function TodayScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);
  const { state, storageError, addTask, updateTask, toggleTask, deleteTask, restoreTask } = useFocoStore();
  const [draft, setDraft] = useState('');
  const [taskFilter, setTaskFilter] = useState<TaskFilter>('Todas');
  const [filterOpen, setFilterOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editPriority, setEditPriority] = useState<TaskPriority>('Media');
  const [editInProgress, setEditInProgress] = useState(false);
  const [editFavorite, setEditFavorite] = useState(false);
  const [undo, setUndo] = useState<{ message: string; task: Task; kind: 'complete' | 'delete' } | null>(null);

  const summary = useMemo(() => getTodaySummary(state), [state]);
  const activeProjects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const projectById = useMemo(() => new Map(state.projects.map((project) => [project.id, project])), [state.projects]);
  const openTasks = useMemo(() => state.tasks.filter((task) => !task.completed).filter((task) => {
    if (taskFilter === 'En curso') return task.inProgress;
    if (taskFilter === 'Favoritas') return task.favorite;
    if (taskFilter === 'Alta prioridad') return task.priority === 'Alta';
    return true;
  }), [state.tasks, taskFilter]);

  useEffect(() => {
    if (!undo) return;
    const timeout = setTimeout(() => setUndo(null), 4500);
    return () => clearTimeout(timeout);
  }, [undo]);

  const submitTask = () => {
    const normalized = draft.trim();
    if (!normalized) return;
    addTask(normalized, activeProjects[0]?.id ?? 'personal');
    setDraft('');
    hapticSuccess();
  };

  const completeTask = (task: Task) => {
    toggleTask(task.id);
    setUndo({ message: `${task.title} completada`, task, kind: 'complete' });
    hapticSuccess();
  };

  const openEditor = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditProjectId(task.projectId);
    setEditPriority(task.priority);
    setEditInProgress(task.inProgress);
    setEditFavorite(task.favorite);
    hapticSelection();
  };

  const saveTask = () => {
    if (!editingTask || !editTitle.trim()) return;
    updateTask(editingTask.id, {
      title: editTitle,
      projectId: editProjectId,
      priority: editPriority,
      inProgress: editInProgress,
      favorite: editFavorite,
    });
    setEditingTask(null);
    hapticSuccess();
  };

  const removeTask = () => {
    if (!editingTask) return;
    const task = editingTask;
    deleteTask(task.id);
    setEditingTask(null);
    setUndo({ message: `${task.title} eliminada`, task, kind: 'delete' });
    hapticWarning();
  };

  const undoLast = () => {
    if (!undo) return;
    if (undo.kind === 'complete') toggleTask(undo.task.id);
    else restoreTask(undo.task);
    setUndo(null);
    hapticSelection();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <FocoScreen title="Hoy" subtitle={getTodayLabel()} rightIcon="calendar">
        {storageError ? <View accessibilityLiveRegion="polite" style={styles.storageWarning}><Text style={styles.storageWarningText}>{storageError}</Text></View> : null}

        <Surface style={styles.metrics}>
          <Metric icon="clock" value={formatDuration(summary.focusSeconds)} label="Tiempo foco" />
          <Divider />
          <Metric icon="list" value={String(summary.pending)} label="Pendientes" />
          <Divider />
          <Metric icon="circle" value={String(summary.active)} label="En curso" />
          <Divider />
          <Metric icon="check" value={String(summary.completed)} label="Completadas" />
        </Surface>

        <Surface style={styles.quickAdd}>
          <Pressable accessibilityRole="button" accessibilityLabel="Escribir nueva tarea" hitSlop={8} onPress={() => inputRef.current?.focus()} style={({ pressed }) => pressed && pressedStyle}>
            <FocoIcon name="plus" size={26} color={foco.colors.muted} />
          </Pressable>
          <TextInput
            ref={inputRef}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submitTask}
            returnKeyType="done"
            placeholder="Añadir tarea"
            placeholderTextColor={foco.colors.subtle}
            style={styles.input}
            accessibilityLabel="Añadir tarea"
          />
          {draft.trim() ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Guardar tarea" onPress={submitTask} style={({ pressed }) => [styles.inlineSave, pressed && pressedStyle]}>
              <FocoIcon name="check" size={20} color={foco.colors.bg} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </Surface>

        <SectionTitle
          title="Enfoque de hoy"
          action={
            <Pressable accessibilityRole="button" accessibilityLabel="Ver plan" onPress={() => router.navigate('/(tabs)/focus')} style={({ pressed }) => [styles.planLink, pressed && pressedStyle]}>
              <Text style={styles.planText}>Ver plan</Text>
              <FocoIcon name="chevron-right" size={16} color={foco.colors.muted} />
            </Pressable>
          }
        />

        <Surface style={styles.focusCard}>
          <View style={styles.focusCopy}>
            <Text style={styles.focusTitle}>Bloque 2 · Transformación</Text>
            <Text style={styles.focusProject}>Plan maestro</Text>
            <Text style={styles.focusTime}>24:36</Text>
            <Text style={styles.focusGoal}>Objetivo: 3 bloques</Text>
          </View>
          <View style={styles.focusVisual}>
            <View style={styles.orbitOuter} />
            <View style={styles.orbitInner} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Iniciar enfoque"
              onPress={() => { hapticImpact(); router.navigate('/(tabs)/focus'); }}
              style={({ pressed }) => [styles.playButton, pressed && pressedStyle]}
            >
              <ProgressRing size={76} strokeWidth={1.5} progress={0.82} color={foco.colors.white} trackColor="#454951" glow>
                <FocoIcon name="play" size={30} color={foco.colors.white} />
              </ProgressRing>
            </Pressable>
          </View>
        </Surface>

        <SectionTitle
          title="Tareas"
          detail={taskFilter === 'Todas' ? `${openTasks.length} pendientes` : taskFilter}
          action={
            <Pressable accessibilityRole="button" accessibilityLabel="Filtrar tareas" onPress={() => { setFilterOpen(true); hapticSelection(); }} style={({ pressed }) => [styles.filterButton, taskFilter !== 'Todas' && styles.filterButtonActive, pressed && pressedStyle]}>
              <FocoIcon name="filter" size={19} color={taskFilter === 'Todas' ? foco.colors.muted : foco.colors.bg} />
            </Pressable>
          }
        />

        <View style={styles.taskList}>
          {openTasks.map((task) => {
            const project = projectById.get(task.projectId);
            return (
              <View key={task.id} style={styles.taskRow}>
                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: false }} accessibilityLabel={`Completar ${task.title}`} onPress={() => completeTask(task)} style={({ pressed }) => [styles.taskCheck, pressed && pressedStyle]}>
                  <FocoIcon name="circle" size={27} color={task.inProgress ? foco.colors.text : foco.colors.subtle} strokeWidth={task.inProgress ? 2 : 1.55} />
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Editar ${task.title}`} onPress={() => openEditor(task)} style={({ pressed }) => [styles.taskCopy, pressed && styles.taskCopyPressed]}>
                  <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                  <View style={styles.taskMeta}>
                    <Text style={styles.taskProject}>{project?.name ?? 'Sin proyecto'}</Text>
                    <View style={[styles.priorityDot, task.priority === 'Alta' && styles.priorityHigh, task.priority === 'Media' && styles.priorityMedium]} />
                    <Text style={styles.taskPriority}>{task.priority}</Text>
                    {task.inProgress ? <Text style={styles.inProgress}>En curso</Text> : null}
                  </View>
                </Pressable>
                <Pressable accessibilityRole="button" accessibilityLabel={`Opciones de ${task.title}`} onPress={() => openEditor(task)} style={({ pressed }) => [styles.trailing, pressed && pressedStyle]}>
                  <FocoIcon name={task.favorite ? 'star' : 'more'} size={20} color={task.favorite ? foco.colors.text : foco.colors.subtle} strokeWidth={1.45} />
                </Pressable>
              </View>
            );
          })}
          {openTasks.length === 0 ? (
            <Surface style={styles.emptyState}>
              <FocoIcon name="check" size={28} color={foco.colors.text} />
              <Text style={styles.emptyTitle}>Nada pendiente aquí</Text>
              <Text style={styles.emptyCopy}>{taskFilter === 'Todas' ? 'Tu día está despejado. Añade una tarea cuando la necesites.' : 'Cambia el filtro para ver el resto de tus tareas.'}</Text>
            </Surface>
          ) : null}
        </View>
      </FocoScreen>

      <FocoSheet
        visible={filterOpen}
        title="Filtrar tareas"
        subtitle="Muestra únicamente lo que necesita tu atención ahora."
        onClose={() => setFilterOpen(false)}
      >
        <View style={styles.sheetOptions}>
          {(['Todas', 'En curso', 'Favoritas', 'Alta prioridad'] as TaskFilter[]).map((item) => (
            <Pressable key={item} accessibilityRole="radio" accessibilityState={{ checked: taskFilter === item }} onPress={() => { setTaskFilter(item); setFilterOpen(false); hapticSelection(); }} style={({ pressed }) => [styles.sheetOption, taskFilter === item && styles.sheetOptionSelected, pressed && pressedStyle]}>
              <Text style={[styles.sheetOptionText, taskFilter === item && styles.sheetOptionTextSelected]}>{item}</Text>
              {taskFilter === item ? <FocoIcon name="check" size={20} color={foco.colors.bg} strokeWidth={2.4} /> : null}
            </Pressable>
          ))}
        </View>
      </FocoSheet>

      <FocoSheet
        visible={Boolean(editingTask)}
        title="Editar tarea"
        subtitle="Los cambios se guardan en este dispositivo."
        onClose={() => setEditingTask(null)}
        footer={
          <>
            <SheetButton label="Eliminar" variant="danger" onPress={removeTask} />
            <SheetButton label="Guardar" onPress={saveTask} disabled={!editTitle.trim()} />
          </>
        }
      >
        <FieldLabel>TÍTULO</FieldLabel>
        <TextInput value={editTitle} onChangeText={setEditTitle} placeholder="Nombre de la tarea" placeholderTextColor={foco.colors.subtle} style={styles.sheetInput} accessibilityLabel="Título de la tarea" />

        <FieldLabel>PROYECTO</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
          {activeProjects.map((project) => (
            <Pressable key={project.id} onPress={() => { setEditProjectId(project.id); hapticSelection(); }} style={({ pressed }) => [styles.choiceChip, editProjectId === project.id && styles.choiceChipSelected, pressed && pressedStyle]}>
              <Text style={[styles.choiceText, editProjectId === project.id && styles.choiceTextSelected]}>{project.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <FieldLabel>PRIORIDAD</FieldLabel>
        <View style={styles.choiceRow}>
          {(['Alta', 'Media', 'Baja'] as TaskPriority[]).map((priority) => (
            <Pressable key={priority} onPress={() => { setEditPriority(priority); hapticSelection(); }} style={({ pressed }) => [styles.choiceChip, styles.choiceFlex, editPriority === priority && styles.choiceChipSelected, pressed && pressedStyle]}>
              <Text style={[styles.choiceText, editPriority === priority && styles.choiceTextSelected]}>{priority}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.toggleRow}>
          <Pressable onPress={() => { setEditInProgress((value) => !value); hapticSelection(); }} style={({ pressed }) => [styles.toggleCard, editInProgress && styles.toggleCardActive, pressed && pressedStyle]}>
            <FocoIcon name="circle" size={21} color={editInProgress ? foco.colors.bg : foco.colors.muted} />
            <Text style={[styles.toggleText, editInProgress && styles.toggleTextActive]}>En curso</Text>
          </Pressable>
          <Pressable onPress={() => { setEditFavorite((value) => !value); hapticSelection(); }} style={({ pressed }) => [styles.toggleCard, editFavorite && styles.toggleCardActive, pressed && pressedStyle]}>
            <FocoIcon name="star" size={21} color={editFavorite ? foco.colors.bg : foco.colors.muted} />
            <Text style={[styles.toggleText, editFavorite && styles.toggleTextActive]}>Favorita</Text>
          </Pressable>
        </View>
      </FocoSheet>

      {undo ? <UndoBar message={undo.message} onAction={undoLast} /> : null}
    </KeyboardAvoidingView>
  );
}

function Metric({ icon, value, label }: { icon: 'clock' | 'list' | 'circle' | 'check'; value: string; label: string }) {
  return (
    <View style={styles.metricItem}>
      <FocoIcon name={icon} size={23} color={foco.colors.muted} strokeWidth={1.65} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  flex: { flex: 1 },
  storageWarning: { marginTop: 14, borderRadius: 14, borderWidth: 1, borderColor: '#604047', backgroundColor: '#241719', padding: 12 },
  storageWarningText: { color: '#EBC0C5', fontSize: 12.5, lineHeight: 18 },
  metrics: { marginTop: 24, height: 126, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  metricItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 7 },
  metricValue: { color: foco.colors.text, fontSize: 24, lineHeight: 27, fontWeight: '600' },
  metricLabel: { color: foco.colors.muted, fontSize: 11.5 },
  divider: { width: 1, height: 74, backgroundColor: foco.colors.border },
  quickAdd: { marginTop: 14, minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15 },
  input: { flex: 1, color: foco.colors.text, fontSize: 18, paddingVertical: 14 },
  inlineSave: { width: 38, height: 38, borderRadius: 19, backgroundColor: foco.colors.text, alignItems: 'center', justifyContent: 'center' },
  planLink: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 2 },
  planText: { color: foco.colors.muted, fontSize: 15 },
  focusCard: { height: 180, flexDirection: 'row', overflow: 'hidden', ...shadowGlow },
  focusCopy: { flex: 1, paddingLeft: 20, paddingVertical: 18, zIndex: 2 },
  focusTitle: { color: foco.colors.text, fontSize: 18, fontWeight: '600' },
  focusProject: { color: foco.colors.muted, fontSize: 14.5, marginTop: 6 },
  focusTime: { color: foco.colors.text, fontSize: 44, lineHeight: 48, fontWeight: '300', marginTop: 16, letterSpacing: -1.2 },
  focusGoal: { color: foco.colors.muted, fontSize: 14.5, marginTop: 2 },
  focusVisual: { width: 150, alignItems: 'center', justifyContent: 'center' },
  orbitOuter: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: '#292C33' },
  orbitInner: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: '#34373E' },
  playButton: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  filterButton: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center' },
  filterButtonActive: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  taskList: { gap: 8 },
  taskRow: { minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.borderSoft, backgroundColor: foco.colors.panel, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center' },
  taskCheck: { width: 48, height: 58, alignItems: 'center', justifyContent: 'center' },
  taskCopy: { flex: 1, paddingVertical: 13 },
  taskCopyPressed: { opacity: 0.72 },
  taskTitle: { color: foco.colors.text, fontSize: 16.5, fontWeight: '500' },
  taskMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 5 },
  taskProject: { color: foco.colors.muted, fontSize: 13 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A2A5AB' },
  priorityHigh: { borderWidth: 1.5, borderColor: foco.colors.accent, backgroundColor: 'transparent' },
  priorityMedium: { borderWidth: 1.5, borderColor: '#C9972A', backgroundColor: 'transparent' },
  taskPriority: { color: foco.colors.muted, fontSize: 13 },
  inProgress: { color: foco.colors.text, fontSize: 10.5, borderWidth: 1, borderColor: foco.colors.border, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  trailing: { width: 48, height: 58, alignItems: 'center', justifyContent: 'center' },
  emptyState: { minHeight: 150, alignItems: 'center', justifyContent: 'center', padding: 22 },
  emptyTitle: { color: foco.colors.text, fontSize: 17, fontWeight: '600', marginTop: 12 },
  emptyCopy: { color: foco.colors.muted, fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: 6 },
  sheetOptions: { gap: 9, paddingBottom: 10 },
  sheetOption: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sheetOptionSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  sheetOptionText: { color: foco.colors.text, fontSize: 15.5 },
  sheetOptionTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  sheetInput: { minHeight: 54, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, color: foco.colors.text, paddingHorizontal: 15, fontSize: 16, marginBottom: 20 },
  choiceRow: { flexDirection: 'row', gap: 9, paddingBottom: 20 },
  choiceChip: { minHeight: 46, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  choiceChipSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  choiceText: { color: foco.colors.muted, fontSize: 14 },
  choiceTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  choiceFlex: { flex: 1 },
  toggleRow: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  toggleCard: { flex: 1, minHeight: 56, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  toggleCardActive: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  toggleText: { color: foco.colors.muted, fontSize: 14 },
  toggleTextActive: { color: foco.colors.bg, fontWeight: '600' },
});
