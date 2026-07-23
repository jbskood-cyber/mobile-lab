import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { type RecurrenceKind, type Subtask, type Task, type TaskPriority } from '@/src/core/model';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { NativeDateTimeField } from '@/src/ui/NativeDateTimeField';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';
import type { FocoTheme } from '@/src/ui/themeTokens';

const priorities: TaskPriority[] = ['Alta', 'Media', 'Baja'];
const recurrenceOptions: Array<{ value: RecurrenceKind; label: string }> = [
  { value: 'none', label: 'No repetir' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekdays', label: 'Laborables' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
];

export function TaskEditorSheet({ visible, task, defaultProjectId, defaultDueAt, defaultPlannedStartAt, onClose, onSaved }: {
  visible: boolean;
  task?: Task;
  defaultProjectId?: string;
  defaultDueAt?: number;
  defaultPlannedStartAt?: number;
  onClose: () => void;
  onSaved?: (task: Task) => void;
}) {
  const theme = useFocoTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { state, createTask, updateTaskDetails } = useFocoStore();
  const projects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? 'personal');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  const [captured, setCaptured] = useState(false);
  const [plannedStartAt, setPlannedStartAt] = useState<number | undefined>(defaultPlannedStartAt);
  const [dueAt, setDueAt] = useState<number | undefined>(defaultDueAt);
  const [reminderAt, setReminderAt] = useState<number | undefined>();
  const [recurrence, setRecurrence] = useState<RecurrenceKind>('none');
  const [fromCompletion, setFromCompletion] = useState(false);
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(state.planning.defaultTaskDurationMinutes);
  const [firstStep, setFirstStep] = useState('');
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  useEffect(() => {
    if (!visible) return;
    setTitle(task?.title ?? '');
    setProjectId(task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? 'personal');
    setPriority(task?.priority ?? 'Media');
    setCaptured(task?.captured ?? (defaultDueAt === undefined && defaultPlannedStartAt === undefined));
    setPlannedStartAt(task?.plannedStartAt ?? defaultPlannedStartAt);
    setDueAt(task?.dueAt ?? defaultDueAt);
    setReminderAt(task?.reminderAt);
    setRecurrence(task?.recurrence.kind ?? 'none');
    setFromCompletion(task?.recurrence.fromCompletion ?? false);
    setEstimatedPomodoros(task?.estimatedPomodoros ?? 1);
    setDurationMinutes(task?.durationMinutes ?? state.planning.defaultTaskDurationMinutes);
    setFirstStep(task?.firstStep ?? '');
    setNotes(task?.notes ?? '');
    setSubtasks(task?.subtasks.map((item) => ({ ...item })) ?? []);
    setSubtaskDraft('');
  }, [defaultDueAt, defaultPlannedStartAt, defaultProjectId, projects, state.planning.defaultTaskDurationMinutes, task, visible]);

  const deadline = dueAt ?? plannedStartAt;
  const reminderInvalid = !captured && reminderAt !== undefined && deadline !== undefined && reminderAt > deadline;

  const addDraftSubtask = () => {
    const normalized = subtaskDraft.trim();
    if (!normalized) return;
    const now = Date.now();
    setSubtasks((current) => [...current, { id: `draft-${now}-${current.length}`, title: normalized, completed: false, createdAt: now }]);
    setSubtaskDraft('');
    hapticSelection();
  };

  const save = () => {
    if (!title.trim() || reminderInvalid) return;
    const payload = {
      title,
      projectId,
      priority,
      captured,
      plannedStartAt: captured ? undefined : plannedStartAt,
      dueAt: captured ? undefined : dueAt,
      reminderAt: captured ? undefined : reminderAt,
      recurrence: { kind: recurrence, interval: 1, fromCompletion },
      estimatedPomodoros,
      durationMinutes,
      firstStep,
      notes,
      subtasks,
    };
    const saved = task ? updateTaskDetails(task.id, payload) : createTask(payload);
    if (!saved) return;
    hapticSuccess();
    onSaved?.(saved);
    onClose();
  };

  return (
    <FocoSheet visible={visible} title={task ? 'Editar tarea' : 'Nueva tarea'} subtitle="Captura rápido o planifica con detalle." onClose={onClose} footer={<><SheetButton label="Cancelar" variant="secondary" onPress={onClose} /><SheetButton label={task ? 'Guardar' : 'Crear'} onPress={save} disabled={!title.trim() || reminderInvalid} /></>}>
      <FieldLabel>TÍTULO</FieldLabel>
      <TextInput autoFocus={!task} value={title} onChangeText={setTitle} placeholder="¿Qué necesitas hacer?" placeholderTextColor={theme.colors.subtle} autoCapitalize="sentences" returnKeyType="next" style={styles.input} />

      <FieldLabel>PROYECTO</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {projects.map((project) => <ChoiceChip key={project.id} label={project.name} selected={projectId === project.id} onPress={() => setProjectId(project.id)} />)}
      </ScrollView>

      <FieldLabel>DESTINO</FieldLabel>
      <View style={styles.equalRow}>
        <ChoiceChip label="Inbox" selected={captured} onPress={() => setCaptured(true)} flex />
        <ChoiceChip label="Planificada" selected={!captured} onPress={() => setCaptured(false)} flex />
      </View>

      {!captured ? (
        <>
          <FieldLabel>EMPIEZA</FieldLabel>
          <NativeDateTimeField value={plannedStartAt} onChange={setPlannedStartAt} accessibilityLabel="Inicio planificado" />
          <FieldLabel>FECHA LÍMITE</FieldLabel>
          <NativeDateTimeField value={dueAt} onChange={setDueAt} accessibilityLabel="Fecha límite" />
          <FieldLabel>DURACIÓN</FieldLabel>
          <Stepper value={durationMinutes} label="minutos" min={5} max={480} step={5} onChange={setDurationMinutes} />
          <FieldLabel>RECORDATORIO</FieldLabel>
          <NativeDateTimeField value={reminderAt} onChange={setReminderAt} minimumDate={Date.now()} accessibilityLabel="Recordatorio" />
          {reminderInvalid ? <Text accessibilityLiveRegion="polite" style={styles.error}>El recordatorio debe ocurrir antes del inicio o vencimiento.</Text> : null}
        </>
      ) : null}

      <FieldLabel>REPETICIÓN</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {recurrenceOptions.map((option) => <ChoiceChip key={option.value} label={option.label} selected={recurrence === option.value} onPress={() => setRecurrence(option.value)} />)}
      </ScrollView>
      {recurrence !== 'none' ? (
        <View style={styles.equalRow}>
          <ChoiceChip label="Según calendario" selected={!fromCompletion} onPress={() => setFromCompletion(false)} flex />
          <ChoiceChip label="Desde completar" selected={fromCompletion} onPress={() => setFromCompletion(true)} flex />
        </View>
      ) : null}

      <FieldLabel>PRIORIDAD</FieldLabel>
      <View style={styles.equalRow}>{priorities.map((item) => <ChoiceChip key={item} label={item} selected={priority === item} onPress={() => setPriority(item)} flex />)}</View>

      <FieldLabel>POMODOROS ESTIMADOS</FieldLabel>
      <Stepper value={estimatedPomodoros} label={estimatedPomodoros === 1 ? 'bloque' : 'bloques'} min={1} max={24} step={1} onChange={setEstimatedPomodoros} />

      <FieldLabel>PRIMER PASO</FieldLabel>
      <TextInput value={firstStep} onChangeText={setFirstStep} placeholder="Una acción concreta para empezar" placeholderTextColor={theme.colors.subtle} style={styles.input} />

      <FieldLabel>SUBTAREAS</FieldLabel>
      <View style={styles.subtaskList}>
        {subtasks.map((subtask) => (
          <View key={subtask.id} style={styles.subtaskRow}>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: subtask.completed }} onPress={() => setSubtasks((current) => current.map((item) => item.id === subtask.id ? { ...item, completed: !item.completed } : item))} style={({ pressed }) => [styles.subtaskCheck, pressed && pressedStyle]}>
              <View style={[styles.circle, subtask.completed && styles.circleDone]}>{subtask.completed ? <FocoIcon name="check" size={12} color={theme.colors.inverseText} /> : null}</View>
            </Pressable>
            <Text style={[styles.subtaskTitle, subtask.completed && styles.subtaskDone]}>{subtask.title}</Text>
            <Pressable accessibilityLabel={`Eliminar ${subtask.title}`} onPress={() => setSubtasks((current) => current.filter((item) => item.id !== subtask.id))} style={({ pressed }) => [styles.remove, pressed && pressedStyle]}><FocoIcon name="plus" size={16} color={theme.colors.muted} style={styles.closeIcon} /></Pressable>
          </View>
        ))}
        <View style={styles.subtaskInputRow}>
          <TextInput value={subtaskDraft} onChangeText={setSubtaskDraft} onSubmitEditing={addDraftSubtask} placeholder="Añadir paso" placeholderTextColor={theme.colors.subtle} returnKeyType="done" style={styles.subtaskInput} />
          <Pressable accessibilityLabel="Añadir subtarea" onPress={addDraftSubtask} disabled={!subtaskDraft.trim()} style={({ pressed }) => [styles.addSubtask, !subtaskDraft.trim() && styles.disabled, pressed && pressedStyle]}><FocoIcon name="plus" size={19} color={theme.colors.text} /></Pressable>
        </View>
      </View>

      <FieldLabel>NOTAS</FieldLabel>
      <TextInput value={notes} onChangeText={setNotes} placeholder="Contexto, enlaces o detalles" placeholderTextColor={theme.colors.subtle} multiline textAlignVertical="top" style={[styles.input, styles.notes]} />
    </FocoSheet>
  );
}

