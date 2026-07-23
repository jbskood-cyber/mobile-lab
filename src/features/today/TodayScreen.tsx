import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionHeader } from '@/src/ui/SectionHeader';
import { colors, radii, spacing, typeScale } from '@/src/ui/theme';

import { FocusCard } from './FocusCard';
import { MetricStrip } from './MetricStrip';
import {
  addTask,
  createInitialTasks,
  getTodayMetrics,
  toggleTask,
} from './model';
import { QuickAdd } from './QuickAdd';
import { TaskRow } from './TaskRow';

const weekdays = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const months = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

function getTodayLabel() {
  const now = new Date();
  const weekday = weekdays[now.getDay()] ?? '';
  const month = months[now.getMonth()] ?? '';
  const label = `${weekday}, ${now.getDate()} de ${month}`;

  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function TodayScreen() {
  const [tasks, setTasks] = useState(createInitialTasks);
  const metrics = useMemo(() => getTodayMetrics(tasks), [tasks]);
  const openTasks = useMemo(
    () => tasks.filter((task) => !task.completed),
    [tasks],
  );

  const handleAdd = (title: string) => {
    setTasks((current) => addTask(current, title));
  };

  const handleToggle = (id: string) => {
    setTasks((current) => toggleTask(current, id));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir menú"
              hitSlop={10}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Text style={styles.menuIcon}>☰</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Abrir calendario"
              hitSlop={10}
              style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            >
              <Text style={styles.calendarIcon}>▣</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>Hoy</Text>
          <Text style={styles.date}>{getTodayLabel()}</Text>

          <View style={styles.block}>
            <MetricStrip focusTime="02:55" metrics={metrics} />
          </View>

          <View style={styles.block}>
            <QuickAdd onAdd={handleAdd} />
          </View>

          <View style={styles.section}>
            <SectionHeader title="Enfoque de hoy" detail="Ver plan ›" />
            <FocusCard />
          </View>

          <View style={styles.section}>
            <SectionHeader
              title="Tareas"
              detail={`${openTasks.length} pendientes`}
            />

            <View style={styles.taskList}>
              {openTasks.map((task) => (
                <TaskRow key={task.id} task={task} onToggle={handleToggle} />
              ))}

              {openTasks.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyTitle}>Día completado</Text>
                  <Text style={styles.emptyCopy}>
                    No quedan tareas abiertas para hoy.
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  menuIcon: {
    color: colors.text,
    fontSize: 27,
    lineHeight: 31,
  },
  calendarIcon: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 27,
  },
  title: {
    color: colors.text,
    fontSize: typeScale.title,
    fontWeight: '800',
    letterSpacing: -1.4,
  },
  date: {
    color: colors.textMuted,
    fontSize: typeScale.bodyLarge,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  block: {
    marginBottom: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  taskList: {
    gap: spacing.sm,
  },
  emptyState: {
    minHeight: 130,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typeScale.section,
    fontWeight: '700',
  },
  emptyCopy: {
    color: colors.textMuted,
    fontSize: typeScale.body,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});