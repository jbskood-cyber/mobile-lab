import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { useFocoStore } from '@/src/core/FocoStore';
import { formatDuration, startOfLocalDay, type FocusMode, type Task } from '@/src/core/model';
import { useFocusTimer } from '@/src/core/useFocusTimer';
import { FocusKeepAwake } from '@/src/platform/FocusKeepAwake';
import { FocoIcon, type IconName } from '@/src/ui/FocoIcon';
import { FocoScreen } from '@/src/ui/FocoShell';
import { FieldLabel, FocoSheet, SheetButton } from '@/src/ui/FocoSheet';
import { ProgressRing } from '@/src/ui/ProgressRing';
import { useFocoTheme } from '@/src/ui/FocoThemeContext';
import { normalizeIntegerDraft, parseOptionalInteger } from '@/src/ui/formModel';
import { hapticSelection, pressedStyle } from '@/src/ui/premium';

function clockLabel(seconds: number) {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

export function FocusScreen() {
  const params = useLocalSearchParams<{ taskId?: string; projectId?: string }>();
  const theme = useFocoTheme();
  const { state } = useFocoStore();
  const activeProjects = useMemo(() => state.projects.filter((project) => !project.archived), [state.projects]);
  const initialTask = params.taskId ? state.tasks.find((item) => item.id === params.taskId && !item.completed) : undefined;
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
  const [notifyDraft, setNotifyDraft] = useState('1');
  const [autoBreaks, setAutoBreaks] = useState(false);
  const [autoFocus, setAutoFocus] = useState(false);
  const [continuous, setContinuous] = useState(false);
  const [keepAwake, setKeepAwake] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [sound, setSound] = useState(true);

  useEffect(() => {
    if (initialTask) { setProjectId(initialTask.projectId); setTaskId(initialTask.id); }
    else if (params.projectId && activeProjects.some((item) => item.id === params.projectId)) { setProjectId(params.projectId); setTaskId(undefined); }
  }, [activeProjects, initialTask, params.projectId]);

  const openTasks = useMemo(() => state.tasks.filter((item) => item.projectId === projectId && !item.completed), [projectId, state.tasks]);
  const dayStart = startOfLocalDay(Date.now());
  const todaySessions = useMemo(() => state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= dayStart), [dayStart, state.sessions]);
  const focusToday = todaySessions.reduce((sum, session) => sum + session.durationSec, 0);
  const pomodorosToday = todaySessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;
  const taskSessions = task ? state.sessions.filter((session) => session.taskId === task.id && session.phase === 'focus') : [];
  const taskPomodoros = taskSessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;
  const phaseLabel = timer.runtime.mode === 'stopwatch' ? 'Cronómetro' : timer.runtime.phase === 'longBreak' ? 'Descanso largo' : timer.runtime.phase === 'shortBreak' ? 'Descanso' : 'Enfoque';

  const openSettings = () => {
    const preferences = timer.preferences;
    setFocusDraft(String(preferences.focusMinutes));
    setShortBreakDraft(String(preferences.shortBreakMinutes));
    setLongBreakDraft(String(preferences.longBreakMinutes));
    setLongEveryDraft(String(preferences.longBreakEvery));
    setCyclesDraft(String(preferences.targetCycles));
    setNotifyDraft(String(preferences.notifyBeforeEndMinutes));
    setAutoBreaks(preferences.autoStartBreaks);
    setAutoFocus(preferences.autoStartFocus);
    setContinuous(preferences.continuousMode);
    setKeepAwake(preferences.keepAwake);
    setVibration(preferences.vibrationEnabled);
    setSound(preferences.soundEnabled);
    setSettingsOpen(true);
    hapticSelection();
  };

  const focusMinutes = parseOptionalInteger(focusDraft, 1, 180);
  const shortBreakMinutes = parseOptionalInteger(shortBreakDraft, 1, 60);
  const longBreakMinutes = parseOptionalInteger(longBreakDraft, 1, 90);
  const longEvery = parseOptionalInteger(longEveryDraft, 1, 12);
  const targetCycles = parseOptionalInteger(cyclesDraft, 1, 12);
  const notifyBeforeEndMinutes = parseOptionalInteger(notifyDraft, 0, 30);
  const settingsValid = [focusMinutes, shortBreakMinutes, longBreakMinutes, longEvery, targetCycles, notifyBeforeEndMinutes].every((value) => value !== null);

  const saveSettings = () => {
    if (focusMinutes === null || shortBreakMinutes === null || longBreakMinutes === null || longEvery === null || targetCycles === null || notifyBeforeEndMinutes === null) return;
    timer.configure({ focusSeconds: focusMinutes * 60, shortBreakSeconds: shortBreakMinutes * 60, longBreakSeconds: longBreakMinutes * 60, longBreakEvery: longEvery, targetCycles, autoStartBreaks: autoBreaks, autoStartFocus: autoFocus, continuousMode: continuous }, { focusMinutes, shortBreakMinutes, longBreakMinutes, longBreakEvery: longEvery, targetCycles, autoStartBreaks: autoBreaks, autoStartFocus: autoFocus, continuousMode: continuous, keepAwake, vibrationEnabled: vibration, soundEnabled: sound, notifyBeforeEndMinutes });
    setSettingsOpen(false);
  };

  const selectProject = (nextProjectId: string) => { setProjectId(nextProjectId); setTaskId(undefined); timer.selectContext(nextProjectId, undefined); };
  const selectTask = (nextTask?: Task) => { const nextProjectId = nextTask?.projectId ?? projectId; setProjectId(nextProjectId); setTaskId(nextTask?.id); timer.selectContext(nextProjectId, nextTask?.id); setContextOpen(false); };
  const totalEstimate = task?.estimatedPomodoros ?? timer.preferences.targetCycles;
  const progress = task ? Math.min(1, taskPomodoros / Math.max(1, totalEstimate)) : Math.min(1, pomodorosToday / Math.max(1, timer.preferences.targetCycles));

  return (
    <>
      <FocusKeepAwake active={timer.runtime.running && timer.preferences.keepAwake} />
      <FocoScreen title="Enfoque" subtitle={timer.runtime.running ? 'Sesión activa' : 'Elige una tarea y empieza.'} screenKey="focus" rightIcon="sliders" rightAccessibilityLabel="Configurar enfoque" onRightPress={openSettings}>
        <View style={[styles.modeSwitch, { backgroundColor: theme.colors.panelSoft, borderColor: theme.colors.borderSoft }]}>{([['pomodoro', 'Pomodoro'], ['stopwatch', 'Cronómetro']] as Array<[FocusMode, string]>).map(([mode, label]) => { const selected = timer.runtime.mode === mode; return <Pressable key={mode} accessibilityRole="radio" accessibilityState={{ checked: selected }} disabled={timer.runtime.running} onPress={() => timer.changeMode(mode)} style={({ pressed }) => [styles.mode, selected && { backgroundColor: theme.colors.inverse }, timer.runtime.running && !selected && styles.disabled, pressed && pressedStyle]}><Text style={[styles.modeText, { color: selected ? theme.colors.inverseText : theme.colors.muted }]}>{label}</Text></Pressable>; })}</View>

        <Pressable accessibilityRole="button" accessibilityLabel="Elegir tarea o proyecto" disabled={timer.runtime.running} onPress={() => setContextOpen(true)} style={({ pressed }) => [styles.context, { borderColor: theme.colors.borderSoft }, pressed && pressedStyle]}>
          <View style={[styles.contextIcon, { backgroundColor: theme.colors.panelStrong }]}><FocoIcon name={(task ? 'checklist' : project?.icon ?? 'folder') as IconName} size={19} color={theme.colors.text} /></View>
          <View style={styles.contextCopy}><Text style={[styles.contextTitle, { color: theme.colors.text }]} numberOfLines={1}>{task?.title ?? project?.name ?? 'Sin proyecto'}</Text><Text style={[styles.contextMeta, { color: theme.colors.muted }]}>{task ? `${project?.name} · ${taskPomodoros}/${task.estimatedPomodoros} foco · ${task.durationMinutes}m` : 'Sesión libre del proyecto'}</Text></View>
          <FocoIcon name="chevron-down" size={16} color={theme.colors.muted} />
        </Pressable>

        <View style={styles.timerWrap}>
          <ProgressRing size={226} strokeWidth={9} progress={timer.progress} color={theme.colors.accent} trackColor={theme.colors.panelStrong}>
            <View style={styles.timerCopy} accessibilityLiveRegion="polite"><Text style={[styles.phase, { color: theme.colors.muted }]}>{phaseLabel}</Text><Text style={[styles.timer, { color: theme.colors.text }]} maxFontSizeMultiplier={1.03}>{timer.ready ? clockLabel(timer.seconds) : '··:··'}</Text><Text style={[styles.cycle, { color: theme.colors.muted }]}>{timer.runtime.mode === 'pomodoro' ? `Ciclo ${timer.runtime.currentCycle} de ${timer.runtime.targetCycles}` : 'Tiempo acumulado'}</Text></View>
          </ProgressRing>
        </View>

        <View style={styles.controls}>
          <Pressable accessibilityRole="button" accessibilityLabel={timer.runtime.mode === 'pomodoro' ? 'Saltar fase' : 'Reiniciar'} onPress={timer.skipPhase} style={({ pressed }) => [styles.secondary, { borderColor: theme.colors.border }, pressed && pressedStyle]}><FocoIcon name="previous" size={21} color={theme.colors.text} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel={timer.runtime.running ? 'Pausar' : 'Iniciar'} onPress={timer.toggle} style={({ pressed }) => [styles.primaryControl, { backgroundColor: theme.colors.inverse }, pressed && pressedStyle]}><FocoIcon name={timer.runtime.running ? 'pause' : 'play'} size={28} color={theme.colors.inverseText} /></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Detener y guardar" onPress={timer.stop} style={({ pressed }) => [styles.secondary, { borderColor: theme.colors.border }, pressed && pressedStyle]}><FocoIcon name="stop" size={20} color={theme.colors.text} /></Pressable>
        </View>

        {timer.message ? <View style={[styles.message, { backgroundColor: theme.colors.panel, borderColor: timer.message.tone === 'warning' ? theme.colors.warning : timer.message.tone === 'success' ? theme.colors.success : theme.colors.border }]}><Text style={[styles.messageText, { color: theme.colors.text }]}>{timer.message.text}</Text></View> : null}
        <View style={[styles.summary, { borderColor: theme.colors.borderSoft }]}><Summary value={`${pomodorosToday}/${timer.preferences.targetCycles}`} label="Pomodoros hoy" /><Summary value={formatDuration(focusToday, true)} label="Tiempo hoy" /><Summary value={`${Math.round(progress * 100)}%`} label={task ? 'Tarea' : 'Meta diaria'} /></View>
      </FocoScreen>

      <FocoSheet visible={contextOpen} title="Enfocarse en" subtitle="Vincula la sesión para medir progreso real." onClose={() => setContextOpen(false)}>
        <FieldLabel>PROYECTO</FieldLabel>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectChoices}>{activeProjects.map((item) => { const selected = projectId === item.id; return <Pressable key={item.id} onPress={() => selectProject(item.id)} style={({ pressed }) => [styles.projectChoice, { borderColor: selected ? theme.colors.inverse : theme.colors.border, backgroundColor: selected ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><Text style={[styles.projectChoiceText, { color: selected ? theme.colors.inverseText : theme.colors.muted }]}>{item.name}</Text></Pressable>; })}</ScrollView>
        <FieldLabel>TAREA</FieldLabel>
        <ContextOption title={project?.name ?? 'Proyecto'} detail="Sesión libre" icon="folder" selected={!task} onPress={() => selectTask(undefined)} />
        {openTasks.map((item) => <ContextOption key={item.id} title={item.title} detail={`${item.estimatedPomodoros} foco · ${item.durationMinutes} min`} icon="checklist" selected={task?.id === item.id} onPress={() => selectTask(item)} />)}
        {openTasks.length === 0 ? <Text style={[styles.empty, { color: theme.colors.muted }]}>No hay tareas pendientes en este proyecto.</Text> : null}
      </FocoSheet>

      <FocoSheet visible={settingsOpen} title="Ritmo de enfoque" subtitle="Los cambios se aplican al reiniciar la fase actual." onClose={() => setSettingsOpen(false)} footer={<><SheetButton label="Reiniciar" variant="secondary" onPress={() => { timer.reset(); setSettingsOpen(false); }} /><SheetButton label="Aplicar" onPress={saveSettings} disabled={!settingsValid} /></>}>
        <View style={styles.fieldGrid}><NumberField label="ENFOQUE" value={focusDraft} onChange={setFocusDraft} fallback={timer.preferences.focusMinutes} min={1} max={180} /><NumberField label="DESCANSO" value={shortBreakDraft} onChange={setShortBreakDraft} fallback={timer.preferences.shortBreakMinutes} min={1} max={60} /><NumberField label="DESCANSO LARGO" value={longBreakDraft} onChange={setLongBreakDraft} fallback={timer.preferences.longBreakMinutes} min={1} max={90} /><NumberField label="CADA N CICLOS" value={longEveryDraft} onChange={setLongEveryDraft} fallback={timer.preferences.longBreakEvery} min={1} max={12} /><NumberField label="CICLOS" value={cyclesDraft} onChange={setCyclesDraft} fallback={timer.preferences.targetCycles} min={1} max={12} /><NumberField label="AVISO PREVIO" value={notifyDraft} onChange={setNotifyDraft} fallback={timer.preferences.notifyBeforeEndMinutes} min={0} max={30} /></View>
        <Toggle label="Iniciar descansos automáticamente" value={autoBreaks} onChange={setAutoBreaks} />
        <Toggle label="Iniciar enfoque automáticamente" value={autoFocus} onChange={setAutoFocus} />
        <Toggle label="Modo continuo" value={continuous} onChange={setContinuous} />
        <Toggle label="Mantener pantalla activa" value={keepAwake} onChange={setKeepAwake} />
        <Toggle label="Vibración" value={vibration} onChange={setVibration} />
        <Toggle label="Sonido" value={sound} onChange={setSound} last />
      </FocoSheet>
    </>
  );
}

function Summary({ value, label }: { value: string; label: string }) { const theme = useFocoTheme(); return <View style={styles.summaryItem}><Text style={[styles.summaryValue, { color: theme.colors.text }]}>{value}</Text><Text style={[styles.summaryLabel, { color: theme.colors.muted }]}>{label}</Text></View>; }
function ContextOption({ title, detail, icon, selected, onPress }: { title: string; detail: string; icon: IconName; selected: boolean; onPress: () => void }) { const theme = useFocoTheme(); return <Pressable onPress={onPress} style={({ pressed }) => [styles.contextOption, { borderBottomColor: theme.colors.borderSoft, backgroundColor: selected ? theme.colors.inverse : 'transparent' }, pressed && pressedStyle]}><FocoIcon name={icon} size={18} color={selected ? theme.colors.inverseText : theme.colors.text} /><View style={styles.optionCopy}><Text style={[styles.optionTitle, { color: selected ? theme.colors.inverseText : theme.colors.text }]} numberOfLines={1}>{title}</Text><Text style={[styles.optionMeta, { color: selected ? theme.colors.inverseText : theme.colors.muted }]}>{detail}</Text></View>{selected ? <FocoIcon name="check" size={16} color={theme.colors.inverseText} /> : null}</Pressable>; }
function NumberField({ label, value, onChange, fallback, min, max }: { label: string; value: string; onChange: (value: string) => void; fallback: number; min: number; max: number }) { const theme = useFocoTheme(); const valid = parseOptionalInteger(value, min, max) !== null; return <View style={styles.field}><Text style={[styles.fieldLabel, { color: theme.colors.muted }]}>{label}</Text><TextInput value={value} onChangeText={onChange} onBlur={() => onChange(normalizeIntegerDraft(value, fallback, min, max))} keyboardType="number-pad" inputMode="numeric" selectTextOnFocus style={[styles.numberInput, { color: theme.colors.text, backgroundColor: theme.colors.panel, borderColor: valid ? theme.colors.border : theme.colors.danger }]} /></View>; }
function Toggle({ label, value, onChange, last = false }: { label: string; value: boolean; onChange: (value: boolean) => void; last?: boolean }) { const theme = useFocoTheme(); return <View style={[styles.toggleRow, !last && { borderBottomColor: theme.colors.borderSoft, borderBottomWidth: StyleSheet.hairlineWidth }]}><Text style={[styles.toggleLabel, { color: theme.colors.text }]}>{label}</Text><Switch value={value} onValueChange={(next) => { onChange(next); hapticSelection(); }} trackColor={{ false: theme.colors.panelStrong, true: theme.colors.accent }} thumbColor={theme.colors.inverseText} /></View>; }

const styles = StyleSheet.create({
  modeSwitch: { minHeight: 44, marginTop: 9, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', padding: 3 },
  mode: { flex: 1, minHeight: 36, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  modeText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11.5, lineHeight: 15 },
  disabled: { opacity: 0.35 },
  context: { minHeight: 58, marginTop: 8, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 9 },
  contextIcon: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  contextCopy: { flex: 1, minWidth: 0 },
  contextTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, lineHeight: 17 },
  contextMeta: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  timerWrap: { alignItems: 'center', marginTop: 18 },
  timerCopy: { alignItems: 'center' },
  phase: { fontFamily: 'Manrope_500Medium', fontSize: 11, lineHeight: 14 },
  timer: { fontFamily: 'Manrope_400Regular', fontSize: 48, lineHeight: 58, letterSpacing: -1.8, fontVariant: ['tabular-nums'], marginTop: 3 },
  cycle: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 2 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginTop: 13 },
  secondary: { width: 48, height: 48, borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center' },
  primaryControl: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  message: { minHeight: 40, marginTop: 11, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  messageText: { fontFamily: 'Manrope_500Medium', fontSize: 10.5, lineHeight: 14, textAlign: 'center' },
  summary: { minHeight: 66, marginTop: 12, flexDirection: 'row', alignItems: 'center', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  summaryItem: { flex: 1 },
  summaryValue: { fontFamily: 'Manrope_600SemiBold', fontSize: 15, lineHeight: 19, fontVariant: ['tabular-nums'] },
  summaryLabel: { fontFamily: 'Manrope_400Regular', fontSize: 9, lineHeight: 12, marginTop: 2 },
  projectChoices: { gap: 6, paddingBottom: 14 },
  projectChoice: { minHeight: 40, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, alignItems: 'center', justifyContent: 'center' },
  projectChoiceText: { fontFamily: 'Manrope_600SemiBold', fontSize: 11, lineHeight: 14 },
  contextOption: { minHeight: 54, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 9, borderRadius: 10 },
  optionCopy: { flex: 1, minWidth: 0 },
  optionTitle: { fontFamily: 'Manrope_600SemiBold', fontSize: 12.5, lineHeight: 16 },
  optionMeta: { fontFamily: 'Manrope_400Regular', fontSize: 9.5, lineHeight: 13, marginTop: 1 },
  empty: { fontFamily: 'Manrope_400Regular', fontSize: 10.5, lineHeight: 15, paddingVertical: 16 },
  fieldGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  field: { width: '48%' },
  fieldLabel: { fontFamily: 'Manrope_700Bold', fontSize: 8.5, lineHeight: 12, letterSpacing: 0.6, marginBottom: 4 },
  numberInput: { minHeight: 44, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 11, fontFamily: 'Manrope_600SemiBold', fontSize: 14, lineHeight: 18, fontVariant: ['tabular-nums'], marginBottom: 8 },
  toggleRow: { minHeight: 50, flexDirection: 'row', alignItems: 'center' },
  toggleLabel: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 12, lineHeight: 16, paddingRight: 10 },
});