function ChoiceChip({ label, selected, onPress, flex = false }: { label: string; selected: boolean; onPress: () => void; flex?: boolean }) {
  const theme = useFocoTheme();
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { onPress(); hapticSelection(); }} style={({ pressed }) => [stylesStatic.chip, flex && stylesStatic.chipFlex, { borderColor: selected ? theme.colors.inverse : theme.colors.border, backgroundColor: selected ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><Text style={[stylesStatic.chipText, { color: selected ? theme.colors.inverseText : theme.colors.muted, fontFamily: selected ? theme.fonts.semibold : theme.fonts.medium }]}>{label}</Text></Pressable>;
}

function Stepper({ value, label, min, max, step, onChange }: { value: number; label: string; min: number; max: number; step: number; onChange: (value: number) => void }) {
  const theme = useFocoTheme();
  return (
    <View style={[stylesStatic.stepper, { borderColor: theme.colors.border }]}> 
      <Pressable accessibilityRole="button" accessibilityLabel="Reducir" onPress={() => onChange(Math.max(min, value - step))} style={({ pressed }) => [stylesStatic.stepButton, pressed && pressedStyle]}><Text style={[stylesStatic.stepSymbol, { color: theme.colors.text }]}>−</Text></Pressable>
      <View style={stylesStatic.stepValue}><Text style={[stylesStatic.stepNumber, { color: theme.colors.text }]}>{value}</Text><Text style={[stylesStatic.stepLabel, { color: theme.colors.muted }]}>{label}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Aumentar" onPress={() => onChange(Math.min(max, value + step))} style={({ pressed }) => [stylesStatic.stepButton, pressed && pressedStyle]}><Text style={[stylesStatic.stepSymbol, { color: theme.colors.text }]}>+</Text></Pressable>
    </View>
  );
}

function makeStyles(theme: FocoTheme) {
  return StyleSheet.create({
    input: { minHeight: 46, borderRadius: theme.radius.control, borderWidth: StyleSheet.hairlineWidth, borderColor: theme.colors.border, backgroundColor: theme.colors.panel, color: theme.colors.text, paddingHorizontal: 12, fontFamily: theme.fonts.regular, fontSize: 14, lineHeight: 19, marginBottom: 14 },
    notes: { minHeight: 92, paddingTop: 11 },
    error: { color: theme.colors.danger, fontFamily: theme.fonts.medium, fontSize: 11, lineHeight: 15, marginTop: -9, marginBottom: 14 },
    chipRow: { gap: 6, paddingBottom: 14 },
    equalRow: { flexDirection: 'row', gap: 6, marginBottom: 14 },
    subtaskList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.colors.borderSoft, marginBottom: 14 },
    subtaskRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.borderSoft },
    subtaskCheck: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    circle: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.3, borderColor: theme.colors.muted, alignItems: 'center', justifyContent: 'center' },
    circleDone: { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse },
    subtaskTitle: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: 13.5, lineHeight: 18 },
    subtaskDone: { color: theme.colors.muted, textDecorationLine: 'line-through' },
    remove: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    closeIcon: { transform: [{ rotate: '45deg' }] },
    subtaskInputRow: { flexDirection: 'row', alignItems: 'center', minHeight: 46 },
    subtaskInput: { flex: 1, color: theme.colors.text, fontFamily: theme.fonts.regular, fontSize: 13.5, lineHeight: 18, paddingHorizontal: 10 },
    addSubtask: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    disabled: { opacity: 0.35 },
  });
}

const stylesStatic = StyleSheet.create({
  chip: { minHeight: 40, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  chipFlex: { flex: 1 },
  chipText: { fontSize: 11.5, lineHeight: 15 },
  stepper: { minHeight: 52, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  stepButton: { width: 52, height: 50, alignItems: 'center', justifyContent: 'center' },
  stepSymbol: { fontFamily: 'Manrope_400Regular', fontSize: 22, lineHeight: 26 },
  stepValue: { flex: 1, alignItems: 'center' },
  stepNumber: { fontFamily: 'Manrope_600SemiBold', fontSize: 17, lineHeight: 21, fontVariant: ['tabular-nums'] },
  stepLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 12, marginTop: 1 },
});
