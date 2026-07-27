import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getTaskScheduleLabel } from '@/src/core/agenda';
import type { Task } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { pressedStyle } from '@/src/ui/premium';

export function ProjectTaskAccordion({
  task,
  projectName,
  completedPomodoros = 0,
  expanded,
  onToggleExpanded,
  onToggleTask,
  onOpenDetails,
  onToggleSubtask,
  onAddSubtask,
}: {
  task: Task;
  projectName: string;
  completedPomodoros?: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleTask: () => void;
  onOpenDetails: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}) {
  const theme = useFocoTheme();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const subtaskDone = task.subtasks.filter((subtask) => subtask.completed).length;
  const anchor = task.plannedStartAt ?? task.dueAt;
  const overdue = !task.completed && !task.captured && anchor !== undefined && anchor < new Date().setHours(0, 0, 0, 0);

  const submitSubtask = () => {
    if (!draft.trim()) return;
    onAddSubtask(task.id, draft.trim());
    setDraft('');
    setAdding(false);
  };

  return (
    <View style={[styles.root, { borderBottomColor: theme.colors.borderSoft }]}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.completed }}
          accessibilityLabel={`${task.completed ? 'Reabrir' : 'Completar'} ${task.title}`}
          onPress={onToggleTask}
          style={({ pressed }) => [styles.check, pressed && pressedStyle]}
        >
          <View style={[styles.checkCircle, { borderColor: theme.colors.muted }, task.completed && { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse }]}>
            {task.completed ? <FocoIcon name="check" size={13} color={theme.colors.inverseText} strokeWidth={2.4} /> : null}
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Contraer' : 'Expandir'} ${task.title}`}
          accessibilityState={{ expanded }}
          onPress={onToggleExpanded}
          style={({ pressed }) => [styles.content, pressed && styles.pressed]}
        >
          <View style={styles.titleLine}>
            <Text style={[styles.title, { color: task.completed ? theme.colors.muted : theme.colors.text }]} numberOfLines={2}>{task.title}</Text>
            {task.favorite ? <FocoIcon name="star" size={14} color={theme.colors.text} /> : null}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: theme.colors.muted }]} numberOfLines={1}>{projectName}</Text>
            <MetaDot />
            <Text style={[styles.meta, { color: overdue ? theme.colors.danger : theme.colors.muted }]}>{getTaskScheduleLabel(task)}</Text>
            <MetaDot />
            <Text style={[styles.meta, { color: theme.colors.muted }]}>{task.durationMinutes}m</Text>
            {task.estimatedPomodoros > 0 ? <><MetaDot /><Text style={[styles.meta, { color: theme.colors.muted }]}>{completedPomodoros}/{task.estimatedPomodoros} foco</Text></> : null}
            {task.subtasks.length > 0 ? <><MetaDot /><Text style={[styles.meta, { color: theme.colors.muted }]}>{subtaskDone}/{task.subtasks.length} subtareas</Text></> : null}
          </View>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${expanded ? 'Contraer' : 'Expandir'} ${task.title}`}
          accessibilityState={{ expanded }}
          onPress={onToggleExpanded}
          style={({ pressed }) => [styles.trailing, pressed && pressedStyle]}
        >
          <FocoIcon name={expanded ? 'chevron-down' : 'chevron-right'} size={16} color={theme.colors.subtle} />
        </Pressable>
      </View>

      {expanded ? (
        <View style={[styles.expanded, { borderTopColor: theme.colors.borderSoft }]}>
          {task.subtasks.length > 0 ? (
            <View style={styles.subtasks}>
              <View style={styles.subtaskHeader}>
                <Text style={[styles.subtaskLabel, { color: theme.colors.muted }]}>SUBTAREAS</Text>
                <Text style={[styles.subtaskProgress, { color: theme.colors.muted }]}>{subtaskDone}/{task.subtasks.length}</Text>
              </View>
              {task.subtasks.map((subtask) => (
                <Pressable
                  key={subtask.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: subtask.completed }}
                  accessibilityLabel={`${subtask.completed ? 'Reabrir' : 'Completar'} subtarea ${subtask.title}`}
                  onPress={() => onToggleSubtask(task.id, subtask.id)}
                  style={({ pressed }) => [styles.subtaskRow, pressed && pressedStyle]}
                >
                  <View style={[styles.subtaskCheck, { borderColor: theme.colors.muted }, subtask.completed && { backgroundColor: theme.colors.inverse, borderColor: theme.colors.inverse }]}>
                    {subtask.completed ? <FocoIcon name="check" size={11} color={theme.colors.inverseText} strokeWidth={2.4} /> : null}
                  </View>
                  <Text style={[styles.subtaskTitle, { color: subtask.completed ? theme.colors.muted : theme.colors.text }]}>{subtask.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : <Text style={[styles.noSubtasks, { color: theme.colors.muted }]}>Sin subtareas todavía.</Text>}

          {adding ? (
            <View style={styles.addRow}>
              <TextInput
                autoFocus
                value={draft}
                onChangeText={setDraft}
                accessibilityLabel="Nueva subtarea"
                placeholder="Nueva subtarea"
                placeholderTextColor={theme.colors.subtle}
                returnKeyType="done"
                onSubmitEditing={submitSubtask}
                style={[styles.input, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]}
              />
              <Pressable accessibilityRole="button" accessibilityLabel="Cancelar nueva subtarea" onPress={() => { setAdding(false); setDraft(''); }} style={({ pressed }) => [styles.smallAction, pressed && pressedStyle]}><Text style={[styles.smallActionText, { color: theme.colors.muted }]}>Cancelar</Text></Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Agregar subtarea" disabled={!draft.trim()} onPress={submitSubtask} style={({ pressed }) => [styles.smallAction, pressed && pressedStyle]}><Text style={[styles.smallActionText, { color: draft.trim() ? theme.colors.text : theme.colors.inactive }]}>Agregar</Text></Pressable>
            </View>
          ) : (
            <Pressable accessibilityRole="button" accessibilityLabel={`Añadir subtarea a ${task.title}`} onPress={() => setAdding(true)} style={({ pressed }) => [styles.inlineAction, pressed && pressedStyle]}>
              <FocoIcon name="plus" size={15} color={theme.colors.text} />
              <Text style={[styles.inlineActionText, { color: theme.colors.text }]}>Añadir subtarea</Text>
            </Pressable>
          )}

          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir detalles de ${task.title}`} onPress={onOpenDetails} style={({ pressed }) => [styles.detailsAction, { borderTopColor: theme.colors.borderSoft }, pressed && pressedStyle]}>
            <Text style={[styles.detailsText, { color: theme.colors.muted }]}>Abrir detalles</Text>
            <FocoIcon name="chevron-right" size={15} color={theme.colors.subtle} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );

  function MetaDot() {
    return <View style={[styles.dot, { backgroundColor: theme.colors.subtle }]} />;
  }
}

