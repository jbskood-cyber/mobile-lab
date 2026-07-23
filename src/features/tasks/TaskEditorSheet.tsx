import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { type RecurrenceKind, type Subtask, type Task, type TaskPriority } from '@/src/core/model';
import { syncTaskReminder } from '@/src/platform/reminders';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { NativeDateTimeField } from '@/src/ui/NativeDateTimeField';
import { foco } from '@/src/ui/focoTheme';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';

const priorities: TaskPriority[] = ['Alta', 'Media', 'Baja'];
const recurrenceOptions: Array<{ value: RecurrenceKind; label: string }> = [
  { value: 'none', label: 'No repetir' },
  { value: 'daily', label: 'Diario' },
  { value: 'weekdays', label: 'Laborables' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
];

export function TaskEditorSheet({
  visible,
  task,
  defaultProjectId,
  defaultDueAt,
  onClose,
  onSaved,
}: {
  visible: boolean;
  task?: Task;
  defaultProjectId?: string;
  defaultDueAt?: number;
  onClose: () => void;
  onSaved?: (task: Task) => void;
}) {
  const { state, createTask, updateTaskDetails, setTaskNotificationId } = useFocoStore();
  const projects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(defaultProjectId ?? projects[0]?.id ?? 'personal');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  const [dueAt, setDueAt] = useState<number | undefined>(defaultDueAt);
  const [reminderAt, setReminderAt] = useState<number | undefined>();
  const [recurrence, setRecurrence] = useState<RecurrenceKind>('none');
  const [estimatedPomodoros, setEstimatedPomodoros] = useState(1);
  const [notes, setNotes] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [subtaskDraft, setSubtaskDraft] = useState('');

  useEffect(() => {
    if (!visible) return;
    const now = Date.now();
    setTitle(task?.title ?? '');
    setProjectId(task?.projectId ?? defaultProjectId ?? projects[0]?.id ?? 'personal');
    setPriority(task?.priority ?? 'Media');
    setDueAt(task?.dueAt ?? defaultDueAt);
    setReminderAt(task?.reminderAt);
    setRecurrence(task?.recurrence.kind ?? 'none');
    setEstimatedPomodoros(task?.estimatedPomodoros ?? 1);
    setNotes(task?.notes ?? '');
    setSubtasks(task?.subtasks.map((item) => ({ ...item })) ?? []);
    setSubtaskDraft('');
    if (!task && defaultDueAt === undefined) setDueAt(undefined);
    if (!task) setReminderAt(undefined);
    void now;
  }, [defaultDueAt, defaultProjectId, projects, task, visible]);

  const addDraftSubtask = () => {
    const normalized = subtaskDraft.trim();
    if (!normalized) return;
    const now = Date.now();
    setSubtasks((current) => [...current, { id: `draft-${now}-${current.length}`, title: normalized, completed: false, createdAt: now }]);
    setSubtaskDraft('');
    hapticSelection();
  };

  const save = () => {
    if (!title.trim()) return;
    const payload = {
      title,
      projectId,
      priority,
      dueAt,
      reminderAt,
      recurrence: { kind: recurrence, interval: 1 },
      estimatedPomodoros,
      notes,
      subtasks,
    };
    const saved = task
      ? updateTaskDetails(task.id, payload)
      : createTask(payload);
    if (!saved) return;
    void syncTaskReminder(task, saved).then((notificationId) => {
      setTaskNotificationId(saved.id, notificationId);
    });
    hapticSuccess();
    onSaved?.(saved);
    onClose();
  };

  return (
    <FocoSheet
      visible={visible}
      title={task ? 'Editar tarea' : 'Nueva tarea'}
      subtitle="Planifica solo lo necesario; podrás cambiarlo después."
      onClose={onClose}
      footer={<><SheetButton label="Cancelar" variant="secondary" onPress={onClose} /><SheetButton label={task ? 'Guardar' : 'Crear'} onPress={save} disabled={!title.trim()} /></>}
    >
      <FieldLabel>TÍTULO</FieldLabel>
      <TextInput
        autoFocus={!task}
        value={title}
        onChangeText={setTitle}
        placeholder="¿Qué necesitas hacer?"
        placeholderTextColor={foco.colors.subtle}
        autoCapitalize="sentences"
        returnKeyType="next"
        style={styles.input}
      />

      <FieldLabel>PROYECTO</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {projects.map((project) => (
          <ChoiceChip key={project.id} label={project.name} selected={projectId === project.id} onPress={() => setProjectId(project.id)} />
        ))}
      </ScrollView>

      <FieldLabel>FECHA Y HORA</FieldLabel>
      <NativeDateTimeField value={dueAt} onChange={setDueAt} accessibilityLabel="Fecha límite" />

      <FieldLabel>RECORDATORIO</FieldLabel>
      <NativeDateTimeField value={reminderAt} onChange={setReminderAt} minimumDate={Date.now()} accessibilityLabel="Recordatorio" />

      <FieldLabel>REPETICIÓN</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {recurrenceOptions.map((option) => (
          <ChoiceChip key={option.value} label={option.label} selected={recurrence === option.value} onPress={() => setRecurrence(option.value)} />
        ))}
      </ScrollView>

      <FieldLabel>PRIORIDAD</FieldLabel>
      <View style={styles.equalRow}>
        {priorities.map((item) => <ChoiceChip key={item} label={item} selected={priority === item} onPress={() => setPriority(item)} flex />)}
      </View>

      <FieldLabel>POMODOROS ESTIMADOS</FieldLabel>
      <View style={styles.stepper}>
        <Pressable accessibilityRole="button" accessibilityLabel="Reducir estimación" onPress={() => setEstimatedPomodoros((value) => Math.max(1, value - 1))} style={({ pressed }) => [styles.stepButton, pressed && pressedStyle]}><Text style={styles.stepSymbol}>−</Text></Pressable>
        <View style={styles.stepValue}><Text style={styles.stepNumber}>{estimatedPomodoros}</Text><Text style={styles.stepLabel}>{estimatedPomodoros === 1 ? 'bloque' : 'bloques'}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel="Aumentar estimación" onPress={() => setEstimatedPomodoros((value) => Math.min(24, value + 1))} style={({ pressed }) => [styles.stepButton, pressed && pressedStyle]}><Text style={styles.stepSymbol}>+</Text></Pressable>
      </View>

      <FieldLabel>SUBTAREAS</FieldLabel>
      <View style={styles.subtaskList}>
        {subtasks.map((subtask) => (
          <View key={subtask.id} style={styles.subtaskRow}>
            <Pressable onPress={() => setSubtasks((current) => current.map((item) => item.id === subtask.id ? { ...item, completed: !item.completed } : item))} style={({ pressed }) => [styles.subtaskCheck, pressed && pressedStyle]}>
              <View style={[styles.circle, subtask.completed && styles.circleDone]}>{subtask.completed ? <FocoIcon name="check" size={13} color={foco.colors.bg} /> : null}</View>
            </Pressable>
            <Text style={[styles.subtaskTitle, subtask.completed && styles.subtaskDone]}>{subtask.title}</Text>
            <Pressable accessibilityLabel={`Eliminar ${subtask.title}`} onPress={() => setSubtasks((current) => current.filter((item) => item.id !== subtask.id))} style={({ pressed }) => [styles.remove, pressed && pressedStyle]}><FocoIcon name="plus" size={17} color={foco.colors.muted} style={styles.closeIcon} /></Pressable>
          </View>
        ))}
        <View style={styles.subtaskInputRow}>
          <TextInput value={subtaskDraft} onChangeText={setSubtaskDraft} onSubmitEditing={addDraftSubtask} placeholder="Añadir paso" placeholderTextColor={foco.colors.subtle} returnKeyType="done" style={styles.subtaskInput} />
          <Pressable onPress={addDraftSubtask} disabled={!subtaskDraft.trim()} style={({ pressed }) => [styles.addSubtask, !subtaskDraft.trim() && styles.disabled, pressed && pressedStyle]}><FocoIcon name="plus" size={20} color={foco.colors.text} /></Pressable>
        </View>
      </View>

      <FieldLabel>NOTAS</FieldLabel>
      <TextInput
        value={notes}
        onChangeText={setNotes}
        placeholder="Contexto, enlaces o detalles"
        placeholderTextColor={foco.colors.subtle}
        multiline
        textAlignVertical="top"
        style={[styles.input, styles.notes]}
      />
    </FocoSheet>
  );
}

function ChoiceChip({ label, selected, onPress, flex = false }: { label: string; selected: boolean; onPress: () => void; flex?: boolean }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { onPress(); hapticSelection(); }} style={({ pressed }) => [styles.chip, flex && styles.chipFlex, selected && styles.chipSelected, pressed && pressedStyle]}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, color: foco.colors.text, paddingHorizontal: 14, fontSize: 16, marginBottom: 18 },
  notes: { minHeight: 110, paddingTop: 13 },
  chipRow: { gap: 8, paddingBottom: 18 },
  equalRow: { flexDirection: 'row', gap: 8, marginBottom: 18 },
  chip: { minHeight: 46, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  chipFlex: { flex: 1 },
  chipSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  chipText: { color: foco.colors.muted, fontSize: 13.5 },
  chipTextSelected: { color: foco.colors.bg, fontWeight: '700' },
  stepper: { minHeight: 60, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  stepButton: { width: 60, height: 58, alignItems: 'center', justifyContent: 'center' },
  stepSymbol: { color: foco.colors.text, fontSize: 25, fontWeight: '300' },
  stepValue: { flex: 1, alignItems: 'center' },
  stepNumber: { color: foco.colors.text, fontSize: 20, fontWeight: '650', fontVariant: ['tabular-nums'] },
  stepLabel: { color: foco.colors.muted, fontSize: 11.5, marginTop: 1 },
  subtaskList: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: foco.colors.borderSoft, marginBottom: 18 },
  subtaskRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  subtaskCheck: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.4, borderColor: foco.colors.muted, alignItems: 'center', justifyContent: 'center' },
  circleDone: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  subtaskTitle: { flex: 1, color: foco.colors.text, fontSize: 14.5 },
  subtaskDone: { color: foco.colors.muted, textDecorationLine: 'line-through' },
  remove: { width: 44, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  closeIcon: { transform: [{ rotate: '45deg' }] },
  subtaskInputRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52 },
  subtaskInput: { flex: 1, color: foco.colors.text, fontSize: 14.5, paddingHorizontal: 12 },
  addSubtask: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.35 },
});
