import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import type { Task } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { pressedStyle } from '@/src/ui/premium';

export function AgendaTaskBlock({ task, projectName, projectColor, completedPomodoros = 0, onPress, style }: {
  task: Task;
  projectName: string;
  projectColor: string;
  completedPomodoros?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useFocoTheme();
  const start = task.plannedStartAt ?? task.dueAt;
  const time = start ? new Date(start).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : 'Flexible';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${task.title}`} onPress={onPress} style={({ pressed }) => [styles.base, { backgroundColor: theme.colors.panel, borderColor: task.priority === 'Alta' ? theme.colors.danger : theme.colors.border, borderLeftColor: projectColor }, style, pressed && pressedStyle]}>
      <View style={styles.top}>
        <Text style={[styles.time, { color: projectColor }]}>{time}</Text>
        <Text style={[styles.duration, { color: theme.colors.muted }]}>{task.durationMinutes} min</Text>
      </View>
      <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{task.title}</Text>
      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: theme.colors.muted }]} numberOfLines={1}>{projectName}</Text>
        <View style={[styles.dot, { backgroundColor: projectColor }]} />
        <FocoIcon name="target" size={12} color={theme.colors.muted} />
        <Text style={[styles.metaText, { color: theme.colors.muted }]}>{completedPomodoros}/{task.estimatedPomodoros}</Text>
        {task.recurrence.kind !== 'none' ? <FocoIcon name="repeat" size={12} color={theme.colors.muted} /> : null}
        {task.reminderAt ? <FocoIcon name="bell" size={12} color={theme.colors.muted} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, borderLeftWidth: 2, paddingHorizontal: 10, paddingVertical: 7, overflow: 'hidden' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  time: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 10.5, lineHeight: 13, fontVariant: ['tabular-nums'] },
  duration: { fontFamily: 'InstrumentSans_500Medium', fontSize: 9.5, lineHeight: 12 },
  title: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 13, lineHeight: 17, marginTop: 2 },
  meta: { minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  metaText: { maxWidth: 100, fontFamily: 'InstrumentSans_400Regular', fontSize: 9.5, lineHeight: 12 },
  dot: { width: 4, height: 4, borderRadius: 2 },
});