import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { type RecurrenceKind, type RoutineTemplate, type TaskPriority } from '@/src/core/model';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSelection, hapticSuccess, pressedStyle } from '@/src/ui/premium';

const recurrence: Array<{ kind: RecurrenceKind; label: string }> = [
  { kind: 'daily', label: 'Diaria' },
  { kind: 'weekdays', label: 'Laborables' },
  { kind: 'weekly', label: 'Semanal' },
  { kind: 'monthly', label: 'Mensual' },
];
const priorities: TaskPriority[] = ['Alta', 'Media', 'Baja'];

export function RoutineEditorSheet({ visible, routine, onClose }: { visible: boolean; routine?: RoutineTemplate; onClose: () => void }) {
  const theme = useFocoTheme();
  const { state, addRoutine, updateRoutine } = useFocoStore();
  const projects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const [name, setName] = useState('');
  const [projectId, setProjectId] = useState('personal');
  const [priority, setPriority] = useState<TaskPriority>('Media');
  const [duration, setDuration] = useState('20');
  const [pomodoros, setPomodoros] = useState('1');
  const [kind, setKind] = useState<RecurrenceKind>('weekdays');
  const [fromCompletion, setFromCompletion] = useState(true);
  const [firstStep, setFirstStep] = useState('');
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState('');

  useEffect(() => {
    if (!visible) return;
    setName(routine?.name ?? '');
    setProjectId(routine?.projectId ?? projects[0]?.id ?? 'personal');
    setPriority(routine?.priority ?? 'Media');
    setDuration(String(routine?.durationMinutes ?? 20));
    setPomodoros(String(routine?.estimatedPomodoros ?? 1));
    setKind(routine?.recurrence.kind ?? 'weekdays');
    setFromCompletion(routine?.recurrence.fromCompletion ?? true);
    setFirstStep(routine?.firstStep ?? '');
    setNotes(routine?.notes ?? '');
    setSteps(routine?.subtasks.join('\n') ?? '');
  }, [projects, routine, visible]);

  const durationValue = Math.min(480, Math.max(5, Number.parseInt(duration, 10) || 0));
  const pomodoroValue = Math.min(24, Math.max(1, Number.parseInt(pomodoros, 10) || 0));
  const valid = Boolean(name.trim()) && durationValue >= 5 && pomodoroValue >= 1;

  const save = () => {
    if (!valid) return;
    const draft = {
      name,
      projectId,
      priority,
      notes,
      firstStep,
      durationMinutes: durationValue,
      estimatedPomodoros: pomodoroValue,
      recurrence: { kind, interval: 1, fromCompletion },
      subtasks: steps.split('\n').map((value) => value.trim()).filter(Boolean),
      paused: routine?.paused ?? false,
    };
    if (routine) updateRoutine(routine.id, draft);
    else addRoutine(draft);
    hapticSuccess();
    onClose();
  };

  return (
    <FocoSheet visible={visible} title={routine ? 'Editar rutina' : 'Nueva rutina'} subtitle="Una plantilla reusable que conserva su historial." onClose={onClose} footer={<><SheetButton label="Cancelar" variant="secondary" onPress={onClose} /><SheetButton label="Guardar" onPress={save} disabled={!valid} /></>}>
      <FieldLabel>NOMBRE</FieldLabel>
      <TextInput value={name} onChangeText={setName} placeholder="Ej. Inicio de día" placeholderTextColor={theme.colors.subtle} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]} />
      <FieldLabel>PROYECTO</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {projects.map((project) => <Chip key={project.id} label={project.name} active={projectId === project.id} onPress={() => setProjectId(project.id)} />)}
      </ScrollView>
      <FieldLabel>FRECUENCIA</FieldLabel>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {recurrence.map((option) => <Chip key={option.kind} label={option.label} active={kind === option.kind} onPress={() => setKind(option.kind)} />)}
      </ScrollView>
      <View style={styles.equal}><Chip label="Calendario" active={!fromCompletion} onPress={() => setFromCompletion(false)} flex /><Chip label="Desde completar" active={fromCompletion} onPress={() => setFromCompletion(true)} flex /></View>
      <FieldLabel>PRIORIDAD</FieldLabel>
      <View style={styles.equal}>{priorities.map((value) => <Chip key={value} label={value} active={priority === value} onPress={() => setPriority(value)} flex />)}</View>
      <View style={styles.twoColumns}>
        <View style={styles.column}><FieldLabel>DURACIÓN (MIN)</FieldLabel><TextInput value={duration} onChangeText={setDuration} keyboardType="number-pad" placeholder="20" placeholderTextColor={theme.colors.subtle} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]} /></View>
        <View style={styles.column}><FieldLabel>POMODOROS</FieldLabel><TextInput value={pomodoros} onChangeText={setPomodoros} keyboardType="number-pad" placeholder="1" placeholderTextColor={theme.colors.subtle} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]} /></View>
      </View>
      <FieldLabel>PRIMER PASO</FieldLabel>
      <TextInput value={firstStep} onChangeText={setFirstStep} placeholder="La acción que inicia la rutina" placeholderTextColor={theme.colors.subtle} style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]} />
      <FieldLabel>PASOS (UNO POR LÍNEA)</FieldLabel>
      <TextInput value={steps} onChangeText={setSteps} placeholder={'Preparar espacio\nAbrir materiales\nEmpezar'} placeholderTextColor={theme.colors.subtle} multiline textAlignVertical="top" style={[styles.input, styles.multiline, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]} />
      <FieldLabel>NOTAS</FieldLabel>
      <TextInput value={notes} onChangeText={setNotes} placeholder="Contexto opcional" placeholderTextColor={theme.colors.subtle} multiline textAlignVertical="top" style={[styles.input, styles.multiline, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]} />
    </FocoSheet>
  );
}

function Chip({ label, active, onPress, flex = false }: { label: string; active: boolean; onPress: () => void; flex?: boolean }) {
  const theme = useFocoTheme();
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={() => { onPress(); hapticSelection(); }} style={({ pressed }) => [styles.chip, flex && styles.flex, { backgroundColor: active ? theme.colors.inverse : 'transparent', borderColor: active ? theme.colors.inverse : theme.colors.border }, pressed && pressedStyle]}><Text style={[styles.chipText, { color: active ? theme.colors.inverseText : theme.colors.muted, fontFamily: active ? theme.fonts.semibold : theme.fonts.medium }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  input: { minHeight: 46, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, fontFamily: 'Manrope_400Regular', fontSize: 13.5, lineHeight: 18, marginBottom: 14 },
  multiline: { minHeight: 84, paddingTop: 10 },
  chips: { gap: 6, paddingBottom: 14 },
  equal: { flexDirection: 'row', gap: 6, marginBottom: 14 },
  chip: { minHeight: 40, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  chipText: { fontSize: 11.5, lineHeight: 15 },
  twoColumns: { flexDirection: 'row', gap: 8 },
  column: { flex: 1 },
});
