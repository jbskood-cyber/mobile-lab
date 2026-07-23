import Storage from 'expo-sqlite/kv-store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { hapticImpact, hapticSelection, hapticSuccess, hapticWarning } from '@/src/ui/premium';
import { useFocoStore } from './FocoStore';
import {
  advancePomodoro,
  configureTimer,
  createFocusRuntime,
  getRecordedDuration,
  getTimerProgress,
  getTimerSeconds,
  pauseTimer,
  resetTimer,
  setTimerMode,
  startTimer,
  type FocusRuntime,
} from './focusTimer';
import type { FocusMode } from './model';

const TIMER_KEY = 'foco:timer:v1';

function normalizeRuntime(value: unknown): FocusRuntime {
  const fallback = createFocusRuntime();
  if (!value || typeof value !== 'object') return fallback;
  const candidate = value as Partial<FocusRuntime>;
  if (candidate.mode !== 'pomodoro' && candidate.mode !== 'stopwatch') return fallback;
  return {
    ...fallback,
    ...candidate,
    focusSeconds: Math.max(60, Number(candidate.focusSeconds ?? fallback.focusSeconds)),
    breakSeconds: Math.max(60, Number(candidate.breakSeconds ?? fallback.breakSeconds)),
    targetCycles: Math.min(8, Math.max(1, Number(candidate.targetCycles ?? fallback.targetCycles))),
    currentCycle: Math.max(1, Number(candidate.currentCycle ?? fallback.currentCycle)),
    baseSeconds: Math.max(0, Number(candidate.baseSeconds ?? fallback.baseSeconds)),
    anchorMs: Math.max(0, Number(candidate.anchorMs ?? 0)),
    running: Boolean(candidate.running),
  };
}

export function useFocusTimer(projectId: string) {
  const { addSession } = useFocoStore();
  const [runtime, setRuntime] = useState<FocusRuntime>(createFocusRuntime);
  const [now, setNow] = useState(Date.now());
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const lastCompletedAnchor = useRef<number | null>(null);

  useEffect(() => {
    let active = true;
    void Storage.getItem(TIMER_KEY).then((stored) => {
      if (!active) return;
      try {
        setRuntime(stored ? normalizeRuntime(JSON.parse(stored)) : createFocusRuntime());
      } catch {
        setRuntime(createFocusRuntime());
      } finally {
        setNow(Date.now());
        setReady(true);
      }
    }, () => {
      if (active) {
        setRuntime(createFocusRuntime());
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timeout = setTimeout(() => {
      void Storage.setItem(TIMER_KEY, JSON.stringify(runtime)).catch(() => undefined);
    }, 100);
    return () => clearTimeout(timeout);
  }, [ready, runtime]);

  useEffect(() => {
    if (!runtime.running) return;
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [runtime.running]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(() => setMessage(null), 3600);
    return () => clearTimeout(timeout);
  }, [message]);

  const seconds = getTimerSeconds(runtime, now);
  const progress = getTimerProgress(runtime, now);

  useEffect(() => {
    if (!ready || !runtime.running || runtime.mode !== 'pomodoro' || seconds > 0) return;
    if (runtime.anchorMs > 0 && lastCompletedAnchor.current === runtime.anchorMs) return;
    lastCompletedAnchor.current = runtime.anchorMs;

    const endedAt = Date.now();
    if (runtime.phase === 'focus') {
      addSession({
        projectId,
        mode: 'pomodoro',
        startedAt: endedAt - runtime.focusSeconds * 1000,
        endedAt,
        durationSec: runtime.focusSeconds,
      });
      setMessage('Sesión guardada en tus estadísticas.');
      hapticSuccess();
    } else {
      setMessage('Descanso completado.');
      hapticSelection();
    }
    setRuntime((current) => advancePomodoro({ ...current, running: false, baseSeconds: 0, anchorMs: 0 }));
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
      if (current.phase === 'focus' && durationSec >= 60) {
        addSession({
          projectId,
          mode: current.mode,
          startedAt: endedAt - durationSec * 1000,
          endedAt,
          durationSec,
        });
        setMessage('Sesión guardada en tus estadísticas.');
        hapticSuccess();
      } else {
        setMessage('Sesión demasiado breve para registrarla.');
        hapticWarning();
      }
      return resetTimer(current);
    });
    setNow(endedAt);
  }, [addSession, projectId]);

  const reset = useCallback(() => {
    setRuntime((current) => resetTimer(current));
    setNow(Date.now());
    setMessage('Temporizador reiniciado.');
    hapticSelection();
  }, []);

  const changeMode = useCallback((mode: FocusMode) => {
    setRuntime((current) => setTimerMode(current, mode));
    setNow(Date.now());
    setMessage(null);
    hapticSelection();
  }, []);

  const configure = useCallback((values: Partial<Pick<FocusRuntime, 'focusSeconds' | 'breakSeconds' | 'targetCycles'>>) => {
    setRuntime((current) => configureTimer(current, values));
    setNow(Date.now());
    setMessage('Configuración aplicada.');
    hapticSuccess();
  }, []);

  const skipPhase = useCallback(() => {
    setRuntime((current) => current.mode === 'pomodoro' ? advancePomodoro(pauseTimer(current, Date.now())) : resetTimer(current));
    setNow(Date.now());
    setMessage(null);
    hapticSelection();
  }, []);

  return useMemo(() => ({
    runtime,
    seconds,
    progress,
    ready,
    message,
    toggle,
    stop,
    reset,
    changeMode,
    configure,
    skipPhase,
  }), [runtime, seconds, progress, ready, message, toggle, stop, reset, changeMode, configure, skipPhase]);
}
