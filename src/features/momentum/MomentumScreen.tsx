import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMomentumTask } from '@/src/core/dayPlan';
import { useFocoStore } from '@/src/core/FocoStore';
import { useFocusTimer } from '@/src/core/useFocusTimer';
import { FocusKeepAwake } from '@/src/platform/FocusKeepAwake';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { hapticImpact, hapticSelection, pressedStyle } from '@/src/ui/premium';

const starters = [2, 5, 10] as const;

function clock(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function MomentumScreen() {
  const router = useRouter();
  const theme = useFocoTheme();
  const { state } = useFocoStore();
  const [excluded, setExcluded] = useState<string[]>([]);
  const task = useMemo(() => getMomentumTask(state, Date.now(), excluded), [excluded, state]);
  const [minutes, setMinutes] = useState<(typeof starters)[number]>(5);
  const timer = useFocusTimer(task?.projectId ?? 'personal', task?.id);
  const project = state.projects.find((item) => item.id === task?.projectId);

  const prepare = (value: (typeof starters)[number]) => {
    setMinutes(value);
    timer.changeMode('pomodoro');
    timer.configure({
      focusSeconds: value * 60,
      shortBreakSeconds: timer.preferences.shortBreakMinutes * 60,
      longBreakSeconds: timer.preferences.longBreakMinutes * 60,
      targetCycles: 1,
      continuousMode: false,
      projectId: task?.projectId,
      taskId: task?.id,
    });
    hapticSelection();
  };

  const start = () => {
    if (!task) return;
    if (timer.runtime.focusSeconds !== minutes * 60) prepare(minutes);
    timer.toggle();
    hapticImpact();
  };

  const skip = () => {
    if (!task || timer.runtime.running) return;
    setExcluded((current) => [...current, task.id]);
    hapticSelection();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bg }]} edges={['top', 'bottom', 'left', 'right']}>
      <FocusKeepAwake active={timer.runtime.running && timer.preferences.keepAwake} />
      <View style={styles.header}>
        <Pressable accessibilityLabel="Volver" onPress={() => router.back()} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="chevron-left" size={22} color={theme.colors.text} /></Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Impulso</Text>
        <Pressable accessibilityLabel="Otra recomendación" disabled={timer.runtime.running || !task} onPress={skip} style={({ pressed }) => [styles.iconButton, pressed && pressedStyle]}><FocoIcon name="tomorrow" size={21} color={timer.runtime.running ? theme.colors.inactive : theme.colors.text} /></Pressable>
      </View>

      <View style={styles.content}>
        {task ? (
          <>
            <Text style={[styles.eyebrow, { color: theme.colors.accent }]}>{timer.runtime.running ? 'SOLO ESTO AHORA' : 'SIGUIENTE PASO'}</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{task.title}</Text>
            <Text style={[styles.context, { color: theme.colors.muted }]}>{project?.name ?? 'Sin proyecto'} · {task.durationMinutes} min estimados</Text>
            <View style={[styles.firstStep, { borderColor: theme.colors.borderSoft }]}>
              <Text style={[styles.firstLabel, { color: theme.colors.muted }]}>Empieza por</Text>
              <Text style={[styles.firstText, { color: theme.colors.text }]}>{task.firstStep || task.subtasks.find((item) => !item.completed)?.title || 'Abrir la tarea y trabajar durante el primer minuto.'}</Text>
            </View>

            <Text style={[styles.timer, { color: theme.colors.text }]} accessibilityLiveRegion="polite">{timer.ready ? clock(timer.seconds) : '··:··'}</Text>
            <Text style={[styles.timerMeta, { color: theme.colors.muted }]}>{timer.runtime.running ? 'No necesitas terminar; solo permanecer aquí.' : 'Elige un inicio tan pequeño que puedas hacerlo ahora.'}</Text>

            {!timer.runtime.running ? (
              <View style={styles.starters}>
                {starters.map((value) => <Pressable key={value} accessibilityRole="radio" accessibilityState={{ checked: minutes === value }} onPress={() => prepare(value)} style={({ pressed }) => [styles.starter, { borderColor: minutes === value ? theme.colors.inverse : theme.colors.border, backgroundColor: minutes === value ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><Text style={[styles.starterValue, { color: minutes === value ? theme.colors.inverseText : theme.colors.text }]}>{value}</Text><Text style={[styles.starterLabel, { color: minutes === value ? theme.colors.inverseText : theme.colors.muted }]}>min</Text></Pressable>)}
              </View>
            ) : null}

            <View style={styles.controls}>
              {timer.runtime.running ? <Pressable accessibilityLabel="Detener impulso" onPress={timer.stop} style={({ pressed }) => [styles.secondary, { borderColor: theme.colors.border }, pressed && pressedStyle]}><FocoIcon name="stop" size={21} color={theme.colors.text} /></Pressable> : null}
              <Pressable accessibilityLabel={timer.runtime.running ? 'Pausar' : 'Empezar'} onPress={start} style={({ pressed }) => [styles.primary, { backgroundColor: theme.colors.inverse }, pressed && pressedStyle]}><FocoIcon name={timer.runtime.running ? 'pause' : 'play'} size={26} color={theme.colors.inverseText} /><Text style={[styles.primaryText, { color: theme.colors.inverseText }]}>{timer.runtime.running ? 'Pausar' : `Empezar ${minutes} min`}</Text></Pressable>
            </View>
            {timer.message ? <Text style={[styles.message, { color: timer.message.tone === 'warning' ? theme.colors.warning : theme.colors.muted }]}>{timer.message.text}</Text> : null}
          </>
        ) : (
          <View style={styles.empty}><FocoIcon name="check" size={32} color={theme.colors.success} /><Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No hay nada urgente</Text><Text style={[styles.emptyCopy, { color: theme.colors.muted }]}>Captura una tarea o vuelve a Agenda para planificar.</Text></View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { height: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 30, alignItems: 'center' },
  eyebrow: { fontFamily: 'Manrope_700Bold', fontSize: 10, lineHeight: 14, letterSpacing: 1.7 },
  title: { maxWidth: 420, fontFamily: 'Manrope_700Bold', fontSize: 28, lineHeight: 34, letterSpacing: -0.7, textAlign: 'center', marginTop: 10 },
  context: { fontFamily: 'Manrope_400Regular', fontSize: 11.5, lineHeight: 16, marginTop: 7 },
  firstStep: { width: '100%', maxWidth: 430, marginTop: 28, paddingVertical: 16, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  firstLabel: { fontFamily: 'Manrope_500Medium', fontSize: 10, lineHeight: 14, textTransform: 'uppercase', letterSpacing: 0.8 },
  firstText: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 21, marginTop: 5 },
  timer: { fontFamily: 'Manrope_400Regular', fontSize: 62, lineHeight: 72, letterSpacing: -2.3, fontVariant: ['tabular-nums'], marginTop: 32 },
  timerMeta: { maxWidth: 310, fontFamily: 'Manrope_400Regular', fontSize: 11.5, lineHeight: 17, textAlign: 'center', marginTop: 3 },
  starters: { flexDirection: 'row', gap: 8, marginTop: 24 },
  starter: { width: 70, minHeight: 54, borderRadius: 13, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  starterValue: { fontFamily: 'Manrope_700Bold', fontSize: 17, lineHeight: 20, fontVariant: ['tabular-nums'] },
  starterLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 12 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 24 },
  secondary: { width: 48, height: 48, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  primary: { minHeight: 54, borderRadius: 27, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  primaryText: { fontFamily: 'Manrope_700Bold', fontSize: 13.5, lineHeight: 18 },
  message: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, lineHeight: 15, marginTop: 12, textAlign: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  emptyTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 18, lineHeight: 23, marginTop: 12 },
  emptyCopy: { maxWidth: 280, fontFamily: 'Manrope_400Regular', fontSize: 12, lineHeight: 17, textAlign: 'center', marginTop: 5 },
});
