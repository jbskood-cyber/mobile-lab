import { atLocalTime, endOfLocalDay, scheduleTask, startOfLocalDay, type FocoState, type Task } from './model';

export type DayGap = { start: number; end: number; minutes: number };
export type DayPlan = {
  dayStart: number;
  dayEnd: number;
  scheduled: Task[];
  flexible: Task[];
  inbox: Task[];
  gaps: DayGap[];
  scheduledMinutes: number;
  flexibleMinutes: number;
  capacityMinutes: number;
  freeMinutes: number;
  overloadMinutes: number;
};

function taskAnchor(task: Task) {
  return task.plannedStartAt ?? task.dueAt;
}

function within(timestamp: number | undefined, start: number, end: number) {
  return timestamp !== undefined && timestamp >= start && timestamp < end;
}

export function buildDayPlan(state: FocoState, day = Date.now()): DayPlan {
  const localDay = startOfLocalDay(day);
  const dayStart = atLocalTime(localDay, state.planning.workdayStartHour);
  const dayEnd = atLocalTime(localDay, state.planning.workdayEndHour);
  const capacityMinutes = Math.max(0, Math.round((dayEnd - dayStart) / 60_000));
  const open = state.tasks.filter((task) => !task.completed);
  const scheduled = open
    .filter((task) => within(task.plannedStartAt, localDay, endOfLocalDay(localDay)))
    .sort((a, b) => (a.plannedStartAt ?? 0) - (b.plannedStartAt ?? 0));
  const scheduledIds = new Set(scheduled.map((task) => task.id));
  const flexible = open
    .filter((task) => !task.captured && !scheduledIds.has(task.id) && within(task.dueAt, localDay, endOfLocalDay(localDay)))
    .sort((a, b) => priorityValue(b) - priorityValue(a) || (a.dueAt ?? Infinity) - (b.dueAt ?? Infinity));
  const inbox = open.filter((task) => task.captured).sort((a, b) => b.createdAt - a.createdAt);
  const gaps: DayGap[] = [];
  let cursor = dayStart;
  for (const task of scheduled) {
    const rawStart = task.plannedStartAt ?? cursor;
    const start = Math.max(dayStart, rawStart);
    if (start > cursor) gaps.push({ start: cursor, end: start, minutes: Math.round((start - cursor) / 60_000) });
    const finish = start + task.durationMinutes * 60_000 + state.planning.bufferMinutes * 60_000;
    cursor = Math.max(cursor, finish);
  }
  if (cursor < dayEnd) gaps.push({ start: cursor, end: dayEnd, minutes: Math.round((dayEnd - cursor) / 60_000) });
  const scheduledMinutes = scheduled.reduce((sum, task) => sum + task.durationMinutes + state.planning.bufferMinutes, 0);
  const flexibleMinutes = flexible.reduce((sum, task) => sum + task.durationMinutes + state.planning.bufferMinutes, 0);
  const freeMinutes = Math.max(0, capacityMinutes - scheduledMinutes - flexibleMinutes);
  return {
    dayStart,
    dayEnd,
    scheduled,
    flexible,
    inbox,
    gaps,
    scheduledMinutes,
    flexibleMinutes,
    capacityMinutes,
    freeMinutes,
    overloadMinutes: Math.max(0, scheduledMinutes + flexibleMinutes - capacityMinutes),
  };
}

export function findBestGap(state: FocoState, task: Task, day = Date.now()) {
  const plan = buildDayPlan(state, day);
  const required = task.durationMinutes + state.planning.bufferMinutes;
  return plan.gaps.find((gap) => gap.minutes >= required)?.start;
}

export function placeTaskInBestGap(state: FocoState, taskId: string, day = Date.now(), now = Date.now()) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return state;
  const slot = findBestGap(state, task, day);
  return slot === undefined ? state : scheduleTask(state, taskId, slot, now);
}

export function getReplanQueue(state: FocoState, now = Date.now()) {
  const today = startOfLocalDay(now);
  return state.tasks
    .filter((task) => !task.completed && !task.captured && task.dueAt !== undefined && task.dueAt < today)
    .sort((a, b) => priorityValue(b) - priorityValue(a) || (a.dueAt ?? 0) - (b.dueAt ?? 0));
}

export function getMomentumCandidates(state: FocoState, now = Date.now()) {
  const today = startOfLocalDay(now);
  return state.tasks
    .filter((task) => !task.completed && !task.captured)
    .map((task) => {
      const anchor = taskAnchor(task);
      const overdueDays = anchor === undefined ? 0 : Math.max(0, Math.floor((today - startOfLocalDay(anchor)) / 86_400_000));
      const dueToday = anchor !== undefined && startOfLocalDay(anchor) === today;
      const compactBonus = Math.max(0, 60 - task.durationMinutes) / 15;
      const score = priorityValue(task) * 20 + overdueDays * 8 + (dueToday ? 12 : 0) + (task.inProgress ? 18 : 0) + compactBonus + (task.firstStep ? 2 : 0);
      return { task, score };
    })
    .sort((a, b) => b.score - a.score || (a.task.dueAt ?? Infinity) - (b.task.dueAt ?? Infinity));
}

export function getMomentumTask(state: FocoState, now = Date.now(), excluded: string[] = []) {
  const blocked = new Set(excluded);
  return getMomentumCandidates(state, now).find((candidate) => !blocked.has(candidate.task.id))?.task;
}

function priorityValue(task: Task) {
  if (task.priority === 'Alta') return 3;
  if (task.priority === 'Media') return 2;
  return 1;
}
