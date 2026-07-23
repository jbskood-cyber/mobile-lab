import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, getTodaySummary, type FocusMode } from '@/src/core/model';
import { useFocusTimer } from '@/src/core/useFocusTimer';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen, Surface } from '@/src/ui/FocoShell';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { normalizeIntegerDraft, parseOptionalInteger } from '@/src/ui/formModel';
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
  const [draftFocusMinutes, setDraftFocusMinutes] = useState(String(Math.round(timer.runtime.focusSeconds / 60)));
  const [draftBreakMinutes, setDraftBreakMinutes] = useState(String(Math.round(timer.runtime.breakSeconds / 60)));
  const [draftCycles, setDraftCycles] = useState(String(timer.runtime.targetCycles));
  const today = useMemo(() => getTodaySummary(state), [state]);
  const cyclesToday = useMemo(() => {
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    return state.sessions.filter((session) => session.mode === 'pomodoro' && session.endedAt >= dayStart.getTime()).length;
  }, [state.sessions]);

  const focusMinutes = parseOptionalInteger(draftFocusMinutes, 1, 180);
  const breakMinutes = parseOptionalInteger(draftBreakMinutes, 1, 60);
  const cycles = parseOptionalInteger(draftCycles, 1, 8);
  const settingsValid = focusMinutes !== null && breakMinutes !== null && cycles !== null;

  const openSettings = () => {
    setDraftFocusMinutes(String(Math.round(timer.runtime.focusSeconds / 60)));
    setDraftBreakMinutes(String(Math.round(timer.runtime.breakSeconds / 60)));
    setDraftCycles(String(timer.runtime.targetCycles));
    setSettingsOpen(true);
    hapticSelection();
  };

  const saveSettings = () => {
    if (focusMinutes === null || breakMinutes === null || cycles === null) return;
    timer.configure({
      focusSeconds: focusMinutes * 60,
      breakSeconds: breakMinutes * 60,
      targetCycles: cycles,
    });
    setSettingsOpen(false);
  };

  const selectedMode: FocusMode = timer.runtime.mode;
  const phaseLabel = timer.runtime.mode === 'stopwatch' ? 'Cronómetro' : timer.runtime.phase === 'break' ? 'Descanso' : 'Enfocado en';

  return (
    <FocoScreen
      title="Enfoque"
      screenKey="focus"
      rightIcon="sliders"
      rightAccessibilityLabel="Configurar temporizador"
      onRightPress={openSettings}
    >
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
            <Text style={styles.timer} maxFontSizeMultiplier={1.05}>{timer.ready ? clockLabel(timer.seconds) : '··:··'}</Text>
            <Text style={styles.goal}>{timer.runtime.mode === 'pomodoro' ? `Objetivo: ${timer.runtime.targetCycles} bloques` : `Meta visual: ${Math.round(timer.runtime.focusSeconds / 60)} min`}</Text>
          </View>
        </ProgressRing>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel={timer.runtime.mode === 'pomodoro' ? 'Cambiar fase' : 'Reiniciar cronómetro'} onPress={timer.skipPhase} style={({ pressed }) => [styles.secondaryControl, pressed && pressedStyle]}>
          <FocoIcon name="previous" size={27} color={foco.colors.text} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: timer.runtime.running }}
          accessibilityLabel={timer.runtime.running ? 'Pausar sesión' : 'Iniciar sesión'}
          onPress={timer.toggle}
          style={({ pressed }) => [styles.primaryControl, timer.runtime.running && styles.primaryRunning, pressed && pressedStyle]}
        >
          <FocoIcon name={timer.runtime.running ? 'pause' : 'play'} size={34} color={foco.colors.white} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Detener y guardar sesión" onPress={timer.stop} style={({ pressed }) => [styles.secondaryControl, pressed && pressedStyle]}>
          <FocoIcon name="stop" size={26} color={foco.colors.text} />
        </Pressable>
      </View>

      {timer.message ? <View accessibilityLiveRegion="polite" style={styles.message}><Text style={styles.messageText}>{timer.message}</Text></View> : null}

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
          <ProgressRing size={56} strokeWidth={5} progress={Math.min(1, cyclesToday / timer.runtime.targetCycles)} color={foco.colors.text} trackColor="#34373E" />
        </View>
      </Surface>

      <FocoSheet
        visible={settingsOpen}
        title="Configurar enfoque"
        subtitle="Elige proyecto y ritmo. Los cambios se aplican juntos al confirmar."
        onClose={() => setSettingsOpen(false)}
        footer={
          <>
            <SheetButton label="Reiniciar" variant="secondary" onPress={() => { timer.reset(); setSettingsOpen(false); }} />
            <SheetButton label="Aplicar" onPress={saveSettings} disabled={!settingsValid} />
          </>
        }
      >
        <FieldLabel>PROYECTO</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow} keyboardShouldPersistTaps="handled">
          {activeProjects.map((item) => (
            <Pressable key={item.id} accessibilityRole="radio" accessibilityState={{ checked: item.id === projectId }} onPress={() => { setProjectId(item.id); hapticSelection(); }} style={({ pressed }) => [styles.choiceChip, item.id === projectId && styles.choiceSelected, pressed && pressedStyle]}>
              <Text style={[styles.choiceText, item.id === projectId && styles.choiceTextSelected]}>{item.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.fieldGrid}>
          <NumericField
            label="SESIÓN"
            value={draftFocusMinutes}
            onChangeText={setDraftFocusMinutes}
            onBlur={() => setDraftFocusMinutes(normalizeIntegerDraft(draftFocusMinutes, 50, 1, 180))}
            suffix="min"
            valid={focusMinutes !== null}
          />
          <NumericField
            label="DESCANSO"
            value={draftBreakMinutes}
            onChangeText={setDraftBreakMinutes}
            onBlur={() => setDraftBreakMinutes(normalizeIntegerDraft(draftBreakMinutes, 10, 1, 60))}
            suffix="min"
            valid={breakMinutes !== null}
          />
          <NumericField
            label="CICLOS"
            value={draftCycles}
            onChangeText={setDraftCycles}
            onBlur={() => setDraftCycles(normalizeIntegerDraft(draftCycles, 3, 1, 8))}
            suffix=""
            valid={cycles !== null}
          />
        </View>
        {!settingsValid ? <Text accessibilityLiveRegion="polite" style={styles.inlineError}>Usa sesión 1–180 min, descanso 1–60 min y 1–8 ciclos.</Text> : null}
      </FocoSheet>
    </FocoScreen>
  );
}

function NumericField({ label, value, suffix, valid, onChangeText, onBlur }: { label: string; value: string; suffix: string; valid: boolean; onChangeText: (value: string) => void; onBlur: () => void }) {
  return (
    <View style={styles.numericField}>
      <FieldLabel>{label}</FieldLabel>
      <View style={[styles.numericInputWrap, !valid && value !== '' && styles.numericInvalid]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          inputMode="numeric"
          keyboardType="number-pad"
          returnKeyType="done"
          selectTextOnFocus
          style={styles.numericInput}
          accessibilityLabel={label.toLowerCase()}
          maxLength={3}
        />
        {suffix ? <Text style={styles.numericSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function SessionMetric({ value, label }: { value: string; label: string }) {
  return <View style={styles.sessionMetric}><Text style={styles.sessionValue} maxFontSizeMultiplier={1.1}>{value}</Text><Text style={styles.sessionLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  segmented: { marginTop: 22, minHeight: 54, padding: 3, flexDirection: 'row', borderRadius: 17 },
  segment: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segmentSelected: { backgroundColor: foco.colors.text },
  segmentText: { color: foco.colors.muted, fontSize: 15.5 },
  segmentTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  context: { alignItems: 'center', marginTop: 24, minHeight: 56, justifyContent: 'center' },
  contextPressed: { opacity: 0.72 },
  blockTitle: { color: foco.colors.text, fontSize: 17.5, fontWeight: '500' },
  projectLine: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 7 },
  project: { color: foco.colors.muted, fontSize: 15.5 },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: foco.colors.text },
  timerWrap: { height: 318, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  timerHalo: { position: 'absolute', width: 314, height: 314, borderRadius: 157, borderWidth: 1, borderColor: '#25282E' },
  timerCopy: { alignItems: 'center', minWidth: 220 },
  timerLabel: { color: foco.colors.muted, fontSize: 16 },
  timer: { width: 230, textAlign: 'center', color: foco.colors.text, fontSize: 64, lineHeight: 73, fontWeight: '300', letterSpacing: -2.2, marginTop: 7, fontVariant: ['tabular-nums'] },
  goal: { color: foco.colors.muted, fontSize: 15.5, marginTop: 7 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', paddingHorizontal: 26, marginTop: -4, marginBottom: 18 },
  secondaryControl: { width: 68, height: 68, borderRadius: 34, borderWidth: 1, borderColor: foco.colors.border, alignItems: 'center', justifyContent: 'center', backgroundColor: foco.colors.panelSoft },
  primaryControl: { width: 84, height: 84, borderRadius: 42, borderWidth: 1, borderColor: foco.colors.text, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center', ...shadowGlow },
  primaryRunning: { backgroundColor: '#171A1F' },
  message: { minHeight: 42, borderRadius: 13, backgroundColor: foco.colors.panelSoft, borderWidth: 1, borderColor: foco.colors.borderSoft, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, marginBottom: 12 },
  messageText: { color: foco.colors.muted, fontSize: 12.5, textAlign: 'center' },
  sessionConfig: { minHeight: 88, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8 },
  sessionMetric: { flex: 1, alignItems: 'center', gap: 5 },
  sessionValue: { color: foco.colors.text, fontSize: 21, fontWeight: '500', fontVariant: ['tabular-nums'] },
  sessionLabel: { color: foco.colors.muted, fontSize: 12.5 },
  divider: { width: 1, height: 48, backgroundColor: foco.colors.border },
  todayCard: { marginTop: 12, minHeight: 124, padding: 16 },
  todayTitle: { color: foco.colors.text, fontSize: 15.5, fontWeight: '600' },
  todayRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15 },
  todayMetric: { flex: 1, minWidth: 0 },
  todayValue: { color: foco.colors.text, fontSize: 21, fontWeight: '500', fontVariant: ['tabular-nums'] },
  todayLabel: { color: foco.colors.muted, fontSize: 12.5, marginTop: 5 },
  todayDivider: { width: 1, height: 46, backgroundColor: foco.colors.border, marginHorizontal: 12 },
  choiceRow: { flexDirection: 'row', gap: 8, paddingBottom: 18 },
  choiceChip: { minHeight: 48, borderRadius: 15, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  choiceSelected: { backgroundColor: foco.colors.text, borderColor: foco.colors.text },
  choiceText: { color: foco.colors.muted, fontSize: 13.5 },
  choiceTextSelected: { color: foco.colors.bg, fontWeight: '600' },
  fieldGrid: { flexDirection: 'row', gap: 9 },
  numericField: { flex: 1, minWidth: 0 },
  numericInputWrap: { minHeight: 62, borderRadius: 16, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  numericInvalid: { borderColor: '#8A444D' },
  numericInput: { minWidth: 36, color: foco.colors.text, fontSize: 22, fontWeight: '600', textAlign: 'center', paddingVertical: 10, fontVariant: ['tabular-nums'] },
  numericSuffix: { color: foco.colors.muted, fontSize: 11.5, marginLeft: 2 },
  inlineError: { color: '#E0AEB5', fontSize: 12, lineHeight: 17, marginTop: 10 },
});
