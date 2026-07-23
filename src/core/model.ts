export type ProjectIcon = 'briefcase' | 'book' | 'heart' | 'grid' | 'bulb' | 'archive';
export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type FocusMode = 'pomodoro' | 'stopwatch';

export type Project = {
  id: string;
  name: string;
  icon: ProjectIcon;
  archived: boolean;
  createdAt: number;
};

export type Task = {
  id: string;
  title: string;
  projectId: string;
  priority: TaskPriority;
  completed: boolean;
  inProgress: boolean;
  favorite: boolean;
  createdAt: number;
  completedAt?: number;
};

export type FocusSession = {
  id: string;
  projectId: string;
  mode: FocusMode;
  startedAt: number;
  endedAt: number;
  durationSec: number;
};

export type FocoState = {
  version: 1;
  projects: Project[];
  tasks: Task[];
  sessions: FocusSession[];
};

export type TodaySummary = {
  pending: number;
  active: number;
  completed: number;
  focusSeconds: number;
};

export type ProjectMetrics = {
  taskCount: number;
  completedCount: number;
  progress: number;
  focusSeconds: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

function id(prefix: string, suffix: string | number) {
  return `${prefix}-${suffix}`;
}

function startOfDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function createInitialState(now = Date.now()): FocoState {
  const projects: Project[] = [
    { id: 'plan-maestro', name: 'Plan maestro', icon: 'briefcase', archived: false, createdAt: now - 60 * DAY_MS },
    { id: 'trabajo', name: 'Trabajo', icon: 'briefcase', archived: false, createdAt: now - 50 * DAY_MS },
    { id: 'estudios', name: 'Estudios', icon: 'book', archived: false, createdAt: now - 45 * DAY_MS },
    { id: 'salud', name: 'Salud', icon: 'heart', archived: false, createdAt: now - 30 * DAY_MS },
    { id: 'personal', name: 'Personal', icon: 'grid', archived: false, createdAt: now - 25 * DAY_MS },
    { id: 'ideas', name: 'Ideas', icon: 'bulb', archived: false, createdAt: now - 10 * DAY_MS },
    { id: 'archivo', name: 'Archivo', icon: 'archive', archived: true, createdAt: now - 90 * DAY_MS },
  ];

  const taskSeed: Array<[string, string, string, TaskPriority, boolean, boolean, boolean]> = [
    ['objectives-q2', 'Definir objetivos Q2', 'plan-maestro', 'Alta', false, false, false],
    ['review-metrics', 'Revisar métricas', 'plan-maestro', 'Media', false, true, true],
    ['user-research', 'Investigación de usuarios', 'estudios', 'Media', false, false, false],
    ['onboarding-flow', 'Diseñar flujo de onboarding', 'trabajo', 'Alta', false, false, false],
    ['document-api', 'Documentar API', 'personal', 'Baja', false, false, true],
    ['close-notes', 'Cerrar notas de ayer', 'personal', 'Baja', true, false, false],
    ['mobility', 'Rutina de movilidad', 'salud', 'Media', true, false, false],
    ['study-optics', 'Repasar óptica física', 'estudios', 'Alta', true, false, false],
  ];

  const tasks = taskSeed.map(([taskId, title, projectId, priority, completed, inProgress, favorite], index): Task => ({
    id: taskId,
    title,
    projectId,
    priority,
    completed,
    inProgress,
    favorite,
    createdAt: now - (index + 1) * DAY_MS,
    completedAt: completed ? now - Math.min(index, 2) * DAY_MS : undefined,
  }));

  const durations = [48, 36, 52, 28, 55, 42, 31, 46, 25, 50, 34, 44, 20, 38, 57, 29, 41, 33];
  const sessions: FocusSession[] = durations.map((minutes, index) => {
    const dayOffset = index % 12;
    const endedAt = startOfDay(now - dayOffset * DAY_MS) + (9 + (index % 6)) * 60 * 60 * 1000;
    return {
      id: id('session', index + 1),
      projectId: projects[index % 5]?.id ?? 'personal',
      mode: index % 4 === 0 ? 'stopwatch' : 'pomodoro',
      startedAt: endedAt - minutes * 60 * 1000,
      endedAt,
      durationSec: minutes * 60,
    };
  });

  return { version: 1, projects, tasks, sessions };
}

export function normalizeState(value: unknown, now = Date.now()): FocoState {
  if (!value || typeof value !== 'object') return createInitialState(now);
  const candidate = value as Partial<FocoState>;
  if (candidate.version !== 1 || !Array.isArray(candidate.projects) || !Array.isArray(candidate.tasks) || !Array.isArray(candidate.sessions)) {
    return createInitialState(now);
  }
  return candidate as FocoState;
}

export function addTask(state: FocoState, title: string, projectId = 'personal', priority: TaskPriority = 'Media', now = Date.now()): FocoState {
  const normalized = title.trim();
  if (!normalized) return state;
  const resolvedProjectId = state.projects.some((project) => project.id === projectId) ? projectId : state.projects[0]?.id ?? 'personal';
  const task: Task = {
    id: id('task', `${now.toString(36)}-${normalized.length}`),
    title: normalized,
    projectId: resolvedProjectId,
    priority,
    completed: false,
    inProgress: false,
    favorite: false,
    createdAt: now,
  };
  return { ...state, tasks: [task, ...state.tasks] };
}

export function updateTask(state: FocoState, taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>): FocoState {
  return {
    ...state,
    tasks: state.tasks.map((task) => task.id === taskId ? {
      ...task,
      ...patch,
      title: patch.title === undefined ? task.title : patch.title.trim() || task.title,
      projectId: patch.projectId && state.projects.some((project) => project.id === patch.projectId) ? patch.projectId : task.projectId,
    } : task),
  };
}

export function toggleTask(state: FocoState, taskId: string, now = Date.now()): FocoState {
  return {
    ...state,
    tasks: state.tasks.map((task) => {
      if (task.id !== taskId) return task;
      const completed = !task.completed;
      return {
        ...task,
        completed,
        inProgress: completed ? false : task.inProgress,
        completedAt: completed ? now : undefined,
      };
    }),
  };
}

export function deleteTask(state: FocoState, taskId: string): FocoState {
  return { ...state, tasks: state.tasks.filter((task) => task.id !== taskId) };
}

export function restoreTask(state: FocoState, task: Task): FocoState {
  if (state.tasks.some((item) => item.id === task.id)) return state;
  return { ...state, tasks: [task, ...state.tasks] };
}

export function addProject(state: FocoState, name: string, icon: ProjectIcon = 'grid', now = Date.now()): FocoState {
  const normalized = name.trim();
  if (!normalized || state.projects.some((project) => project.name.toLowerCase() === normalized.toLowerCase())) return state;
  const project: Project = {
    id: id('project', `${now.toString(36)}-${normalized.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`),
    name: normalized,
    icon,
    archived: false,
    createdAt: now,
  };
  return { ...state, projects: [project, ...state.projects] };
}

export function toggleProjectArchived(state: FocoState, projectId: string): FocoState {
  return {
    ...state,
    projects: state.projects.map((project) => project.id === projectId ? { ...project, archived: !project.archived } : project),
  };
}

export function addSession(state: FocoState, session: Omit<FocusSession, 'id'>, now = Date.now()): FocoState {
  if (!Number.isFinite(session.durationSec) || session.durationSec < 60) return state;
  const normalized: FocusSession = {
    ...session,
    durationSec: Math.round(session.durationSec),
    id: id('session', `${now.toString(36)}-${state.sessions.length + 1}`),
  };
  return { ...state, sessions: [normalized, ...state.sessions] };
}

export function getTodaySummary(state: FocoState, now = Date.now()): TodaySummary {
  const dayStart = startOfDay(now);
  return {
    pending: state.tasks.filter((task) => !task.completed && !task.inProgress).length,
    active: state.tasks.filter((task) => !task.completed && task.inProgress).length,
    completed: state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= dayStart).length,
    focusSeconds: state.sessions.filter((session) => session.endedAt >= dayStart && session.endedAt <= now).reduce((sum, session) => sum + session.durationSec, 0),
  };
}

