import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTaskScheduleLabel } from '@/src/core/agenda';
import type { Task } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { foco } from '@/src/ui/focoTheme';
import { pressedStyle } from '@/src/ui/premium';

export function TaskRow({ task, projectName, completedPomodoros = 0, onPress, onToggle }: { task: Task; projectName: string; completedPomodoros?: number; onPress: () => void; onToggle: () => void }) {
  const subtaskDone = task.subtasks.filter((subtask) => subtask.completed).length;
  const overdue = !task.completed && task.dueAt !== undefined && task.dueAt < new Date().setHours(0, 0, 0, 0);
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} accessibilityLabel={`${task.completed ? 'Reabrir' : 'Completar'} ${task.title}`} onPress={onToggle} style={({ pressed }) => [styles.check, pressed && pressedStyle]}>
        <View style={[styles.checkCircle, task.completed && styles.checkCircleDone]}>{task.completed ? <FocoIcon name="check" size={15} color={foco.colors.bg} strokeWidth={2.4} /> : null}</View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.content, pressed && styles.pressed]}>
        <View style={styles.titleLine}><Text style={[styles.title, task.completed && styles.titleDone]} numberOfLines={2}>{task.title}</Text>{task.favorite ? <FocoIcon name="star" size={16} color={foco.colors.text} /> : null}</View>
        <View style={styles.metaRow}><Text style={styles.project} numberOfLines={1}>{projectName}</Text><View style={styles.dot} /><Text style={[styles.schedule, overdue && styles.overdue]}>{getTaskScheduleLabel(task)}</Text>{task.estimatedPomodoros > 0 ? <><View style={styles.dot} /><Text style={styles.pomodoros}>{completedPomodoros}/{task.estimatedPomodoros} foco</Text></> : null}{task.subtasks.length > 0 ? <><View style={styles.dot} /><Text style={styles.pomodoros}>{subtaskDone}/{task.subtasks.length}</Text></> : null}</View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Opciones de ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.trailing, pressed && pressedStyle]}><FocoIcon name="chevron-right" size={17} color={foco.colors.subtle} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 72, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft },
  check: { width: 48, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 23, height: 23, borderRadius: 12, borderWidth: 1.5, borderColor: foco.colors.muted, alignItems: 'center', justifyContent: 'center' },
  checkCircleDone: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  content: { flex: 1, minWidth: 0, paddingVertical: 12 },
  pressed: { opacity: 0.7 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { flex: 1, color: foco.colors.text, fontSize: 16, lineHeight: 21, fontWeight: '500' },
  titleDone: { color: foco.colors.muted, textDecorationLine: 'line-through' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 5, marginTop: 5 },
  project: { color: foco.colors.muted, fontSize: 12.5, maxWidth: 108 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: foco.colors.subtle },
  schedule: { color: foco.colors.muted, fontSize: 12.5 },
  overdue: { color: '#D6A1A8' },
  pomodoros: { color: foco.colors.muted, fontSize: 12.5, fontVariant: ['tabular-nums'] },
  trailing: { width: 42, minHeight: 64, alignItems: 'center', justifyContent: 'center' },
});
