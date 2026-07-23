import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, startOfLocalDay, type FocusMode, type Task } from '@/src/core/model';
import { useFocusTimer } from '@/src/core/useFocusTimer';
import { FocusKeepAwake } from '@/src/platform/FocusKeepAwake';
import { FocoIcon } from '@/src/ui/FocoIcon';
import { FocoScreen } from '@/src/ui/FocoShell';
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
  const params = useLocalSearchParams<{ taskId?: string; projectId?: string }>();
  const { state } = useFocoStore();
  const activeProjects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const initialTask = params.taskId ? state.tasks.find((task) => task.id === params.taskId && !task.completed) : undefined;
  const initialProjectId = initialTask?.projectId ?? (params.projectId && activeProjects.some((project) => project.id === params.projectId) ? params.projectId : activeProjects[0]?.id ?? 'personal');
  const [projectId, setProjectId] = useState(initialProjectId);
  const [taskId, setTaskId] = useState<string | undefined>(initialTask?.id);
  const project = state.projects.find((item) => item.id === projectId) ?? activeProjects[0];
  const task = taskId ? state.tasks.find((item) => item.id === taskId) : undefined;
  const timer = useFocusTimer(project?.id ?? 'personal', task?.id);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [focusDraft, setFocusDraft] = useState('50');
  const [shortBreakDraft, setShortBreakDraft] = useState('10');
  const [longBreakDraft, setLongBreakDraft] = useState('20');
  const [longEveryDraft, setLongEveryDraft] = useState('4');
  const [cyclesDraft, setCyclesDraft] = useState('3');
  const [autoBreaks, setAutoBreaks] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [keepAwake, setKeepAwake] = useState(true);

  useEffect(() => {
    if (initialTask) {
      setProjectId(initialTask.projectId);
      setTaskId(initialTask.id);
    } else if (params.projectId && activeProjects.some((item) => item.id === params.projectId)) {
      setProjectId(params.projectId);
      setTaskId(undefined);
    }
  }, [activeProjects, initialTask, params.projectId]);

  const openTasks = useMemo(() => state.tasks.filter((item) => item.projectId === projectId && !item.completed), [projectId, state.tasks]);
  const dayStart = startOfLocalDay(Date.now());
  const todaySessions = useMemo(() => state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= dayStart), [dayStart, state.sessions]);
  const focusToday = todaySessions.reduce((sum, session) => sum + session.durationSec, 0);
  const pomodorosToday = todaySessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;
  const taskSessions = task ? state.sessions.filter((session) => session.taskId === task.id && session.phase === 'focus') : [];
  const taskPomodoros = taskSessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;

  const phaseLabel = timer.runtime.mode === 'stopwatch'
    ? 'Cronómetro'
    : timer.runtime.phase === 'longBreak'
      ? 'Descanso largo'
      : timer.runtime.phase === 'shortBreak'
        ? 'Descanso'
        : 'Enfoque';

  const openSettings = () => {
    const preferences = timer.preferences;
    setFocusDraft(String(preferences.focusMinutes));
    setShortBreakDraft(String(preferences.shortBreakMinutes));
    setLongBreakDraft(String(preferences.longBreakMinutes));
    setLongEveryDraft(String(preferences.longBreakEvery));
    setCyclesDraft(String(preferences.targetCycles));
    setAutoBreaks(preferences.autoStartBreaks);
    setAutoFocus(preferences.autoStartFocus);
    setContinuous(preferences.continuousMode);
    setKeepAwake(preferences.keepAwake);
    setSettingsOpen(true);
    hapticSelection();
  };

  const focusMinutes = parseOptionalInteger(focusDraft, 1, 180);
  const shortBreakMinutes = parseOptionalInteger(shortBreakDraft, 1, 60);
  const longBreakMinutes = parseOptionalInteger(longBreakDraft, 1, 90);
  const longEvery = parseOptionalInteger(longEveryDraft, 1, 12);
  const targetCycles = parseOptionalInteger(cyclesDraft, 1, 12);
  const settingsValid = focusMinutes !== null && shortBreakMinutes !== null && longBreakMinutes !== null && longEvery !== null && targetCycles !== null;

  const saveSettings = () => {
    if (!settingsValid || focusMinutes === null || shortBreakMinutes === null || longBreakMinutes === null || longEvery === null || targetCycles === null) return;
    timer.configure({
      focusSeconds: focusMinutes * 60,
      shortBreakSeconds: shortBreakMinutes * 60,
      longBreakSeconds: longBreakMinutes * 60,
      longBreakEvery: longEvery,
      targetCycles,
      autoStartBreaks: autoBreaks,
      autoStartFocus: autoFocus,
      continuousMode: continuous,
    }, {
      focusMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      longBreakEvery: longEvery,
      targetCycles,
      autoStartBreaks: autoBreaks,
      autoStartFocus: autoFocus,
      continuousMode: continuous,
      keepAwake,
    });
    setSettingsOpen(false);
  };

  const selectTask = (nextTask?: Task) => {
    const nextProjectId = nextTask?.projectId ?? projectId;
    setProjectId(nextProjectId);
    setTaskId(nextTask?.id);
    timer.selectContext(nextProjectId, nextTask?.id);
    setContextOpen(false);
  };

  const totalTaskEstimate = task?.estimatedPomodoros ?? timer.preferences.targetCycles;
  const taskProgress = task ? Math.min(1, taskPomodoros / Math.max(1, totalTaskEstimate)) : Math.min(1, pomodorosToday / Math.max(1, timer.preferences.targetCycles));

  return (
    <>
      <FocusKeepAwake active={timer.runtime.running && timer.preferences.keepAwake} />
      <FocoScreen title="Enfoque" subtitle={timer.runtime.running ? 'Sesión activa' : 'Elige una tarea y empieza.'} screenKey="focus" rightIcon="sliders" rightAccessibilityLabel="Configurar enfoque" onRightPress={openSettings}>
        <View style={styles.modeSwitch}>
          {([['pomodoro', 'Pomodoro'], ['stopwatch', 'Cronómetro']] as Array<[FocusMode, string]>).map(([mode, label]) => {
            const selected = timer.runtime.mode === mode;
            return <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: selected }} disabled={timer.runtime.running} onPress={() => timer.changeMode(mode)} style={({ pressed }) => [styles.mode, selected && styles.modeActive, timer.runtime.running && !selected && styles.modeDisabled, pressed && pressedStyle]}><Text style={[styles.modeText, selected && styles.modeTextActive]}>{label}</Text></Pressable>;
          })}
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Elegir tarea o proyecto" disabled={timer.runtime.running} onPress={() => setContextOpen(true)} style={({ pressed }) => [styles.context, pressed && pressedStyle]}>
          <View style={styles.contextIcon}><FocoIcon name={task ? 'checklist' : (project?.icon ?? 'folder')} size={22} color={foco.colors.text} /></View>
          <View style={styles.contextCopy}><Text style={styles.contextTitle} numberOfLines={1}>{task?.title ?? project?.name ?? 'Sin proyecto'}</Text><Text style={styles.contextMeta}>{task ? `${project?.name} · ${taskPomodoros}/${task.estimatedPomodoros} pomodoros` : 'Sesión libre del proyecto'}</Text></View>
          <FocoIcon name="chevron-down" size={17} color={foco.colors.muted} />
        </Pressable>

        <View style={styles.timerWrap}>
          <ProgressRing size={264} strokeWidth={12} progress={timer.progress} color={foco.colors.white} trackColor="#292C32" glow>
            <View style={styles.timerCopy} accessibilityLiveRegion="polite">
              <Text style={styles.phase}>{phaseLabel}</Text>
              <Text style={styles.timer} maxFontSizeMultiplier={1.03}>{timer.ready ? clockLabel(timer.seconds) : '··:··'}</Text>
              <Text style={styles.cycle}>{timer.runtime.mode === 'pomodoro' ? `Ciclo ${timer.runtime.currentCycle} de ${timer.runtime.targetCycles}` : 'Tiempo acumulado'}</Text>
            </View>
          </ProgressRing>
        </View>

        <View style={styles.controls}>
          <Pressable accessibilityRole="button" accessibilityLabel={timer.runtime.mode === 'pomodoro' ? 'Saltar fase' : 'Reiniciar'} onPress={timer.skipPhase} style={({ pressed }) => [styles.secondary, pressed && pressedStyle]}><FocoIcon name="previous" size={25} color={foco.colors.text} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={timer.runtime.running ? 'Pausar' : 'Iniciar'} onPress={timer.toggle} style={({ pressed }) => [styles.primaryControl, timer.runtime.running && styles.primaryRunning, pressed && pressedStyle]}><FocoIcon name={timer.runtime.running ? 'pause' : 'play'} size={33} color={foco.colors.white} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Detener y guardar" onPress={timer.stop} style={({ pressed }) => [styles.secondary, pressed && pressedStyle]}><FocoIcon name="stop" size={24} color={foco.colors.text} /></Pressable>
        </View>

        {timer.message ? <View style={[styles.message, timer.message.tone === 'success' && styles.messageSuccess, timer.message.tone === 'warning' && styles.messageWarning]}><Text style={styles.messageText}>{timer.message.text}</Text></View> : null}

        <View style={styles.sessionSummary}>
          <Summary value={`${pomodorosToday}/${timer.preferences.targetCycles}`} label="Pomodoros hoy" />
          <Summary value={formatDuration(focusToday, true)} label="Tiempo hoy" />
          <Summary value={`${Math.round(taskProgress * 100)}%`} label={task ? 'Tarea' : 'Meta diaria'} />
        </View>
      </FocoScreen>

      <FocoSheet visible={contextOpen} title="Enfocarse en" subtitle="Vincula la sesión para medir progreso real." onClose={() => setContextOpen(false)}>
        <Pressable onPress={() => selectTask(undefined)} style={({ pressed }) => [styles.contextOption, !task && styles.contextOptionActive, pressed && pressedStyle]}><FocoIcon name="folder" size={21} color={!task ? foco.colors.bg : foco.colors.text} /><View style={styles.optionCopy}><Text style={[styles.optionTitle, !task && styles.optionTextActive]}>{project?.name ?? 'Proyecto'}</Text><Text style={[styles.optionMeta, !task && styles.optionTextActive]}>Sesión libre</Text></View>{!task ? <FocoIcon name="check" size={18} color={foco.colors.bg} /> : null}</Pressable>
        {openTasks.map((item) => (
          <Pressable key={item.id} onPress={() => selectTask(item)} style={({ pressed }) => [styles.contextOption, task?.id === item.id && styles.contextOptionActive, pressed && pressedStyle]}>
            <FocoIcon name="checklist" size={21} color={task?.id === item.id ? foco.colors.bg : foco.colors.text} /><View style={styles.optionCopy}><Text style={[styles.optionTitle, task?.id === item.id && styles.optionTextActive]} numberOfLines={1}>{item.title}</Text><Text style={[styles.optionMeta, task?.id === item.id && styles.optionTextActive]}>{item.estimatedPomodoros} pomodoros estimados</Text></View>{task?.id === item.id ? <FocoIcon name="check" size={18} color={foco.colors.bg} /> : null}
          </Pressable>
        ))}
        {openTasks.length === 0 ? <Text style={styles.empty}>No hay tareas pendientes en este proyecto.</Text> : null}
      </FocoSheet>

      <FocoSheet visible={settingsOpen} title="Ritmo de enfoque" subtitle="Los cambios se aplican al reiniciar la fase actual." onClose={() => setSettingsOpen(false)} footer={<><SheetButton label="Reiniciar" variant="secondary" onPress={() => { timer.reset(); setSettingsOpen(false); }} /><SheetButton label="Aplicar" onPress={saveSettings} disabled={!settingsValid} /></>}>
        <View style={styles.fieldGrid}>
          <NumberField label="ENFOQUE" value={focusDraft} onChange={setFocusDraft} fallback={timer.preferences.focusMinutes} min={1} max={180} suffix="min" />
          <NumberField label="DESCANSO" value={shortBreakDraft} onChange={setShortBreakDraft} fallback={timer.preferences.shortBreakMinutes} min={1} max={60} suffix="min" />
          <NumberField label="DESCANSO LARGO" value={longBreakDraft} onChange={setLongBreakDraft} fallback={timer.preferences.longBreakMinutes} min={1} max={90} suffix="min" />
          <NumberField label="CADA" value={longEveryDraft} onChange={setLongEveryDraft} fallback={timer.preferences.longBreakEvery} min={1} max={12} suffix="ciclos" />
          <NumberField label="META" value={cyclesDraft} onChange={setCyclesDraft} fallback={timer.preferences.targetCycles} min={1} max={12} suffix="ciclos" />
        </View>
        <FieldLabel>AUTOMATIZACIÓN</FieldLabel>
        <ToggleRow label="Iniciar descansos automáticamente" value={autoBreaks} onChange={setAutoBreaks} />
        <ToggleRow label="Iniciar enfoque automáticamente" value={autoFocus} onChange={setAutoFocus} />
        <ToggleRow label="Modo continuo" value={continuous} onChange={setContinuous} />
        <ToggleRow label="Mantener pantalla activa" value={keepAwake} onChange={setKeepAwake} />
      </FocoSheet>
    </>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return <View style={styles.summaryItem}><Text style={styles.summaryValue} numberOfLines={1} adjustsFontSizeToFit>{value}</Text><Text style={styles.summaryLabel}>{label}</Text></View>;
}
function NumberField({ label, value, onChange, fallback, min, max, suffix }: { label: string; value: string; onChange: (value: string) => void; fallback: number; min: number; max: number; suffix: string }) {
  return <View style={styles.numberField}><Text style={styles.numberLabel}>{label}</Text><View style={styles.numberInputRow}><TextInput value={value} onChangeText={onChange} onBlur={() => onChange(normalizeIntegerDraft(value, fallback, min, max))} inputMode="numeric" keyboardType="number-pad" selectTextOnFocus style={styles.numberInput} /><Text style={styles.numberSuffix}>{suffix}</Text></View></View>;
}
function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
  return <Pressable accessibilityRole="switch" accessibilityState={{ checked: value }} onPress={() => { onChange(!value); hapticSelection(); }} style={({ pressed }) => [styles.toggleRow, pressed && pressedStyle]}><Text style={styles.toggleLabel}>{label}</Text><View style={[styles.toggle, value && styles.toggleActive]}><View style={[styles.toggleKnob, value && styles.toggleKnobActive]} /></View></Pressable>;
}