const styles = StyleSheet.create({
  root: { borderBottomWidth: StyleSheet.hairlineWidth },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center' },
  check: { width: 44, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 21, height: 21, borderRadius: 11, borderWidth: 1.4, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0, paddingVertical: 9 },
  pressed: { opacity: 0.68 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { flex: 1, fontFamily: 'InstrumentSans_500Medium', fontSize: 14, lineHeight: 18 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginTop: 3 },
  meta: { maxWidth: 124, fontFamily: 'InstrumentSans_400Regular', fontSize: 9.8, lineHeight: 13, fontVariant: ['tabular-nums'] },
  dot: { width: 3, height: 3, borderRadius: 2 },
  trailing: { width: 38, minHeight: 56, alignItems: 'center', justifyContent: 'center' },
  expanded: { marginLeft: 44, paddingLeft: 10, paddingBottom: 8, borderTopWidth: StyleSheet.hairlineWidth },
  subtasks: { paddingTop: 7 },
  subtaskHeader: { minHeight: 26, flexDirection: 'row', alignItems: 'center', gap: 6 },
  subtaskLabel: { fontFamily: 'InstrumentSans_700Bold', fontSize: 9, lineHeight: 12, letterSpacing: 1.1 },
  subtaskProgress: { fontFamily: 'InstrumentSans_500Medium', fontSize: 9.5, lineHeight: 12, fontVariant: ['tabular-nums'] },
  subtaskRow: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 9, paddingRight: 6 },
  subtaskCheck: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.3, alignItems: 'center', justifyContent: 'center' },
  subtaskTitle: { flex: 1, fontFamily: 'InstrumentSans_400Regular', fontSize: 12, lineHeight: 16 },
  noSubtasks: { fontFamily: 'InstrumentSans_400Regular', fontSize: 10.5, lineHeight: 14, paddingTop: 9, paddingBottom: 4 },
  inlineAction: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 7, paddingRight: 6 },
  inlineActionText: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 11, lineHeight: 14 },
  addRow: { gap: 6, paddingTop: 7, paddingRight: 6 },
  input: { minHeight: 42, borderWidth: StyleSheet.hairlineWidth, borderRadius: 11, paddingHorizontal: 11, fontFamily: 'InstrumentSans_400Regular', fontSize: 12, lineHeight: 16 },
  smallAction: { alignSelf: 'flex-end', minHeight: 36, justifyContent: 'center', paddingHorizontal: 9 },
  smallActionText: { fontFamily: 'InstrumentSans_600SemiBold', fontSize: 10.5, lineHeight: 14 },
  detailsAction: { minHeight: 40, borderTopWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 6 },
  detailsText: { fontFamily: 'InstrumentSans_500Medium', fontSize: 10.5, lineHeight: 14 },
});
