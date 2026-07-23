import { endOfLocalDay, startOfLocalDay, type FocoState, type Task } from './model';

export type AgendaBuckets = {
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
  noDate: Task[];
  inbox: Task[];
  completed: Task[];
};

function anchor(task: Task) {
  return task.plannedStartAt ?? task.dueAt;
}

function compareOpenTasks(a: Task, b: Task) {
  const aDue = anchor(a) ?? Number.MAX_SAFE_INTEGER;
  const bDue = anchor(b) ?? Number.MAX_SAFE_INTEGER;
  if (aDue !== bDue) return aDue - bDue;
  if (a.priority !== b.priority) {
    const rank = { Alta: 0, Media: 1, Baja: 2 } as const;
    return rank[a.priority] - rank[b.priority];
  }
  return a.sortOrder - b.sortOrder || b.createdAt - a.createdAt;
}

function compareCompleted(a: Task, b: Task) {
  return (b.completedAt ?? b.updatedAt) - (a.completedAt ?? a.updatedAt);
}

export function getAgendaBuckets(state: FocoState, now = Date.now()): AgendaBuckets {
  const dayStart = startOfLocalDay(now);
  const dayEnd = endOfLocalDay(now);
  const open = state.tasks.filter((task) => !task.completed);
  const scheduled = open.filter((task) => !task.captured);
  return {
    overdue: scheduled.filter((task) => anchor(task) !== undefined && (anchor(task) ?? 0) < dayStart).sort(compareOpenTasks),
    today: scheduled.filter((task) => anchor(task) !== undefined && (anchor(task) ?? 0) >= dayStart && (anchor(task) ?? 0) < dayEnd).sort(compareOpenTasks),
    upcoming: scheduled.filter((task) => anchor(task) !== undefined && (anchor(task) ?? 0) >= dayEnd).sort(compareOpenTasks),
    noDate: scheduled.filter((task) => anchor(task) === undefined).sort(compareOpenTasks),
    inbox: open.filter((task) => task.captured).sort((a, b) => b.createdAt - a.createdAt),
    completed: state.tasks.filter((task) => task.completed).sort(compareCompleted),
  };
}

export function getTasksForDate(state: FocoState, timestamp: number) {
  const start = startOfLocalDay(timestamp);
  const end = endOfLocalDay(timestamp);
  return state.tasks.filter((task) => {
    const value = anchor(task);
    return value !== undefined && value >= start && value < end;
  }).sort((a, b) => (anchor(a) ?? 0) - (anchor(b) ?? 0));
}

export function searchTasks(state: FocoState, query: string) {
  const normalized = query.trim().toLocaleLowerCase('es');
  if (!normalized) return state.tasks;
  const projectNames = new Map(state.projects.map((project) => [project.id, project.name.toLocaleLowerCase('es')]));
  return state.tasks.filter((task) => {
    const haystack = [task.title, task.firstStep, task.notes, projectNames.get(task.projectId) ?? '', ...task.subtasks.map((subtask) => subtask.title)].join(' ').toLocaleLowerCase('es');
    return haystack.includes(normalized);
  });
}

export function getNextAction(state: FocoState, now = Date.now()) {
  const buckets = getAgendaBuckets(state, now);
  return buckets.overdue[0] ?? buckets.today.find((task) => task.inProgress) ?? buckets.today[0] ?? buckets.noDate.find((task) => task.inProgress) ?? buckets.noDate[0] ?? buckets.inbox[0];
}

export function getTaskScheduleLabel(task: Task, now = Date.now()) {
  if (task.captured) return 'Inbox';
  const value = anchor(task);
  if (value === undefined) return 'Sin fecha';
  const today = startOfLocalDay(now);
  const dueDay = startOfLocalDay(value);
  if (dueDay < today) return 'Atrasada';
  if (dueDay === today) return new Date(value).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  if (dueDay === today + 24 * 60 * 60 * 1000) return 'Mañana';
  return new Date(value).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
}
