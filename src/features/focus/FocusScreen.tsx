import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getTodaySummary, type FocusMode } from '@/src/core/model';
import { useFocusTimer } from '@/src/core/useFocusTimer';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { foco, shadowGlow } from '@/src/ui/focoTheme';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

function clockLabel(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function FocusScreen() {
  const { state } = useFocoStore();
  const activeProjects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const [projectId, setProjectId] = useState(activeProjects[0]?.id ?? 'personal');
  const project = state.projects.find((item) => item.id === projectId) ?? activeProjects[0];
  const timer = useFocusTimer(project?.id ?? 'personal');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draftFocusMinutes, setDraftFocusMinutes] = useState(Math.round(timer.runtime.focusSeconds / 60));
  const [draftBreakMinutes, setDraftBreakMinutes] = useState(Math.round(timer.runtime.breakSeconds / 60));
  const [draftCycles, setDraftCycles] = useState(timer.runtime.targetCycles);
  const today = useMemo(() => getTodaySummary(state), [state]);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const cyclesToday = state.sessions.filter((session) => session.mode === 'pomodoro' && session.endedAt >= todayStart.getTime()).length;

  const openSettings = () => {
    setDraftFocusMinutes(Math.round(timer.runtime.focusSeconds / 60));
    setDraftBreakMinutes(Math.round(timer.runtime.breakSeconds / 60));
    setDraftCycles(timer.runtime.targetCycles);
    setSettingsOpen(true);
    hapticSelection();
  };

  const saveSettings = () => {
    timer.configure({
      focusSeconds: draftFocusMinutes * 60,
      breakSeconds: draftBreakMinutes * 60,
      targetCycles: draftCycles,
    });
    setSettingsOpen(false);
  };

  const selectedMode: FocusMode = timer.runtime.mode;
  const phaseLabel = timer.runtime.mode === 'stopwatch' ? 'Cronómetro' : timer.runtime.phase === 'break' ? 'Descanso' : 'Enfocado en';

  return (
    <FocoScreen title="Enfoque" rightIcon="sliders" onRightPress={openSettings}>
      <Surface style={styles.segmented}>
        {([['pomodoro', 'Pomodoro'], ['stopwatch', 'Cronómetro']] as const).map(([mode, label]) => {
          const selected = mode === selectedMode;
          return (
            <Pressable
              key={mode}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`Modo ${label}`}
              onPress={() => timer.changeMode(mode)}
              style={({ pressed }) => [styles.segment, selected && styles.segmentSelected, pressed && pressedStyle]}
            >
              <Text style={[styles.segmentText, selected && styles.segmentTextSelected]}>{label}</Text>
            </Pressable>
          );
        })}
      </Surface>

      <Pressable accessibilityRole="button" accessibilityLabel="Elegir proyecto de enfoque" onPress={openSettings} style={({ pressed }) => [styles.context, pressed && styles.contextPressed]}>
        <Text style={styles.blockTitle}>{timer.runtime.phase === 'break' ? 'Recuperación consciente' : `Bloque ${timer.runtime.currentCycle} · Transformación`}</Text>
        <View style={styles.projectLine}><Text style={styles.project}>{project?.name ?? 'Sin proyecto'}</Text><View style={styles.dot} /></View>
      </Pressable>

      <View style={styles.timerWrap}>
        <View style={styles.timerHalo} />
        <ProgressRing size={300} strokeWidth={14} progress={timer.progress} color={foco.colors.white} trackColor="#2A2D33" glow>
          <View style={styles.timerCopy} accessibilityLiveRegion="polite">
            <Text style={styles.timerLabel}>{phaseLabel}</Text>
            <Text style={styles.timer}>{timer.ready ? clockLabel(timer.seconds) : '··:··'}</Text>
            <Text style={styles.goal}>{timer.runtime.mode === 'pomodoro' ? `Objetivo: ${timer.runtime.targetCycles} bloques` : `Meta visual: ${Math.round(timer.runtime.focusSeconds / 60)} min`}</Text>
          </View>
        </ProgressRing>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel={timer.runtime.mode === 'pomodoro' ? 'Cambiar fase' : 'Reiniciar cronómetro'} onPress={timer.skipPhase} style={({ pressed }) => [styles.secondaryControl, pressed && pressedStyle]}>
          <FocoIcon name="previous" size={28} color={foco.colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={timer.runtime.running ? 'Pausar sesión' : 'Iniciar sesión'}
          onPress={timer.toggle}
          style={({ pressed }) => [styles.primaryControl, pressed && pressedStyle]}
        >
          <FocoIcon name={timer.runtime.running ? 'pause' : 'play'} size={34} color={foco.colors.white} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Detener y guardar sesión" onPress={timer.stop} style={({ pressed }) => [styles.secondaryControl, pressed && pressedStyle]}>
          <FocoIcon name="stop" size={27} color={foco.colors.text} />
        </Pressable>
      </View>

      <Surface style={styles.sessionConfig}>
        <SessionMetric value={`${timer.runtime.currentCycle} / ${timer.runtime.targetCycles}`} label="Ciclos" />
        <View style={styles.divider} />
        <SessionMetric value={clockLabel(timer.runtime.focusSeconds)} label="Sesión" />
        <View style={styles.divider} />
        <SessionMetric value={clockLabel(timer.runtime.breakSeconds)} label="Descanso" />
      </Surface>

      <Surface style={styles.todayCard}>
        <Text style={styles.todayTitle}>Sesión de hoy</Text>
        <View style={styles.todayRow}>
          <View style={styles.todayMetric}>
            <Text style={styles.todayValue}>{cyclesToday} / {timer.runtime.targetCycles}</Text>
            <Text style={styles.todayLabel}>Ciclos completados</Text>
          </View>
          <View style={styles.todayDivider} />
          <View style={styles.todayMetric}>
            <Text style={styles.todayValue}>{formatDuration(today.focusSeconds, true)}</Text>
            <Text style={styles.todayLabel}>Tiempo enfocado</Text>
          </View>
          <ProgressRing size={58} strokeWidth={5} progress={Math.min(1, cyclesToday / timer.runtime.targetCycles)} color={foco.colors.text} trackColor="#34373E" />
        </View>
      </Surface>

      <FocoSheet
        visible={settingsOpen}
        title="Configurar enfoque"
        subtitle="Ajusta el ritmo sin salir de tu contexto. Los cambios se aplican al reiniciar la sesión actual."
        onClose={() => setSettingsOpen(false)}
        footer={
          <>
            <SheetButton label="Reiniciar" variant="secondary" onPress={() => { timer.reset(); setSettingsOpen(false); }} />
            <SheetButton label="Aplicar" onPress={saveSettings} />
          </>
        }
      >
        <FieldLabel>PROYECTO</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
          {activeProjects.map((item) => (
            <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: item.id === projectId }} onPress={() => { setProjectId(item.id); hapticSelection(); }} style={({ pressed }) => [styles.choiceChip, item.id === projectId && styles.choiceSelected, pressed && pressedStyle]}>
              <Text style={[styles.choiceText, item.id === projectId && styles.choiceTextSelected]}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <FieldLabel>SESIÓN</FieldLabel>
        <View style={styles.choiceRow}>
          {[25, 50, 90].map((minutes) => <NumberChoice key={minutes} value={minutes} selected={draftFocusMinutes === minutes} suffix="min" onPress={() => setDraftFocusMinutes(minutes)} />)}
        </View>

        <FieldLabel>DESCANSO</FieldLabel>
        <View style={styles.choiceRow}>
          {[5, 10, 15].map((minutes) => <NumberChoice key={minutes} value={minutes} selected={draftBreakMinutes === minutes} suffix="min" onPress={() => setDraftBreakMinutes(minutes)} />)}
        </View>

        <FieldLabel>CICLOS</FieldLabel>
        <View style={styles.choiceRow}>
          {[1, 3, 4].map((cycles) => <NumberChoice key={cycles} value={cycles} selected={draftCycles === cycles} onPress={() => setDraftCycles(cycles)} />)}
        </View>
      </FocoSheet>
    </FocoScreen>
  );
}

function NumberChoice({ value, suffix, selected, onPress }: { value: number; suffix?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={() => { onPress(); hapticSelection(); }} style={({ pressed }) => [styles.numberChoice, selected && styles.choiceSelected, pressed && pressedStyle]}>
      <Text style={[styles.numberValue, selected && styles.numberValueSelected]}>{value}</Text>
      {suffix ? <Text style={[styles.numberSuffix, selected && styles.numberValueSelected]}>{suffix}</Text> : null}
    </Pressable>
  );
}

function SessionMetric({ value, label }: { value: string; label: string }) {
  return <View style={styles.sessionMetric}><Text style={styles.sessionValue}>{value}</Text><Text style={styles.sessionLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  segmented: { marginTop: 24, minHeight: 56, padding: 3, flexDirection: 'row', borderRadius: 18 },
  segment: { flex: 1, minHeight: 50, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: foco.colors.text },
  segmentText: { color: foco.colors.muted, fontSize: 16 },
  segmentTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  context: { alignItems: 'center', marginTop: 28, minHeight: 58, justifyContent: 'center' },
  contextPressed: { opacity: 0.72 },
  blockTitle: { color: foco.colors.text, fontSize: 18, fontWeight: '500' },
  projectLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 8 },
  project: { color: foco.colors.muted, fontSize: 16 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: foco.colors.text },
  timerWrap: { height: 330, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  timerHalo: { position: 'absolute', width: 320, height: 320, borderRadius: 160, borderWidth: 1, borderColor: '#25282E' },
  timerCopy: { alignItems: 'center' },
  timerLabel: { color: foco.colors.muted, fontSize: 17 },
  timer: { color: foco.colors.text, fontSize: 66, lineHeight: 75, fontWeight: '300', letterSpacing: -2.5, marginTop: 8, fontVariant: ['tabular-nums'] },
  goal: { color: foco.colors.muted, fontSize: 16, marginTop: 8 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 24, marginTop: -3, marginBottom: 24 },
  secondaryControl: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: foco.colors.panelSoft },
  primaryControl: { width: 86, height: 86, borderRadius: 43, borderWidth: 1, borderColor: foco.colors.text, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center', ...shadowGlow },
  sessionConfig: { minHeight: 94, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  sessionMetric: { flex: 1, alignItems: 'center', gap: 6 },
  sessionValue: { color: foco.colors.text, fontSize: 23, fontWeight: '500', fontVariant: ['tabular-nums'] },
  sessionLabel: { color: foco.colors.muted, fontSize: 13 },
  divider: { width: 1, height: 52, backgroundColor: foco.colors.border },
  todayCard: { marginTop: 14, minHeight: 132, padding: 18 },
  todayTitle: { color: foco.colors.text, fontSize: 16, fontWeight: '500' },
  todayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 17 },
  todayMetric: { flex: 1 },
  todayValue: { color: foco.colors.text, fontSize: 23, fontWeight: '500', fontVariant: ['tabular-nums'] },
  todayLabel: { color: foco.colors.muted, fontSize: 13, marginTop: 6 },
  todayDivider: { width: 1, height: 50, backgroundColor: foco.colors.border, marginHorizontal: 16 },
  choiceRow: { flexDirection: 'row', gap: 9, paddingBottom: 20 },
  choiceChip: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  choiceSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  choiceText: { color: foco.colors.muted, fontSize: 14 },
  choiceTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  numberChoice: { flex: 1, minHeight: 62, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center' },
  numberValue: { color: foco.colors.text, fontSize: 20, fontWeight: '600' },
  numberSuffix: { color: foco.colors.muted, fontSize: 11.5, marginTop: 2 },
  numberValueSelected: { color: foco.colors.bg },
});
