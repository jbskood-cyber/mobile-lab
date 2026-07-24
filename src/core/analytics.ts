import { endOfLocalDay, startOfLocalDay, type FocoState, type FocusSession } from './model';

export type AnalyticsPeriod = 'day' | 'week' | 'month';

export type PeriodSeriesPoint = {
  start: number;
  focusSeconds: number;
  completedTasks: number;
  completedPomodoros: number;
};

export type PeriodStats = {
  period: AnalyticsPeriod;
  start: number;
  end: number;
  totalFocusSec: number;
  completedTasks: number;
  completedPomodoros: number;
  plannedPomodoros: number;
  averageSessionSec: number;
  goalRate: number;
  changePercent: number;
  series: PeriodSeriesPoint[];
};

export type HourlyProductivityPoint = {
  hour: number;
  focusSeconds: number;
  sessionCount: number;
};

const DAY = 24 * 60 * 60 * 1000;

export function getPeriodBounds(period: AnalyticsPeriod, anchor = Date.now()) {
  const date = new Date(anchor);
  if (period === 'day') {
    const start = startOfLocalDay(anchor);
    return { start, end: endOfLocalDay(anchor), unitMs: 60 * 60 * 1000, unitCount: 24 };
  }
  if (period === 'week') {
    const weekday = (date.getDay() + 6) % 7;
    const start = startOfLocalDay(anchor) - weekday * DAY;
    return { start, end: start + 7 * DAY, unitMs: DAY, unitCount: 7 };
  }
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  const start = date.getTime();
  date.setMonth(date.getMonth() + 1);
  const end = date.getTime();
  return { start, end, unitMs: DAY, unitCount: Math.round((end - start) / DAY) };
}

function previousAnchor(period: AnalyticsPeriod, start: number) {
  if (period === 'day') return start - DAY;
  if (period === 'week') return start - 7 * DAY;
  const date = new Date(start);
  date.setMonth(date.getMonth() - 1);
  return date.getTime();
}

function sessionsInRange(state: FocoState, start: number, end: number) {
  return state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= start && session.endedAt < end);
}

function tasksCompletedInRange(state: FocoState, start: number, end: number) {
  return state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= start && task.completedAt < end);
}

function tasksPlannedInRange(state: FocoState, start: number, end: number) {
  return state.tasks.filter((task) => {
    const plannedAt = task.plannedStartAt ?? task.dueAt;
    return plannedAt !== undefined && plannedAt >= start && plannedAt < end;
  });
}

function summarize(state: FocoState, period: AnalyticsPeriod, anchor: number, includeComparison: boolean): PeriodStats {
  const bounds = getPeriodBounds(period, anchor);
  const sessions = sessionsInRange(state, bounds.start, bounds.end);
  const completedTasks = tasksCompletedInRange(state, bounds.start, bounds.end);
  const plannedTasks = tasksPlannedInRange(state, bounds.start, bounds.end);
  const totalFocusSec = sessions.reduce((sum, session) => sum + session.durationSec, 0);
  const completedPomodoros = sessions.filter((session) => session.mode === 'pomodoro' && session.completed).length;
  const plannedPomodoros = plannedTasks.reduce((sum, task) => sum + task.estimatedPomodoros, 0);
  const series = Array.from({ length: bounds.unitCount }, (_, index): PeriodSeriesPoint => {
    const start = bounds.start + index * bounds.unitMs;
    const end = Math.min(bounds.end, start + bounds.unitMs);
    const unitSessions = sessions.filter((session) => session.endedAt >= start && session.endedAt < end);
    return {
      start,
      focusSeconds: unitSessions.reduce((sum, session) => sum + session.durationSec, 0),
      completedTasks: completedTasks.filter((task) => (task.completedAt ?? 0) >= start && (task.completedAt ?? 0) < end).length,
      completedPomodoros: unitSessions.filter((session) => session.mode === 'pomodoro' && session.completed).length,
    };
  });
  let changePercent = 0;
  if (includeComparison) {
    const previous = summarize(state, period, previousAnchor(period, bounds.start), false);
    changePercent = previous.totalFocusSec === 0 ? (totalFocusSec > 0 ? 100 : 0) : ((totalFocusSec - previous.totalFocusSec) / previous.totalFocusSec) * 100;
  }
  const dailyGoalSec = state.preferences.focusMinutes * state.preferences.targetCycles * 60;
  const goalBase = Math.max(1, period === 'day' ? dailyGoalSec : period === 'week' ? dailyGoalSec * 7 : dailyGoalSec * bounds.unitCount);
  return {
    period,
    start: bounds.start,
    end: bounds.end,
    totalFocusSec,
    completedTasks: completedTasks.length,
    completedPomodoros,
    plannedPomodoros,
    averageSessionSec: sessions.length === 0 ? 0 : Math.round(totalFocusSec / sessions.length),
    goalRate: Math.min(1, totalFocusSec / goalBase),
    changePercent,
    series,
  };
}

