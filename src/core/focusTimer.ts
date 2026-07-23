import type { FocusMode } from './model';

export type FocusPhase = 'focus' | 'break';

export type FocusRuntime = {
  mode: FocusMode;
  phase: FocusPhase;
  focusSeconds: number;
  breakSeconds: number;
  targetCycles: number;
  currentCycle: number;
  running: boolean;
  anchorMs: number;
  baseSeconds: number;
};

export function createFocusRuntime(): FocusRuntime {
  return {
    mode: 'pomodoro',
    phase: 'focus',
    focusSeconds: 50 * 60,
    breakSeconds: 10 * 60,
    targetCycles: 3,
    currentCycle: 1,
    running: false,
    anchorMs: 0,
    baseSeconds: 50 * 60,
  };
}

export function getTimerSeconds(runtime: FocusRuntime, now = Date.now()) {
  if (!runtime.running) return Math.max(0, Math.round(runtime.baseSeconds));
  const elapsed = Math.max(0, Math.floor((now - runtime.anchorMs) / 1000));
  if (runtime.mode === 'stopwatch') return Math.max(0, runtime.baseSeconds + elapsed);
  return Math.max(0, runtime.baseSeconds - elapsed);
}

export function recomputeRuntime(runtime: FocusRuntime, now = Date.now()): FocusRuntime {
  if (!runtime.running || runtime.mode === 'stopwatch') return runtime;
  const remaining = getTimerSeconds(runtime, now);
  if (remaining > 0) return runtime;
  return { ...runtime, running: false, anchorMs: 0, baseSeconds: 0 };
}

export function startTimer(runtime: FocusRuntime, now = Date.now()): FocusRuntime {
  if (runtime.running) return runtime;
  return { ...runtime, running: true, anchorMs: now };
}

export function pauseTimer(runtime: FocusRuntime, now = Date.now()): FocusRuntime {
  if (!runtime.running) return runtime;
  return { ...runtime, running: false, baseSeconds: getTimerSeconds(runtime, now), anchorMs: 0 };
}

export function resetTimer(runtime: FocusRuntime): FocusRuntime {
  return {
    ...runtime,
    phase: 'focus',
    currentCycle: 1,
    running: false,
    anchorMs: 0,
    baseSeconds: runtime.mode === 'pomodoro' ? runtime.focusSeconds : 0,
  };
}

export function setTimerMode(runtime: FocusRuntime, mode: FocusMode): FocusRuntime {
  if (runtime.mode === mode) return runtime;
  return {
    ...runtime,
    mode,
    phase: 'focus',
    currentCycle: 1,
    running: false,
    anchorMs: 0,
    baseSeconds: mode === 'pomodoro' ? runtime.focusSeconds : 0,
  };
}

export function configureTimer(runtime: FocusRuntime, values: Partial<Pick<FocusRuntime, 'focusSeconds' | 'breakSeconds' | 'targetCycles'>>): FocusRuntime {
  const focusSeconds = Math.max(60, Math.round(values.focusSeconds ?? runtime.focusSeconds));
  const breakSeconds = Math.max(60, Math.round(values.breakSeconds ?? runtime.breakSeconds));
  const targetCycles = Math.min(8, Math.max(1, Math.round(values.targetCycles ?? runtime.targetCycles)));
  return {
    ...runtime,
    focusSeconds,
    breakSeconds,
    targetCycles,
    currentCycle: Math.min(runtime.currentCycle, targetCycles),
    running: false,
    anchorMs: 0,
    baseSeconds: runtime.mode === 'pomodoro' ? (runtime.phase === 'focus' ? focusSeconds : breakSeconds) : runtime.baseSeconds,
  };
}

export function advancePomodoro(runtime: FocusRuntime): FocusRuntime {
  if (runtime.mode !== 'pomodoro') return runtime;
  if (runtime.phase === 'focus') {
    return {
      ...runtime,
      phase: 'break',
      running: false,
      anchorMs: 0,
      baseSeconds: runtime.breakSeconds,
    };
  }
  const nextCycle = runtime.currentCycle >= runtime.targetCycles ? 1 : runtime.currentCycle + 1;
  return {
    ...runtime,
    phase: 'focus',
    currentCycle: nextCycle,
    running: false,
    anchorMs: 0,
    baseSeconds: runtime.focusSeconds,
  };
}

export function getTimerProgress(runtime: FocusRuntime, now = Date.now()) {
  if (runtime.mode === 'stopwatch') {
    const elapsed = getTimerSeconds(runtime, now);
    return Math.min(1, elapsed / Math.max(1, runtime.focusSeconds));
  }
  const total = runtime.phase === 'focus' ? runtime.focusSeconds : runtime.breakSeconds;
  return Math.min(1, Math.max(0, 1 - getTimerSeconds(runtime, now) / total));
}

export function getRecordedDuration(runtime: FocusRuntime, now = Date.now()) {
  if (runtime.mode === 'stopwatch') return getTimerSeconds(runtime, now);
  const total = runtime.phase === 'focus' ? runtime.focusSeconds : runtime.breakSeconds;
  return Math.max(0, total - getTimerSeconds(runtime, now));
}
