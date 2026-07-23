import {
  createInitialState,
  defaultFocusPreferences,
  normalizeRecurrence,
  type FocoState,
  type FocusSession,
  type Project,
  type ProjectIcon,
  type Task,
  type TaskPriority,
} from './model';

type LegacyProject = Partial<Project> & { id?: string; name?: string; icon?: ProjectIcon; archived?: boolean; createdAt?: number };
type LegacyTask = Partial<Task> & { id?: string; title?: string; projectId?: string; priority?: TaskPriority; createdAt?: number };
type LegacySession = Partial<FocusSession> & { id?: string; projectId?: string; mode?: 'pomodoro' | 'stopwatch'; startedAt?: number; endedAt?: number; durationSec?: number };

function safeNumber(value: unknown, fallback: number) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function migrateProject(project: LegacyProject, index: number, now: number): Project {
  const createdAt = safeNumber(project.createdAt, now);
  return {
    id: project.id || `project-migrated-${index + 1}`,
    name: project.name?.trim() || `Proyecto ${index + 1}`,
    icon: project.icon ?? 'grid',
    archived: Boolean(project.archived),
    description: project.description?.trim() ?? '',
    sortOrder: safeNumber(project.sortOrder, index),
    createdAt,
    updatedAt: safeNumber(project.updatedAt, createdAt),
  };
}

function migrateTask(task: LegacyTask, index: number, projectIds: Set<string>, fallbackProjectId: string, now: number): Task {
  const createdAt = safeNumber(task.createdAt, now);
  const id = task.id || `task-migrated-${index + 1}`;
  return {
    id,
    title: task.title?.trim() || `Tarea ${index + 1}`,
    projectId: task.projectId && projectIds.has(task.projectId) ? task.projectId : fallbackProjectId,
    priority: task.priority ?? 'Media',
    completed: Boolean(task.completed),
    inProgress: Boolean(task.inProgress),
    favorite: Boolean(task.favorite),
    notes: task.notes?.trim() ?? '',
    dueAt: safeNumber(task.dueAt, NaN),
    reminderAt: safeNumber(task.reminderAt, NaN),
    recurrence: normalizeRecurrence(task.recurrence),
    estimatedPomodoros: Math.max(1, Math.round(safeNumber(task.estimatedPomodoros, 1))),
    subtasks: Array.isArray(task.subtasks) ? task.subtasks.map((subtask, subIndex) => ({
      id: subtask.id || `${id}-subtask-${subIndex + 1}`,
      title: subtask.title?.trim() || `Paso ${subIndex + 1}`,
      completed: Boolean(subtask.completed),
      createdAt: safeNumber(subtask.createdAt, createdAt),
      completedAt: typeof subtask.completedAt === 'number' ? subtask.completedAt : undefined,
    })) : [],
    sortOrder: safeNumber(task.sortOrder, index),
    notificationId: typeof task.notificationId === 'string' ? task.notificationId : undefined,
    createdAt,
    updatedAt: safeNumber(task.updatedAt, createdAt),
    completedAt: typeof task.completedAt === 'number' ? task.completedAt : undefined,
  };
}

function migrateSession(session: LegacySession, index: number, projectIds: Set<string>, fallbackProjectId: string, taskIds: Set<string>, now: number): FocusSession {
  const endedAt = safeNumber(session.endedAt, now);
  const durationSec = Math.max(1, Math.round(safeNumber(session.durationSec, 1)));
  return {
    id: session.id || `session-migrated-${index + 1}`,
    projectId: session.projectId && projectIds.has(session.projectId) ? session.projectId : fallbackProjectId,
    taskId: session.taskId && taskIds.has(session.taskId) ? session.taskId : undefined,
    mode: session.mode ?? 'pomodoro',
    phase: session.phase ?? 'focus',
    startedAt: safeNumber(session.startedAt, endedAt - durationSec * 1000),
    endedAt,
    durationSec,
    plannedSec: Math.max(1, Math.round(safeNumber(session.plannedSec, durationSec))),
    completed: session.completed ?? true,
    interrupted: session.interrupted ?? false,
    cycleNumber: Math.max(1, Math.round(safeNumber(session.cycleNumber, 1))),
  };
}

function removeInvalidOptionalDates(task: Task): Task {
  return {
    ...task,
    dueAt: Number.isFinite(task.dueAt) ? task.dueAt : undefined,
    reminderAt: Number.isFinite(task.reminderAt) ? task.reminderAt : undefined,
  };
}

export function migrateState(value: unknown, now = Date.now()): FocoState {
  if (!value || typeof value !== 'object') return createInitialState(now);
  const candidate = value as { version?: number; projects?: LegacyProject[]; tasks?: LegacyTask[]; sessions?: LegacySession[]; preferences?: Partial<FocoState['preferences']> };
  if (!Array.isArray(candidate.projects) || !Array.isArray(candidate.tasks) || !Array.isArray(candidate.sessions)) return createInitialState(now);

  const seeded = createInitialState(now);
  const projects = candidate.projects.length > 0
    ? candidate.projects.map((project, index) => migrateProject(project, index, now))
    : seeded.projects;
  const projectIds = new Set(projects.map((project) => project.id));
  const fallbackProjectId = projects.find((project) => !project.archived)?.id ?? projects[0]?.id ?? 'personal';
  const tasks = candidate.tasks.map((task, index) => removeInvalidOptionalDates(migrateTask(task, index, projectIds, fallbackProjectId, now)));
  const taskIds = new Set(tasks.map((task) => task.id));
  const sessions = candidate.sessions.map((session, index) => migrateSession(session, index, projectIds, fallbackProjectId, taskIds, now));

  return {
    version: 2,
    projects,
    tasks,
    sessions,
    preferences: { ...defaultFocusPreferences, ...(candidate.preferences ?? {}) },
  };
}
