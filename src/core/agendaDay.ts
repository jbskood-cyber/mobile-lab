import {
  endOfLocalDay,
  startOfLocalDay,
  type FocusSession,
  type FocoState,
} from './model';

export type AgendaSessionEvent = {
  id: string;
  sessionId: string;
  projectId: string;
  projectName: string;
  taskId?: string;
  taskTitle?: string;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  mode: FocusSession['mode'];
  completed: boolean;
  interrupted: boolean;
};

function overlapsDay(session: FocusSession, dayStart: number, dayEnd: number) {
  return session.startedAt < dayEnd && session.endedAt > dayStart;
}

export function getAgendaSessionEvents(state: FocoState, day: number): AgendaSessionEvent[] {
  const dayStart = startOfLocalDay(day);
  const dayEnd = endOfLocalDay(day);
  const projectNames = new Map(state.projects.map((project) => [project.id, project.name]));
  const taskTitles = new Map(state.tasks.map((task) => [task.id, task.title]));

  return state.sessions
    .filter((session) => session.phase === 'focus' && overlapsDay(session, dayStart, dayEnd))
    .map((session) => ({
      id: `session-${session.id}`,
      sessionId: session.id,
      projectId: session.projectId,
      projectName: projectNames.get(session.projectId) ?? 'Sin proyecto',
      taskId: session.taskId,
      taskTitle: session.taskId ? taskTitles.get(session.taskId) : undefined,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
      durationSec: session.durationSec,
      mode: session.mode,
      completed: session.completed,
      interrupted: session.interrupted,
    }))
    .sort((left, right) => left.startedAt - right.startedAt || left.endedAt - right.endedAt || left.sessionId.localeCompare(right.sessionId));
}

export function getAgendaTimelineWindow(state: FocoState, day: number): { startHour: number; endHour: number } {
  const dayStart = startOfLocalDay(day);
  const dayEnd = endOfLocalDay(day);
  const events = getAgendaSessionEvents(state, day);

  let startHour = Math.max(0, Math.min(23, Math.floor(state.planning.workdayStartHour)));
  let endHour = Math.max(startHour + 1, Math.min(24, Math.ceil(state.planning.workdayEndHour)));

  for (const event of events) {
    const clippedStart = Math.max(dayStart, event.startedAt);
    const clippedEnd = Math.min(dayEnd, event.endedAt);
    const startMinutes = Math.max(0, (clippedStart - dayStart) / 60_000);
    const endMinutes = Math.min(24 * 60, Math.max(0, (clippedEnd - dayStart) / 60_000));

    startHour = Math.min(startHour, Math.floor(startMinutes / 60));
    endHour = Math.max(endHour, Math.ceil(endMinutes / 60));
  }

  return {
    startHour: Math.max(0, Math.min(23, startHour)),
    endHour: Math.max(1, Math.min(24, endHour)),
  };
}
