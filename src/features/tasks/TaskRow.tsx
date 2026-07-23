import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTaskScheduleLabel } from '@/src/core/agenda';
import type { Task } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { pressedStyle } from '@/src/ui/premium';

export function TaskRow({ task, projectName, completedPomodoros = 0, onPress, onToggle }: { task: Task; projectName: string; completedPomodoros?: number; onPress: () => void; onToggle: () => void }) {
  const theme = useFocoTheme();
  const subtaskDone = task.subtasks.filter((subtask) => subtask.completed).length;
  const anchor = task.plannedStartAt ?? task.dueAt;
  const overdue = !task.completed && !task.captured && anchor !== undefined && anchor < new Date().setHours(0, 0, 0, 0);
  return (
    <View style={[styles.row, { borderBottomColor: theme.colors.borderSoft }]}>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: task.completed }} accessibilityLabel={`${task.completed ? 'Reabrir' : 'Completar'} ${task.title}`} onPress={onToggle} style={({ pressed }) => [styles.check, pressed && pressedStyle]}>
        <View style={[styles.checkCircle, { borderColor: theme.colors.muted }, task.completed && { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse }]}>{task.completed ? <FocoIcon name="check" size={13} color={theme.colors.inverseText} strokeWidth={2.4} /> : null}</View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.content, pressed && styles.pressed]}>
        <View style={styles.titleLine}><Text style={[styles.title, { color: task.completed ? theme.colors.muted : theme.colors.text }]} numberOfLines={2}>{task.title}</Text>{task.favorite ? <FocoIcon name="star" size={14} color={theme.colors.text} /> : null}</View>
        <View style={styles.metaRow}>
          <Text style={[styles.meta, { color: theme.colors.muted }]} numberOfLines={1}>{projectName}</Text>
          <View style={[styles.dot, { backgroundColor: theme.colors.subtle }]} />
          <Text style={[styles.meta, { color: overdue ? theme.colors.danger : theme.colors.muted }]}>{getTaskScheduleLabel(task)}</Text>
          <View style={[styles.dot, { backgroundColor: theme.colors.subtle }]} />
          <Text style={[styles.meta, { color: theme.colors.muted }]}>{task.durationMinutes}m</Text>
          {task.estimatedPomodoros > 0 ? <><View style={[styles.dot, { backgroundColor: theme.colors.subtle }]} /><Text style={[styles.meta, { color: theme.colors.muted }]}>{completedPomodoros}/{task.estimatedPomodoros} foco</Text></> : null}
          {task.subtasks.length > 0 ? <><View style={[styles.dot, { backgroundColor: theme.colors.subtle }]} /><Text style={[styles.meta, { color: theme.colors.muted }]}>{subtaskDone}/{task.subtasks.length}</Text></> : null}
        </View>
      </Pressable>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.trailing, pressed && pressedStyle]}><FocoIcon name="chevron-right" size={16} color={theme.colors.subtle} /></Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  check: { width: 44, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.4, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0, paddingVertical: 9 },
  pressed: { opacity: 0.68 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 14, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { maxWidth: 112, fontFamily: 'Manrope_400Regular', fontSize: 9.8, lineHeight: 13, fontVariant: ['tabular-nums'] },
  dot: { width: 3, height: 3, borderRadius: 2 },
  trailing: { width: 38, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
});
