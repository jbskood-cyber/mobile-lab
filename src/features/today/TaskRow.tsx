import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typeScale } from '@/src/ui/theme';

import type { Task, TaskPriority } from './model';

type TaskRowProps = {
  task: Task;
  onToggle: (id: string) => void;
};

const priorityTone: Record<TaskPriority, string> = {
  Alta: colors.text,
  Media: colors.textMuted,
  Baja: colors.inactive,
};

export function TaskRow({ task, onToggle }: TaskRowProps) {
  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Marcar ${task.title} como ${task.completed ? 'pendiente' : 'completada'}`}
        accessibilityState={{ checked: task.completed }}
        hitSlop={8}
        onPress={() => onToggle(task.id)}
        style={({ pressed }) => [
          styles.checkbox,
          task.completed && styles.checkboxChecked,
          pressed && styles.pressed,
        ]}
      >
        {task.completed ? <Text style={styles.check}>✓</Text> : null}
      </Pressable>

      <View style={styles.copy}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{task.project}</Text>
          <View
            style={[
              styles.priorityDot,
              { backgroundColor: priorityTone[task.priority] },
            ]}
          />
          <Text style={styles.meta}>{task.priority}</Text>
          {task.inProgress ? (
            <Text style={styles.inProgress}>En curso</Text>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Más opciones para ${task.title}`}
        hitSlop={10}
        style={({ pressed }) => [styles.more, pressed && styles.pressed]}
      >
        <Text style={styles.moreText}>•••</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: 78,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.textSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    borderColor: colors.text,
    backgroundColor: colors.text,
  },
  check: {
    color: colors.black,
    fontSize: 16,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontSize: typeScale.bodyLarge,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  titleCompleted: {
    color: colors.textSubtle,
    textDecorationLine: 'line-through',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 5,
  },
  meta: {
    color: colors.textSubtle,
    fontSize: typeScale.caption,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inProgress: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radii.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  more: {
    width: 40,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  moreText: {
    color: colors.textSubtle,
    fontSize: 15,
    letterSpacing: 2,
  },
  pressed: {
    opacity: 0.68,
  },
});