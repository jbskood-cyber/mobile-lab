import Storage from 'expo-sqlite/kv-store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { cancelScheduledNotification, scheduleFocusPhaseNotification } from '@/src/platform/reminders';
import { useFocoUI } from '@/src/ui/FocoUIContext';
import { hapticImpact, hapticSelection, hapticSuccess, hapticWarning } from '@/src/ui/premium';
import { useFocoStore } from './FocoStore';
import {
  advancePomodoro,
  configureTimer,
  createFocusRuntime,
  getPhaseTotalSeconds,
  getRecordedDuration,
  getTimerProgress,
  getTimerSeconds,
  pauseTimer,
  recomputeRuntime,
  resetTimer,
  runtimeFromPreferences,
  setTimerMode,
  startTimer,
  type FocusRuntime,
  type TimerConfiguration,
} from './focusTimer';
import type { FocusMode, FocusPreferences, FocusPhase } from './model';

const TIMER_KEY = 'foco:timer:v2';
const LEGACY_TIMER_KEY = 'foco:timer:v1';

type TimerMessage = { text: string; tone: 'neutral' | 'success' | 'warning' };

function normalizeRuntime(value: unknown, preferences: FocusPreferences): FocusRuntime {
  const fallback = createFocusRuntime(preferences);
  if (!value || typeof value !== 'object') return fallback;
  const candidate = value as Partial<FocusRuntime> & { phase?: FocusPhase | 'break'; breakSeconds?: number };
  const mode: FocusMode = candidate.mode === 'stopwatch' ? 'stopwatch' : 'pomodoro';
  const phase: FocusPhase = candidate.phase === 'longBreak' ? 'longBreak' : candidate.phase === 'shortBreak' || candidate.phase === 'break' ? 'shortBreak' : 'focus';
  const runtime = configureTimer(fallback, {
    focusSeconds: candidate.focusSeconds,
    shortBreakSeconds: candidate.shortBreakSeconds ?? candidate.breakSeconds,
    longBreakSeconds: candidate.longBreakSeconds,
    longBreakEvery: candidate.longBreakEvery,
    targetCycles: candidate.targetCycles,
    autoStartBreaks: candidate.autoStartBreaks,
    autoStartFocus: candidate.autoStartFocus,
    continuousMode: candidate.continuousMode,
    projectId: candidate.projectId,
    taskId: candidate.taskId,
  });
  return {
    ...runtime,
    mode,
    phase,
    currentCycle: Math.max(1, Math.min(runtime.targetCycles, Math.round(candidate.currentCycle ?? 1))),
    running: Boolean(candidate.running),
    anchorMs: Math.max(0, Number(candidate.anchorMs ?? 0)),
    baseSeconds: Math.max(0, Number(candidate.baseSeconds ?? (mode === 'stopwatch' ? 0 : getPhaseTotalSeconds({ ...runtime, phase })))),
  };
}

function phaseCopy(phase: FocusPhase) {
  if (phase === 'focus') return { completeTitle: 'Bloque completado', completeBody: 'Es momento de descansar.', warning: 'Tu bloque termina pronto.' };
  if (phase === 'longBreak') return { completeTitle: 'Descanso largo completado', completeBody: 'Vuelve con energía a tu siguiente bloque.', warning: 'El descanso largo termina pronto.' };
  return { completeTitle: 'Descanso completado', completeBody: 'Tu siguiente bloque está listo.', warning: 'El descanso termina pronto.' };
}

