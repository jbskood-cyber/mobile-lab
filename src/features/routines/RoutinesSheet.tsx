import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { atLocalTime, startOfLocalDay, type RoutineTemplate } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSuccess, pressedStyle } from '@/src/ui/premium';
import { RoutineEditorSheet } from './RoutineEditorSheet';

export function RoutinesSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useFocoTheme();
  const { state, toggleRoutinePaused, generateRoutineTask } = useFocoStore();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RoutineTemplate | undefined>();

  const openEditor = (routine?: RoutineTemplate) => {
    setEditing(routine);
    setEditorOpen(true);
  };

  const generate = (routine: RoutineTemplate) => {
    const nextHour = Math.min(state.planning.workdayEndHour - 1, Math.max(state.planning.workdayStartHour, new Date().getHours() + 1));
    const task = generateRoutineTask(routine.id, atLocalTime(startOfLocalDay(Date.now()), nextHour));
    if (task) hapticSuccess();
  };

  return (
    <>
      <FocoSheet visible={visible} title="Rutinas" subtitle="Plantillas que crean tareas recurrentes o cuando las necesitas." onClose={onClose} footer={<><SheetButton label="Cerrar" variant="secondary" onPress={onClose} /><SheetButton label="Nueva" onPress={() => openEditor()} /></>}>
        {state.routines.length === 0 ? <View style={styles.empty}><FocoIcon name="repeat" size={28} color={theme.colors.text} /><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Crea tu primera rutina</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>Define duración, foco y frecuencia; FOCO crea la tarea por ti.</Text></View> : state.routines.map((routine) => (
          <View key={routine.id} style={[styles.row, { borderBottomColor: theme.colors.borderSoft, opacity: routine.paused ? 0.58 : 1 }]}>
            <Pressable onPress={() => openEditor(routine)} style={({ pressed }) => [styles.copy, pressed && pressedStyle]}>
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{routine.name}</Text>
              <Text style={[styles.meta, { color: theme.colors.muted }]}>{routine.durationMinutes} min · {routine.estimatedPomodoros} foco · {recurrenceLabel(routine)}</Text>
              {routine.firstStep ? <Text style={[styles.firstStep, { color: theme.colors.subtle }]} numberOfLines={1}>{routine.firstStep}</Text> : null}
            </Pressable>
            <View style={styles.actions}>
              <Pressable accessibilityLabel={routine.paused ? `Reactivar ${routine.name}` : `Pausar ${routine.name}`} onPress={() => toggleRoutinePaused(routine.id)} style={({ pressed }) => [styles.icon, { borderColor: theme.colors.border }, pressed && pressedStyle]}><FocoIcon name={routine.paused ? 'play' : 'pause'} size={16} color={theme.colors.text} /></Pressable>
              <Pressable accessibilityLabel={`Crear tarea de ${routine.name} para hoy`} disabled={routine.paused} onPress={() => generate(routine)} style={({ pressed }) => [styles.generate, { backgroundColor: theme.colors.inverse }, routine.paused && styles.disabled, pressed && pressedStyle]}><FocoIcon name="plus" size={15} color={theme.colors.inverseText} /><Text style={[styles.generateText, { color: theme.colors.inverseText }]}>Crear hoy</Text></Pressable>
            </View>
          </View>
        ))}
      </FocoSheet>
      <RoutineEditorSheet visible={editorOpen} routine={editing} onClose={() => { setEditorOpen(false); setEditing(undefined); }} />
    </>
  );
}

function recurrenceLabel(routine: RoutineTemplate) {
  const label = ({ daily: 'diaria', weekdays: 'laborables', weekly: 'semanal', monthly: 'mensual', none: 'manual' } as const)[routine.recurrence.kind];
  return routine.recurrence.fromCompletion ? `${label}, desde completar` : label;
}

const styles = StyleSheet.create({
  row: { minHeight: 70, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  copy: { flex: 1, minHeight: 64, justifyContent: 'center', paddingRight: 8 },
  title: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 13.5, lineHeight: 18 },
  meta: { fontFamily: 'InstrumentSans_400Regular', fontSize: 10.5, lineHeight: 14, marginTop: 2 },
  firstStep: { fontFamily: 'InstrumentSans_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  icon: { width: 40, height: 40, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  generate: { minWidth: 76, height: 40, borderRadius: 20, paddingHorizontal: 11, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center' },
  generateText: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 9.5, lineHeight: 13 },
  disabled: { opacity: 0.3 },
  empty: { minHeight: 180, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  emptyTitle: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 15, lineHeight: 20, marginTop: 10 },
  emptyCopy: { fontFamily: 'InstrumentSans_400Regular', fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: 4 },
});