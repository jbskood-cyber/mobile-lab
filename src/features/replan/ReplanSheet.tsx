import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getReplanQueue } from '@/src/core/dayPlan';
import { useFocoStore } from '@/src/core/FocoStore';
import { atLocalTime, startOfLocalDay, type Task } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { NativeDateTimeField } from '@/src/ui/NativeDateTimeField';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { hapticSuccess, hapticWarning, pressedStyle } from '@/src/ui/premium';

export function ReplanSheet({ visible, onClose, onOpenTask }: { visible: boolean; onClose: () => void; onOpenTask: (task: Task) => void }) {
  const theme = useFocoTheme();
  const { state, completeTask, reopenTask, deleteTask, restoreTask, scheduleTask, moveTaskToInbox } = useFocoStore();
  const { showUndo } = useFocoUI();
  const queue = useMemo(() => getReplanQueue(state), [state]);
  const [customTask, setCustomTask] = useState<Task | undefined>();
  const [customDate, setCustomDate] = useState<number | undefined>();

  const move = (task: Task, dayOffset: number) => {
    const day = startOfLocalDay(Date.now()) + dayOffset * 86_400_000;
    const hour = task.plannedStartAt ? new Date(task.plannedStartAt).getHours() : 9;
    const minute = task.plannedStartAt ? new Date(task.plannedStartAt).getMinutes() : 0;
    scheduleTask(task.id, atLocalTime(day, hour, minute));
    hapticSuccess();
  };

  const complete = (task: Task) => {
    const result = completeTask(task.id);
    if (!result) return;
    hapticSuccess();
    showUndo(`${task.title} completada`, () => { reopenTask(task.id); if (result.generatedTask) deleteTask(result.generatedTask.id); });
  };

  const remove = (task: Task) => {
    deleteTask(task.id);
    hapticWarning();
    showUndo(`${task.title} eliminada`, () => restoreTask(task));
  };

  return (
    <FocoSheet visible={visible} title="Replanificar" subtitle={queue.length > 0 ? `${queue.length} pendientes necesitan una decisión.` : 'Tu plan está al día.'} onClose={onClose} footer={<SheetButton label="Cerrar" onPress={onClose} />}>
      {customTask ? (
        <View style={styles.custom}>
          <FieldLabel>NUEVA FECHA PARA {customTask.title.toUpperCase()}</FieldLabel>
          <NativeDateTimeField value={customDate} onChange={setCustomDate} minimumDate={Date.now()} />
          <View style={styles.customActions}>
            <SheetButton label="Cancelar" variant="secondary" onPress={() => { setCustomTask(undefined); setCustomDate(undefined); }} />
            <SheetButton label="Aplicar" disabled={!customDate} onPress={() => { if (customDate) scheduleTask(customTask.id, customDate); setCustomTask(undefined); setCustomDate(undefined); hapticSuccess(); }} />
          </View>
        </View>
      ) : null}
      {queue.length === 0 ? <View style={styles.empty}><FocoIcon name="check" size={25} color={theme.colors.success} /><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Nada que recuperar</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>Las tareas atrasadas aparecerán aquí sin moverse solas.</Text></View> : queue.map((task) => (
        <View key={task.id} style={[styles.row, { borderBottomColor: theme.colors.borderSoft }]}>
          <Pressable onPress={() => onOpenTask(task)} style={({ pressed }) => [styles.copy, pressed && pressedStyle]}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{task.title}</Text>
            <Text style={[styles.meta, { color: theme.colors.muted }]}>{task.durationMinutes} min · {task.priority} · {new Date(task.dueAt ?? task.plannedStartAt ?? Date.now()).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</Text>
          </Pressable>
          <View style={styles.actions}>
            <Action label="Hecha" icon="check" onPress={() => complete(task)} />
            <Action label="Hoy" icon="calendar" onPress={() => move(task, 0)} />
            <Action label="Mañana" icon="tomorrow" onPress={() => move(task, 1)} />
            <Action label="Fecha" icon="clock" onPress={() => { setCustomTask(task); setCustomDate(task.plannedStartAt ?? task.dueAt ?? Date.now()); }} />
            <Action label="Inbox" icon="inbox" onPress={() => { moveTaskToInbox(task.id); hapticSuccess(); }} />
            <Action label="Borrar" icon="trash" onPress={() => remove(task)} danger />
          </View>
        </View>
      ))}
    </FocoSheet>
  );
}

function Action({ label, icon, onPress, danger = false }: { label: string; icon: 'check' | 'calendar' | 'tomorrow' | 'clock' | 'inbox' | 'trash'; onPress: () => void; danger?: boolean }) {
  const theme = useFocoTheme();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.action, { borderColor: danger ? theme.colors.danger : theme.colors.border }, pressed && pressedStyle]}><FocoIcon name={icon} size={16} color={danger ? theme.colors.danger : theme.colors.text} /><Text style={[styles.actionText, { color: danger ? theme.colors.danger : theme.colors.muted }]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  custom: { paddingBottom: 14 },
  customActions: { flexDirection: 'row', gap: 8 },
  row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  copy: { minHeight: 44, justifyContent: 'center' },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, lineHeight: 18 },
  meta: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14, marginTop: 3 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 6 },
  action: { minHeight: 38, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8 },
  actionText: { fontFamily: 'Manrope_500Medium', fontSize: 9.5, lineHeight: 12 },
  empty: { minHeight: 160, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  emptyTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18, marginTop: 8 },
  emptyCopy: { fontFamily: 'Manrope_400Regular', fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: 3 },
});