export function useFocusTimer(projectId: string, taskId?: string) {
  const { state, addSession, resetToken, updatePreferences } = useFocoStore();
  const { setFocusImmersive } = useFocoUI();
  const [runtime, setRuntime] = useState<FocusRuntime>(() => ({ ...createFocusRuntime(state.preferences), projectId, taskId }));
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<TimerMessage | null>(null);
  const lastCompletedAnchor = useRef<number | null>(null);
  const completeNotification = useRef<string | undefined>();
  const warningNotification = useRef<string | undefined>();

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await Storage.getItem(TIMER_KEY) ?? await Storage.getItem(LEGACY_TIMER_KEY);
        if (!active) return;
        const parsed = stored ? JSON.parse(stored) : undefined;
        setRuntime({ ...normalizeRuntime(parsed, state.preferences), projectId: (parsed as FocusRuntime | undefined)?.projectId ?? projectId, taskId: (parsed as FocusRuntime | undefined)?.taskId ?? taskId });
      } catch {
        if (active) setRuntime({ ...createFocusRuntime(state.preferences), projectId, taskId });
      } finally {
        if (active) {
          setNow(Date.now());
          setReady(true);
        }
      }
    })();
    return () => { active = false; };
    // Initial hydration must happen once; route context is reconciled separately.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || runtime.running) return;
    setRuntime((current) => ({ ...current, projectId, taskId }));
  }, [projectId, ready, runtime.running, taskId]);

  useEffect(() => {
    if (!ready || runtime.running) return;
    setRuntime((current) => runtimeFromPreferences(current, state.preferences));
  }, [ready, runtime.running, state.preferences]);

  useEffect(() => {
    if (!ready || resetToken === 0) return;
    const reset = { ...createFocusRuntime(state.preferences), projectId, taskId };
    lastCompletedAnchor.current = null;
    setRuntime(reset);
    setNow(Date.now());
    setMessage({ text: 'Datos locales reiniciados.', tone: 'neutral' });
    void Storage.setItem(TIMER_KEY, JSON.stringify(reset)).catch(() => undefined);
  }, [projectId, ready, resetToken, state.preferences, taskId]);

  useEffect(() => {
    setFocusImmersive(runtime.running && runtime.phase === 'focus');
    return () => setFocusImmersive(false);
  }, [runtime.phase, runtime.running, setFocusImmersive]);

  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => void Storage.setItem(TIMER_KEY, JSON.stringify(runtime)).catch(() => undefined), 100);
    return () => clearTimeout(timeout);
  }, [ready, runtime]);

  useEffect(() => {
    if (!runtime.running) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [runtime.running]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      const timestamp = Date.now();
      setRuntime((current) => recomputeRuntime(current, timestamp));
      setNow(timestamp);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 4200);
    return () => clearTimeout(timeout);
  }, [message]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      if (completeNotification.current) await cancelScheduledNotification(completeNotification.current);
      if (warningNotification.current) await cancelScheduledNotification(warningNotification.current);
      completeNotification.current = undefined;
      warningNotification.current = undefined;
      if (!runtime.running) return;
      const remaining = getTimerSeconds(runtime, Date.now());
      const copy = phaseCopy(runtime.phase);
      const completeId = await scheduleFocusPhaseNotification(remaining, copy.completeTitle, copy.completeBody, { phase: runtime.phase, taskId: runtime.taskId, projectId: runtime.projectId });
      const warningSec = state.preferences.notifyBeforeEndMinutes * 60;
      const warningId = warningSec > 0 && remaining > warningSec
        ? await scheduleFocusPhaseNotification(remaining - warningSec, 'FOCO', copy.warning, { phase: runtime.phase, warning: true })
        : undefined;
      if (cancelled) {
        await cancelScheduledNotification(completeId);
        await cancelScheduledNotification(warningId);
      } else {
        completeNotification.current = completeId;
        warningNotification.current = warningId;
      }
    })();
    return () => { cancelled = true; };
  }, [runtime.anchorMs, runtime.phase, runtime.projectId, runtime.running, runtime.taskId, state.preferences.notifyBeforeEndMinutes]);

  const seconds = getTimerSeconds(runtime, now);
  const progress = getTimerProgress(runtime, now);

  useEffect(() => {
    if (!ready || !runtime.running || runtime.mode !== 'pomodoro' || seconds > 0) return;
    if (runtime.anchorMs > 0 && lastCompletedAnchor.current === runtime.anchorMs) return;
    lastCompletedAnchor.current = runtime.anchorMs;
    const endedAt = Date.now();
    const plannedSec = getPhaseTotalSeconds(runtime);
    addSession({
      projectId: runtime.projectId ?? projectId,
      taskId: runtime.taskId,
      mode: 'pomodoro',
      phase: runtime.phase,
      startedAt: endedAt - plannedSec * 1000,
      endedAt,
      durationSec: plannedSec,
      plannedSec,
      completed: true,
      interrupted: false,
      cycleNumber: runtime.currentCycle,
    });
    if (runtime.phase === 'focus') {
      setMessage({ text: 'Bloque completado y guardado.', tone: 'success' });
      hapticSuccess();
    } else {
      setMessage({ text: runtime.phase === 'longBreak' ? 'Descanso largo completado.' : 'Descanso completado.', tone: 'neutral' });
      hapticSelection();
    }
    setRuntime((current) => advancePomodoro({ ...current, running: false, baseSeconds: 0, anchorMs: 0 }, endedAt));
    setNow(endedAt);
  }, [addSession, projectId, ready, runtime, seconds]);

  const toggle = useCallback(() => {
    const timestamp = Date.now();
    setRuntime((current) => current.running ? pauseTimer(current, timestamp) : startTimer(current, timestamp));
    setNow(timestamp);
    setMessage(null);
    hapticImpact();
  }, []);

  const stop = useCallback(() => {
    const endedAt = Date.now();
    setRuntime((current) => {
      const durationSec = getRecordedDuration(current, endedAt);
      if (durationSec >= 60) {
        addSession({
          projectId: current.projectId ?? projectId,
          taskId: current.taskId,
          mode: current.mode,
          phase: current.phase,
          startedAt: endedAt - durationSec * 1000,
          endedAt,
          durationSec,
          plannedSec: current.mode === 'stopwatch' ? Math.max(durationSec, current.focusSeconds) : getPhaseTotalSeconds(current),
          completed: false,
          interrupted: true,
          cycleNumber: current.currentCycle,
        });
        setMessage({ text: current.phase === 'focus' ? 'Sesión parcial guardada.' : 'Descanso interrumpido registrado.', tone: 'success' });
        hapticSuccess();
      } else {
        setMessage({ text: 'Sesión demasiado breve para registrarla.', tone: 'warning' });
        hapticWarning();
      }
      return resetTimer(current);
    });
    setNow(endedAt);
  }, [addSession, projectId]);

  const reset = useCallback(() => {
    setRuntime((current) => resetTimer(current));
    setNow(Date.now());
    setMessage({ text: 'Temporizador reiniciado.', tone: 'neutral' });
    hapticSelection();
  }, []);

  const changeMode = useCallback((mode: FocusMode) => {
    setRuntime((current) => setTimerMode(current, mode));
    setNow(Date.now());
    setMessage(null);
    hapticSelection();
  }, []);

  const configure = useCallback((values: TimerConfiguration, preferencePatch?: Partial<FocusPreferences>) => {
    setRuntime((current) => configureTimer(current, values));
    if (preferencePatch) updatePreferences(preferencePatch);
    setNow(Date.now());
    setMessage({ text: 'Configuración aplicada.', tone: 'success' });
    hapticSuccess();
  }, [updatePreferences]);

  const skipPhase = useCallback(() => {
    const timestamp = Date.now();
    setRuntime((current) => current.mode === 'pomodoro' ? advancePomodoro(pauseTimer(current, timestamp), timestamp) : resetTimer(current));
    setNow(timestamp);
    setMessage({ text: runtime.mode === 'pomodoro' ? 'Fase omitida.' : 'Cronómetro reiniciado.', tone: 'neutral' });
    hapticSelection();
  }, [runtime.mode]);

  const selectContext = useCallback((nextProjectId: string, nextTaskId?: string) => {
    setRuntime((current) => current.running ? current : { ...current, projectId: nextProjectId, taskId: nextTaskId });
    hapticSelection();
  }, []);

  return useMemo(() => ({
    runtime,
    seconds,
    progress,
    ready,
    message,
    preferences: state.preferences,
    toggle,
    stop,
    reset,
    changeMode,
    configure,
    skipPhase,
    selectContext,
  }), [runtime, seconds, progress, ready, message, state.preferences, toggle, stop, reset, changeMode, configure, skipPhase, selectContext]);
}