export function getPeriodStats(state: FocoState, period: AnalyticsPeriod, anchor = Date.now()) {
  return summarize(state, period, anchor, true);
}

export function getHourlyProductivity(state: FocoState, days = 28, anchor = Date.now()): HourlyProductivityPoint[] {
  const end = endOfLocalDay(anchor);
  const start = end - Math.max(1, Math.round(days)) * DAY;
  const values = Array.from({ length: 24 }, (_, hour): HourlyProductivityPoint => ({ hour, focusSeconds: 0, sessionCount: 0 }));

  for (const session of state.sessions) {
    if (session.phase !== 'focus' || session.startedAt < start || session.startedAt >= end || session.durationSec <= 0) continue;
    const point = values[new Date(session.startedAt).getHours()];
    if (!point) continue;
    point.focusSeconds += session.durationSec;
    point.sessionCount += 1;
  }

  return values;
}

export function getStreak(state: FocoState, anchor = Date.now()) {
  const activeDays = new Set<number>();
  for (const session of state.sessions) {
    if (session.phase === 'focus' && session.durationSec > 0) activeDays.add(startOfLocalDay(session.endedAt));
  }
  for (const task of state.tasks) {
    if (task.completedAt !== undefined) activeDays.add(startOfLocalDay(task.completedAt));
  }
  let cursor = startOfLocalDay(anchor);
  if (!activeDays.has(cursor)) cursor -= DAY;
  let streak = 0;
  while (activeDays.has(cursor)) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}

export function getProjectDistribution(state: FocoState, period: AnalyticsPeriod, anchor = Date.now()) {
  const { start, end } = getPeriodBounds(period, anchor);
  const projects = new Map(state.projects.map((project) => [project.id, project]));
  const totals = new Map<string, number>();
  for (const session of sessionsInRange(state, start, end)) totals.set(session.projectId, (totals.get(session.projectId) ?? 0) + session.durationSec);
  return [...totals.entries()].map(([projectId, focusSeconds]) => ({
    projectId,
    projectName: projects.get(projectId)?.name ?? 'Sin proyecto',
    focusSeconds,
  })).sort((a, b) => b.focusSeconds - a.focusSeconds);
}

export function getTaskDistribution(state: FocoState, period: AnalyticsPeriod, anchor = Date.now()) {
  const { start, end } = getPeriodBounds(period, anchor);
  const tasks = new Map(state.tasks.map((task) => [task.id, task]));
  const totals = new Map<string, number>();
  for (const session of sessionsInRange(state, start, end)) {
    if (session.taskId) totals.set(session.taskId, (totals.get(session.taskId) ?? 0) + session.durationSec);
  }
  return [...totals.entries()].map(([taskId, focusSeconds]) => ({ taskId, taskTitle: tasks.get(taskId)?.title ?? 'Tarea eliminada', focusSeconds })).sort((a, b) => b.focusSeconds - a.focusSeconds);
}

export function getRecentSessions(state: FocoState, limit = 10) {
  const projects = new Map(state.projects.map((project) => [project.id, project.name]));
  const tasks = new Map(state.tasks.map((task) => [task.id, task.title]));
  return [...state.sessions]
    .filter((session) => session.phase === 'focus')
    .sort((a, b) => b.endedAt - a.endedAt)
    .slice(0, Math.max(0, limit))
    .map((session: FocusSession) => ({
      ...session,
      projectName: projects.get(session.projectId) ?? 'Sin proyecto',
      taskTitle: session.taskId ? tasks.get(session.taskId) ?? 'Tarea eliminada' : undefined,
    }));
}

export function getActivityHeatmap(state: FocoState, days = 90, anchor = Date.now()) {
  const end = endOfLocalDay(anchor);
  const start = end - Math.max(1, days) * DAY;
  const values = Array.from({ length: Math.max(1, days) }, (_, index) => ({ start: start + index * DAY, focusSeconds: 0, completedTasks: 0 }));
  for (const session of sessionsInRange(state, start, end)) {
    const index = Math.floor((startOfLocalDay(session.endedAt) - start) / DAY);
    const point = values[index];
    if (point) point.focusSeconds += session.durationSec;
  }
  for (const task of tasksCompletedInRange(state, start, end)) {
    const index = Math.floor((startOfLocalDay(task.completedAt ?? start) - start) / DAY);
    const point = values[index];
    if (point) point.completedTasks += 1;
  }
  return values;
}