export function getProjectMetrics(state: FocoState, projectId: string): ProjectMetrics {
  const tasks = state.tasks.filter((task) => task.projectId === projectId);
  const completedCount = tasks.filter((task) => task.completed).length;
  return {
    taskCount: tasks.length,
    completedCount,
    progress: tasks.length === 0 ? 0 : completedCount / tasks.length,
    focusSeconds: state.sessions.filter((session) => session.projectId === projectId).reduce((sum, session) => sum + session.durationSec, 0),
  };
}

export function getWeekBounds(offset = 0, now = Date.now()) {
  const date = new Date(now);
  const weekday = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  const start = date.getTime() - weekday * DAY_MS + offset * 7 * DAY_MS;
  return { start, end: start + 7 * DAY_MS };
}

export function getWeekStats(state: FocoState, offset = 0, now = Date.now()) {
  const { start, end } = getWeekBounds(offset, now);
  const daySeconds = Array.from({ length: 7 }, () => 0);
  const sessions = state.sessions.filter((session) => session.endedAt >= start && session.endedAt < end);
  for (const session of sessions) {
    const index = Math.min(6, Math.max(0, Math.floor((startOfDay(session.endedAt) - start) / DAY_MS)));
    daySeconds[index] = (daySeconds[index] ?? 0) + session.durationSec;
  }
  const completedTasks = state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= start && task.completedAt < end).length;
  const totalSeconds = daySeconds.reduce((sum, value) => sum + value, 0);
  return { start, end, daySeconds, totalSeconds, completedTasks, sessions };
}

export function formatDuration(seconds: number, compact = false) {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (compact) return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}
