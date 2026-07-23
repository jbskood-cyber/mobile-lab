import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, SectionTitle, Surface } from '@/src/ui/FocoShell';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco, shadowGlow } from '@/src/ui/focoTheme';

import { addTask, createInitialTasks, getTodayMetrics, toggleTask } from './model';

const weekdays = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function getTodayLabel() {
  const now = new Date();
  const label = `${weekdays[now.getDay()] ?? ''}, ${now.getDate()} de ${months[now.getMonth()] ?? ''}`;
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function TodayScreen() {
  const [tasks, setTasks] = useState(createInitialTasks);
  const [draft, setDraft] = useState('');
  const metrics = useMemo(() => getTodayMetrics(tasks), [tasks]);
  const openTasks = useMemo(() => tasks.filter((task) => !task.completed), [tasks]);

  const submitTask = () => {
    setTasks((current) => addTask(current, draft));
    if (draft.trim()) setDraft('');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
      <FocoScreen title="Hoy" subtitle={getTodayLabel()} rightIcon="calendar">
        <Surface style={styles.metrics}>
          <Metric icon="clock" value="02:55" label="Tiempo foco" />
          <Divider />
          <Metric icon="list" value={String(metrics.pending)} label="Pendientes" />
          <Divider />
          <Metric icon="circle" value={String(metrics.active)} label="En curso" />
          <Divider />
          <Metric icon="check" value={String(metrics.completed)} label="Completadas" />
        </Surface>

        <Surface style={styles.quickAdd}>
          <FocoIcon name="plus" size={26} color={foco.colors.muted} />
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={submitTask}
            returnKeyType="done"
            placeholder="Añadir tarea"
            placeholderTextColor={foco.colors.subtle}
            style={styles.input}
            accessibilityLabel="Añadir tarea"
          />
        </Surface>

        <SectionTitle
          title="Enfoque de hoy"
          action={
            <Pressable accessibilityRole="button" accessibilityLabel="Ver plan" style={styles.planLink}>
              <Text style={styles.planText}>Ver plan</Text>
              <FocoIcon name="chevron-right" size={16} color={foco.colors.muted} />
            </Pressable>
          }
        />

        <Surface style={styles.focusCard}>
          <View style={styles.focusCopy}>
            <Text style={styles.focusTitle}>Bloque 2 · Transformación</Text>
            <Text style={styles.focusProject}>Plan maestro</Text>
            <Text style={styles.focusTime}>24:36</Text>
            <Text style={styles.focusGoal}>Objetivo: 3 bloques</Text>
          </View>
          <View style={styles.focusVisual}>
            <View style={styles.orbitOuter} />
            <View style={styles.orbitInner} />
            <Pressable accessibilityRole="button" accessibilityLabel="Iniciar enfoque" style={styles.playButton}>
              <ProgressRing size={76} strokeWidth={1.5} progress={0.82} color={foco.colors.white} trackColor="#454951" glow>
                <FocoIcon name="play" size={30} color={foco.colors.white} />
              </ProgressRing>
            </Pressable>
          </View>
        </Surface>

        <SectionTitle
          title="Tareas"
          detail={`${openTasks.length} pendientes`}
          action={
            <Pressable accessibilityRole="button" accessibilityLabel="Filtrar tareas" style={styles.filterButton}>
              <FocoIcon name="filter" size={19} color={foco.colors.muted} />
            </Pressable>
          }
        />

        <View style={styles.taskList}>
          {openTasks.map((task, index) => (
            <Pressable
              key={task.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: task.completed }}
              accessibilityLabel={`Completar ${task.title}`}
              onPress={() => setTasks((current) => toggleTask(current, task.id))}
              style={({ pressed }) => [styles.taskRow, pressed && styles.pressed]}
            >
              <View style={styles.taskCheck}><FocoIcon name="circle" size={27} color={foco.colors.subtle} strokeWidth={1.55} /></View>
              <View style={styles.taskCopy}>
                <Text style={styles.taskTitle} numberOfLines={1}>{task.title}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskProject}>{task.project}</Text>
                  <View style={[styles.priorityDot, task.priority === 'Alta' && styles.priorityHigh, task.priority === 'Media' && styles.priorityMedium]} />
                  <Text style={styles.taskPriority}>{task.priority}</Text>
                </View>
              </View>
              <FocoIcon name={index === 1 || index === 4 ? 'star' : 'more'} size={20} color={foco.colors.subtle} strokeWidth={1.45} />
            </Pressable>
          ))}
        </View>
      </FocoScreen>
    </KeyboardAvoidingView>
  );
}

function Metric({ icon, value, label }: { icon: 'clock' | 'list' | 'circle' | 'check'; value: string; label: string }) {
  return (
    <View style={styles.metricItem}>
      <FocoIcon name={icon} size={23} color={foco.colors.muted} strokeWidth={1.65} />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel} numberOfLines={1}>{label}</Text>
    </View>
  );
}

function Divider() { return <View style={styles.divider} />; }

const styles = StyleSheet.create({
  flex: { flex: 1 },
  metrics: { marginTop: 24, height: 126, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  metricItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 7 },
  metricValue: { color: foco.colors.text, fontSize: 24, lineHeight: 27, fontWeight: '600' },
  metricLabel: { color: foco.colors.muted, fontSize: 11.5 },
  divider: { width: 1, height: 74, backgroundColor: foco.colors.border },
  quickAdd: { marginTop: 14, minHeight: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 15 },
  input: { flex: 1, color: foco.colors.text, fontSize: 18, paddingVertical: 14 },
  planLink: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 2 },
  planText: { color: foco.colors.muted, fontSize: 15 },
  focusCard: { height: 180, flexDirection: 'row', overflow: 'hidden', ...shadowGlow },
  focusCopy: { flex: 1, paddingLeft: 20, paddingVertical: 18, zIndex: 2 },
  focusTitle: { color: foco.colors.text, fontSize: 18, fontWeight: '600' },
  focusProject: { color: foco.colors.muted, fontSize: 14.5, marginTop: 6 },
  focusTime: { color: foco.colors.text, fontSize: 44, lineHeight: 48, fontWeight: '300', marginTop: 16, letterSpacing: -1.2 },
  focusGoal: { color: foco.colors.muted, fontSize: 14.5, marginTop: 2 },
  focusVisual: { width: 150, alignItems: 'center', justifyContent: 'center' },
  orbitOuter: { position: 'absolute', width: 190, height: 190, borderRadius: 95, borderWidth: 1, borderColor: '#292C33' },
  orbitInner: { position: 'absolute', width: 130, height: 130, borderRadius: 65, borderWidth: 1, borderColor: '#34373E' },
  playButton: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  filterButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center' },
  taskList: { gap: 8 },
  taskRow: { minHeight: 78, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.borderSoft, backgroundColor: foco.colors.panel, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
  taskCheck: { width: 40, alignItems: 'flex-start' },
  taskCopy: { flex: 1, paddingVertical: 13 },
  taskTitle: { color: foco.colors.text, fontSize: 16.5, fontWeight: '500' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  taskProject: { color: foco.colors.muted, fontSize: 13 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#A2A5AB' },
  priorityHigh: { borderWidth: 1.5, borderColor: foco.colors.accent, backgroundColor: 'transparent' },
  priorityMedium: { borderWidth: 1.5, borderColor: '#C9972A', backgroundColor: 'transparent' },
  taskPriority: { color: foco.colors.muted, fontSize: 13 },
  pressed: { opacity: 0.7 },
});
