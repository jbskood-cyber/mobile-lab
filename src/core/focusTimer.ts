import { defaultFocusPreferences, type FocusMode, type FocusPhase, type FocusPreferences } from './model';

export type FocusRuntime = {
  mode: FocusMode;
  phase: FocusPhase;
  focusSeconds: number;
  shortBreakSeconds: number;
  longBreakSeconds: number;
  breakSeconds: number;
  longBreakEvery: number;
  targetCycles: number;
  currentCycle: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  continuousMode: boolean;
  running: boolean;
  anchorMs: number;
  baseSeconds: number;
  projectId?: string;
  taskId?: string;
};

export type TimerConfiguration = Partial<Pick<FocusRuntime,
  'focusSeconds' | 'shortBreakSeconds' | 'longBreakSeconds' | 'breakSeconds' | 'longBreakEvery' | 'targetCycles' |
  'autoStartBreaks' | 'autoStartFocus' | 'continuousMode' | 'projectId' | 'taskId'
>>;

export function createFocusRuntime(preferences: FocusPreferences = defaultFocusPreferences): FocusRuntime {
  const shortBreakSeconds = preferences.shortBreakMinutes * 60;
  return {
    mode: 'pomodoro',
    phase: 'focus',
    focusSeconds: preferences.focusMinutes * 60,
    shortBreakSeconds,
    longBreakSeconds: preferences.longBreakMinutes * 60,
    breakSeconds: shortBreakSeconds,
    longBreakEvery: preferences.longBreakEvery,
    targetCycles: preferences.targetCycles,
    currentCycle: 1,
    autoStartBreaks: preferences.autoStartBreaks,
    autoStartFocus: preferences.autoStartFocus,
    continuousMode: preferences.continuousMode,
    running: false,
    anchorMs: 0,
    baseSeconds: preferences.focusMinutes * 60,
  };
}

export function getPhaseTotalSeconds(runtime: FocusRuntime) {
  if (runtime.mode === 'stopwatch') return Math.max(1, runtime.focusSeconds);
  if (runtime.phase === 'longBreak') return runtime.longBreakSeconds;
  if (runtime.phase === 'shortBreak') return runtime.shortBreakSeconds;
  return runtime.focusSeconds;
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
  return remaining > 0 ? runtime : { ...runtime, running: false, anchorMs: 0, baseSeconds: 0 };
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

export function configureTimer(runtime: FocusRuntime, values: TimerConfiguration): FocusRuntime {
  const focusSeconds = Math.max(60, Math.round(values.focusSeconds ?? runtime.focusSeconds));
  const shortBreakSeconds = Math.max(60, Math.round(values.shortBreakSeconds ?? values.breakSeconds ?? runtime.shortBreakSeconds));
  const longBreakSeconds = Math.max(60, Math.round(values.longBreakSeconds ?? runtime.longBreakSeconds));
  const targetCycles = Math.min(12, Math.max(1, Math.round(values.targetCycles ?? runtime.targetCycles)));
  const longBreakEvery = Math.min(12, Math.max(1, Math.round(values.longBreakEvery ?? runtime.longBreakEvery)));
  const next: FocusRuntime = {
    ...runtime,
    ...values,
    focusSeconds,
    shortBreakSeconds,
    longBreakSeconds,
    breakSeconds: shortBreakSeconds,
    targetCycles,
    longBreakEvery,
    currentCycle: Math.min(runtime.currentCycle, targetCycles),
    running: false,
    anchorMs: 0,
  };
  return { ...next, baseSeconds: next.mode === 'stopwatch' ? next.baseSeconds : getPhaseTotalSeconds(next) };
}

function shouldRunNext(runtime: FocusRuntime, nextPhase: FocusPhase) {
  return runtime.continuousMode || (nextPhase === 'focus' ? runtime.autoStartFocus : runtime.autoStartBreaks);
}

export function advancePomodoro(runtime: FocusRuntime, now = Date.now()): FocusRuntime {
  if (runtime.mode !== 'pomodoro') return runtime;
  if (runtime.phase === 'focus') {
    const phase: FocusPhase = runtime.currentCycle % runtime.longBreakEvery === 0 ? 'longBreak' : 'shortBreak';
    const running = shouldRunNext(runtime, phase);
    return {
      ...runtime,
      phase,
      running,
      anchorMs: running ? now : 0,
      baseSeconds: phase === 'longBreak' ? runtime.longBreakSeconds : runtime.shortBreakSeconds,
    };
  }
  const nextCycle = runtime.currentCycle >= runtime.targetCycles ? 1 : runtime.currentCycle + 1;
  const running = shouldRunNext(runtime, 'focus');
  return {
    ...runtime,
    phase: 'focus',
    currentCycle: nextCycle,
    running,
    anchorMs: running ? now : 0,
    baseSeconds: runtime.focusSeconds,
  };
}

export function getTimerProgress(runtime: FocusRuntime, now = Date.now()) {
  if (runtime.mode === 'stopwatch') return Math.min(1, getTimerSeconds(runtime, now) / Math.max(1, runtime.focusSeconds));
  const total = getPhaseTotalSeconds(runtime);
  return Math.min(1, Math.max(0, 1 - getTimerSeconds(runtime, now) / total));
}

export function getRecordedDuration(runtime: FocusRuntime, now = Date.now()) {
  if (runtime.mode === 'stopwatch') return getTimerSeconds(runtime, now);
  return Math.max(0, getPhaseTotalSeconds(runtime) - getTimerSeconds(runtime, now));
}

export function runtimeFromPreferences(runtime: FocusRuntime, preferences: FocusPreferences) {
  return configureTimer(runtime, {
    focusSeconds: preferences.focusMinutes * 60,
    shortBreakSeconds: preferences.shortBreakMinutes * 60,
    longBreakSeconds: preferences.longBreakMinutes * 60,
    longBreakEvery: preferences.longBreakEvery,
    targetCycles: preferences.targetCycles,
    autoStartBreaks: preferences.autoStartBreaks,
    autoStartFocus: preferences.autoStartFocus,
    continuousMode: preferences.continuousMode,
  });
}