const styles = StyleSheet.create({
  modeSwitch: { minHeight: 52, marginTop: 16, padding: 3, borderRadius: 16, backgroundColor: foco.colors.panel, borderWidth: 1, borderColor: foco.colors.border, flexDirection: 'row' },
  mode: { flex: 1, minHeight: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  modeActive: { backgroundColor: foco.colors.text },
  modeDisabled: { opacity: 0.35 },
  modeText: { color: foco.colors.muted, fontSize: 14.5 },
  modeTextActive: { color: foco.colors.bg, fontWeight: '700' },
  context: { minHeight: 64, marginTop: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: 11 },
  contextIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center' },
  contextCopy: { flex: 1, minWidth: 0 },
  contextTitle: { color: foco.colors.text, fontSize: 15.5, fontWeight: '650' },
  contextMeta: { color: foco.colors.muted, fontSize: 11.5, marginTop: 4 },
  timerWrap: { height: 296, alignItems: 'center', justifyContent: 'center' },
  timerCopy: { alignItems: 'center' },
  phase: { color: foco.colors.muted, fontSize: 15 },
  timer: { color: foco.colors.text, fontSize: 58, lineHeight: 67, fontWeight: '300', letterSpacing: -2.2, marginTop: 5, fontVariant: ['tabular-nums'], minWidth: 195, textAlign: 'center' },
  cycle: { color: foco.colors.muted, fontSize: 13, marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: -5, marginBottom: 18 },
  secondary: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center' },
  primaryControl: { width: 80, height: 80, borderRadius: 40, borderWidth: 1, borderColor: foco.colors.text, backgroundColor: foco.colors.panel, alignItems: 'center', justifyContent: 'center', ...shadowGlow },
  primaryRunning: { backgroundColor: '#181A1F' },
  message: { minHeight: 42, borderRadius: 12, backgroundColor: foco.colors.panelStrong, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, marginBottom: 10 },
  messageSuccess: { borderWidth: 1, borderColor: '#3F5549' },
  messageWarning: { borderWidth: 1, borderColor: '#5B4549' },
  messageText: { color: foco.colors.text, fontSize: 12.5, textAlign: 'center' },
  sessionSummary: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: foco.colors.borderSoft, paddingVertical: 15 },
  summaryItem: { flex: 1 },
  summaryValue: { color: foco.colors.text, fontSize: 18.5, fontWeight: '650', fontVariant: ['tabular-nums'] },
  summaryLabel: { color: foco.colors.muted, fontSize: 11.5, marginTop: 4 },
  contextOption: { minHeight: 60, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 10 },
  contextOptionActive: { backgroundColor: foco.colors.text, borderRadius: 14, borderBottomColor: foco.colors.text },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { color: foco.colors.text, fontSize: 14.5, fontWeight: '600' },
  optionMeta: { color: foco.colors.muted, fontSize: 11.5, marginTop: 3 },
  optionTextActive: { color: foco.colors.bg },
  empty: { color: foco.colors.muted, fontSize: 13, textAlign: 'center', paddingVertical: 22 },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  numberField: { width: '48.5%', minHeight: 78, borderRadius: 14, borderWidth: 1, borderColor: foco.colors.border, backgroundColor: foco.colors.panel, padding: 11 },
  numberLabel: { color: foco.colors.muted, fontSize: 10.5, fontWeight: '700', letterSpacing: 0.5 },
  numberInputRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 7 },
  numberInput: { flex: 1, color: foco.colors.text, fontSize: 21, fontWeight: '650', padding: 0, fontVariant: ['tabular-nums'] },
  numberSuffix: { color: foco.colors.muted, fontSize: 11.5, paddingBottom: 3 },
  toggleRow: { minHeight: 56, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: foco.colors.borderSoft, flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { flex: 1, color: foco.colors.text, fontSize: 14 },
  toggle: { width: 44, height: 26, borderRadius: 13, backgroundColor: '#30333A', padding: 3 },
  toggleActive: { backgroundColor: foco.colors.text },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#8B8E95' },
  toggleKnobActive: { transform: [{ translateX: 18 }], backgroundColor: foco.colors.bg },
});
