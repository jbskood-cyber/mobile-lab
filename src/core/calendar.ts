import { endOfLocalDay, startOfLocalDay, type FocoState, type Task } from './model';

export type CalendarDay = {
  timestamp: number;
  day: number;
  inMonth: boolean;
  isToday: boolean;
  taskCount: number;
  completedCount: number;
  focusSeconds: number;
};

export function startOfMonth(anchor: number) {
  const date = new Date(anchor);
  date.setHours(0, 0, 0, 0);
  date.setDate(1);
  return date.getTime();
}

export function shiftMonth(anchor: number, delta: number) {
  const date = new Date(startOfMonth(anchor));
  date.setMonth(date.getMonth() + delta);
  return date.getTime();
}

export function buildMonthGrid(state: FocoState, anchor = Date.now(), now = Date.now()): CalendarDay[] {
  const monthStart = startOfMonth(anchor);
  const month = new Date(monthStart).getMonth();
  const weekdayMondayFirst = (new Date(monthStart).getDay() + 6) % 7;
  const gridStartDate = new Date(monthStart);
  gridStartDate.setDate(gridStartDate.getDate() - weekdayMondayFirst);
  const gridStart = gridStartDate.getTime();
  const today = startOfLocalDay(now);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(gridStart);
    date.setDate(date.getDate() + index);
    const timestamp = date.getTime();
    const next = endOfLocalDay(timestamp);
    const tasks = getTasksForCalendarDay(state, timestamp);
    const focusSeconds = state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= timestamp && session.endedAt < next).reduce((sum, session) => sum + session.durationSec, 0);
    return {
      timestamp,
      day: date.getDate(),
      inMonth: date.getMonth() === month,
      isToday: timestamp === today,
      taskCount: tasks.length,
      completedCount: tasks.filter((task) => task.completed).length,
      focusSeconds,
    };
  });
}

export function getTasksForCalendarDay(state: FocoState, day: number) {
  const start = startOfLocalDay(day);
  const end = endOfLocalDay(day);
  return state.tasks.filter((task) => {
    const anchor = task.plannedStartAt ?? task.dueAt ?? task.completedAt;
    return anchor !== undefined && anchor >= start && anchor < end;
  }).sort(compareCalendarTasks);
}

export function getTimelinePosition(task: Task, day: number, workdayStartHour: number, minuteHeight = 1.05) {
  const dayStart = new Date(startOfLocalDay(day));
  dayStart.setHours(workdayStartHour, 0, 0, 0);
  const start = task.plannedStartAt ?? task.dueAt ?? dayStart.getTime();
  const minutes = Math.max(0, (start - dayStart.getTime()) / 60_000);
  return {
    top: minutes * minuteHeight,
    height: Math.max(38, task.durationMinutes * minuteHeight),
  };
}

function compareCalendarTasks(a: Task, b: Task) {
  const aAnchor = a.plannedStartAt ?? a.dueAt ?? Infinity;
  const bAnchor = b.plannedStartAt ?? b.dueAt ?? Infinity;
  return aAnchor - bAnchor || a.sortOrder - b.sortOrder;
}
