import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { atLocalTime, startOfLocalDay, type Task } from '@/src/core/model';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticSuccess, pressedStyle } from '@/src/ui/premium';

export function InboxSheet({ visible, onClose, onOpenTask }: { visible: boolean; onClose: () => void; onOpenTask: (task: Task) => void }) {
  const theme = useFocoTheme();
  const { state, createTask, scheduleTask } = useFocoStore();
  const [draft, setDraft] = useState('');
  const inbox = useMemo(() => state.tasks.filter((task) => task.captured && !task.completed).sort((a, b) => b.createdAt - a.createdAt), [state.tasks]);

  const capture = () => {
    if (!draft.trim()) return;
    const created = createTask({ title: draft, projectId: 'ideas', captured: true, durationMinutes: state.planning.defaultTaskDurationMinutes });
    if (!created) return;
    setDraft('');
    hapticSuccess();
  };

  const today = (task: Task) => {
    scheduleTask(task.id, atLocalTime(startOfLocalDay(Date.now()), 18));
    hapticSuccess();
  };

  return (
    <FocoSheet visible={visible} title="Inbox" subtitle="Captura primero. Decide después." onClose={onClose} footer={<SheetButton label="Cerrar" onPress={onClose} />}>
      <View style={[styles.capture, { backgroundColor: theme.colors.panel, borderColor: theme.colors.border }]}>
        <FocoIcon name="inbox" size={18} color={theme.colors.muted} />
        <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={capture} placeholder="Escribe lo que no quieres olvidar" placeholderTextColor={theme.colors.subtle} returnKeyType="done" style={[styles.input, { color: theme.colors.text }]} />
        <Pressable accessibilityLabel="Guardar en Inbox" disabled={!draft.trim()} onPress={capture} style={({ pressed }) => [styles.add, { backgroundColor: theme.colors.inverse }, !draft.trim() && styles.disabled, pressed && pressedStyle]}><FocoIcon name="plus" size={18} color={theme.colors.inverseText} /></Pressable>
      </View>
      <Text style={[styles.count, { color: theme.colors.muted }]}>{inbox.length} {inbox.length === 1 ? 'captura' : 'capturas'}</Text>
      {inbox.length === 0 ? <View style={styles.empty}><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>Inbox vacío</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>Las ideas rápidas aparecerán aquí hasta que las planifiques.</Text></View> : inbox.map((task) => (
        <View key={task.id} style={[styles.row, { borderBottomColor: theme.colors.borderSoft }]}>
          <Pressable onPress={() => onOpenTask(task)} style={({ pressed }) => [styles.copy, pressed && pressedStyle]}>
            <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={2}>{task.title}</Text>
            <Text style={[styles.meta, { color: theme.colors.muted }]}>{task.durationMinutes} min · {state.projects.find((project) => project.id === task.projectId)?.name ?? 'Sin proyecto'}</Text>
          </Pressable>
          <Pressable accessibilityLabel={`Planificar ${task.title} para hoy`} onPress={() => today(task)} style={({ pressed }) => [styles.today, { borderColor: theme.colors.border }, pressed && pressedStyle]}><FocoIcon name="calendar" size={16} color={theme.colors.text} /><Text style={[styles.todayText, { color: theme.colors.text }]}>Hoy</Text></Pressable>
        </View>
      ))}
    </FocoSheet>
  );
}

const styles = StyleSheet.create({
  capture: { minHeight: 48, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', paddingLeft: 11 },
  input: { flex: 1, fontFamily: 'Manrope_400Regular', fontSize: 13.5, lineHeight: 18, paddingHorizontal: 9, paddingVertical: 10 },
  add: { width: 36, height: 36, marginRight: 5, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.3 },
  count: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, lineHeight: 14, marginTop: 10, marginBottom: 2 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth },
  copy: { flex: 1, minHeight: 54, justifyContent: 'center', paddingRight: 8 },
  title: { fontFamily: 'Manrope_600SemiBold', fontSize: 13.5, lineHeight: 18 },
  meta: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 14, marginTop: 2 },
  today: { minHeight: 40, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9 },
  todayText: { fontFamily: 'Manrope_600SemiBold', fontSize: 10.5, lineHeight: 14 },
  empty: { minHeight: 140, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 26 },
  emptyTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
  emptyCopy: { fontFamily: 'Manrope_400Regular', fontSize: 11.5, lineHeight: 16, textAlign: 'center', marginTop: 3 },
});
