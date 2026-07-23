export type ProjectIcon = 'briefcase' | 'book' | 'heart' | 'grid' | 'bulb' | 'archive';
export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type FocusMode = 'pomodoro' | 'stopwatch';
export type FocusPhase = 'focus' | 'shortBreak' | 'longBreak';
export type RecurrenceKind = 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly';
export type AppearancePreference = 'system' | 'light' | 'dark';

export type RecurrenceRule = {
  kind: RecurrenceKind;
  interval: number;
  fromCompletion: boolean;
};

export type Subtask = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
};

export type Project = {
  id: string;
  name: string;
  icon: ProjectIcon;
  archived: boolean;
  description: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type Task = {
  id: string;
  title: string;
  projectId: string;
  priority: TaskPriority;
  completed: boolean;
  inProgress: boolean;
  favorite: boolean;
  notes: string;
  dueAt?: number;
  plannedStartAt?: number;
  reminderAt?: number;
  recurrence: RecurrenceRule;
  estimatedPomodoros: number;
  durationMinutes: number;
  captured: boolean;
  firstStep: string;
  routineId?: string;
  subtasks: Subtask[];
  sortOrder: number;
  notificationId?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
};

export type FocusSession = {
  id: string;
  projectId: string;
  taskId?: string;
  mode: FocusMode;
  phase: FocusPhase;
  startedAt: number;
  endedAt: number;
  durationSec: number;
  plannedSec: number;
  completed: boolean;
  interrupted: boolean;
  cycleNumber: number;
};

export type FocusPreferences = {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakEvery: number;
  targetCycles: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  continuousMode: boolean;
  keepAwake: boolean;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  notifyBeforeEndMinutes: number;
};

export type PlanningPreferences = {
  workdayStartHour: number;
  workdayEndHour: number;
  bufferMinutes: number;
  defaultTaskDurationMinutes: number;
};

export type RoutineTemplate = {
  id: string;
  name: string;
  projectId: string;
  priority: TaskPriority;
  notes: string;
  firstStep: string;
  durationMinutes: number;
  estimatedPomodoros: number;
  recurrence: RecurrenceRule;
  subtasks: string[];
  paused: boolean;
  createdAt: number;
  updatedAt: number;
  lastGeneratedAt?: number;
};

export type FocoState = {
  version: 3;
  projects: Project[];
  tasks: Task[];
  sessions: FocusSession[];
  routines: RoutineTemplate[];
  preferences: FocusPreferences;
  planning: PlanningPreferences;
  appearance: AppearancePreference;
};

export type TaskDraft = {
  title: string;
  projectId?: string;
  priority?: TaskPriority;
  notes?: string;
  dueAt?: number;
  plannedStartAt?: number;
  reminderAt?: number;
  recurrence?: Partial<RecurrenceRule>;
  estimatedPomodoros?: number;
  durationMinutes?: number;
  captured?: boolean;
  firstStep?: string;
  routineId?: string;
  subtasks?: Array<string | Subtask>;
  inProgress?: boolean;
  favorite?: boolean;
};

export type RoutineDraft = Omit<RoutineTemplate, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedAt'>;
export type SessionDraft = Omit<FocusSession, 'id' | 'phase' | 'plannedSec' | 'completed' | 'interrupted' | 'cycleNumber'> & Partial<Pick<FocusSession, 'phase' | 'plannedSec' | 'completed' | 'interrupted' | 'cycleNumber'>>;

export type TaskCompletionResult = {
  state: FocoState;
  originalTask: Task;
  completedTask: Task;
  generatedTask?: Task;
};

export type TodaySummary = { pending: number; active: number; completed: number; focusSeconds: number };
export type ProjectMetrics = { taskCount: number; completedCount: number; progress: number; focusSeconds: number; completedPomodoros: number; plannedPomodoros: number };

export const DAY_MS = 24 * 60 * 60 * 1000;

export const defaultFocusPreferences: FocusPreferences = {
  focusMinutes: 50,
  shortBreakMinutes: 10,
  longBreakMinutes: 20,
  longBreakEvery: 4,
  targetCycles: 3,
  autoStartBreaks: false,
  autoStartFocus: false,
  continuousMode: false,
  keepAwake: true,
  vibrationEnabled: true,
  soundEnabled: true,
  notifyBeforeEndMinutes: 1,
};

export const defaultPlanningPreferences: PlanningPreferences = {
  workdayStartHour: 7,
  workdayEndHour: 22,
  bufferMinutes: 10,
  defaultTaskDurationMinutes: 30,
};

export function makeId(prefix: string, now: number, suffix = 0) {
  return `${prefix}-${now.toString(36)}-${suffix.toString(36)}`;
}

export function startOfLocalDay(timestamp: number) {
  const date = new Date(timestamp);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function endOfLocalDay(timestamp: number) {
  return startOfLocalDay(timestamp) + DAY_MS;
}

export function atLocalTime(day: number, hour: number, minute = 0) {
  const date = new Date(day);
  date.setHours(hour, minute, 0, 0);
  return date.getTime();
}

export function createInitialState(now = Date.now()): FocoState {
  const projectSeed: Array<[string, string, ProjectIcon]> = [
    ['personal', 'Personal', 'grid'],
    ['trabajo', 'Trabajo', 'briefcase'],
    ['estudios', 'Estudios', 'book'],
    ['salud', 'Salud', 'heart'],
    ['ideas', 'Ideas', 'bulb'],
  ];
  const projects = projectSeed.map(([id, name, icon], index): Project => ({
    id,
    name,
    icon,
    archived: false,
    description: '',
    sortOrder: index,
    createdAt: now,
    updatedAt: now,
  }));
  return {
    version: 3,
    projects,
    tasks: [],
    sessions: [],
    routines: [],
    preferences: { ...defaultFocusPreferences },
    planning: { ...defaultPlanningPreferences },
    appearance: 'system',
  };
}

export function normalizeRecurrence(value?: Partial<RecurrenceRule>): RecurrenceRule {
  const kind: RecurrenceKind = value?.kind && ['none', 'daily', 'weekdays', 'weekly', 'monthly'].includes(value.kind) ? value.kind : 'none';
  return {
    kind,
    interval: Math.max(1, Math.round(value?.interval ?? 1)),
    fromCompletion: Boolean(value?.fromCompletion),
  };
}

function normalizeSubtasks(values: Array<string | Subtask> | undefined, now: number, prefix: string): Subtask[] {
  return (values ?? []).map((value, index) => typeof value === 'string' ? {
    id: makeId(`${prefix}-subtask`, now, index + 1),
    title: value.trim(),
    completed: false,
    createdAt: now,
  } : {
    ...value,
    id: value.id || makeId(`${prefix}-subtask`, now, index + 1),
    title: value.title.trim(),
    completed: Boolean(value.completed),
    createdAt: Number(value.createdAt || now),
  }).filter((subtask) => subtask.title.length > 0);
}

function resolveProjectId(state: FocoState, projectId?: string) {
  if (projectId && state.projects.some((project) => project.id === projectId)) return projectId;
  return state.projects.find((project) => !project.archived)?.id ?? state.projects[0]?.id ?? 'personal';
}

export function createTask(state: FocoState, draft: TaskDraft, now = Date.now()): FocoState {
  const title = draft.title.trim();
  if (!title) return state;
  const id = makeId('task', now, state.tasks.length + 1);
  const task: Task = {
    id,
    title,
    projectId: resolveProjectId(state, draft.projectId),
    priority: draft.priority ?? 'Media',
    completed: false,
    inProgress: Boolean(draft.inProgress),
    favorite: Boolean(draft.favorite),
    notes: draft.notes?.trim() ?? '',
    dueAt: Number.isFinite(draft.dueAt) ? draft.dueAt : undefined,
    plannedStartAt: Number.isFinite(draft.plannedStartAt) ? draft.plannedStartAt : undefined,
    reminderAt: Number.isFinite(draft.reminderAt) ? draft.reminderAt : undefined,
    recurrence: normalizeRecurrence(draft.recurrence),
    estimatedPomodoros: Math.max(1, Math.round(draft.estimatedPomodoros ?? 1)),
    durationMinutes: Math.max(5, Math.round(draft.durationMinutes ?? state.planning.defaultTaskDurationMinutes)),
    captured: draft.captured ?? (draft.dueAt === undefined && draft.plannedStartAt === undefined),
    firstStep: draft.firstStep?.trim() ?? '',
    routineId: draft.routineId,
    subtasks: normalizeSubtasks(draft.subtasks, now, id),
    sortOrder: state.tasks.length,
    createdAt: now,
    updatedAt: now,
  };
  return { ...state, tasks: [task, ...state.tasks] };
}

export function updateTaskV2(state: FocoState, taskId: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>, now = Date.now()): FocoState {
  return {
    ...state,
    tasks: state.tasks.map((task) => {
      if (task.id !== taskId) return task;
      const title = patch.title === undefined ? task.title : patch.title.trim() || task.title;
      return {
        ...task,
        ...patch,
        title,
        projectId: patch.projectId ? resolveProjectId(state, patch.projectId) : task.projectId,
        priority: patch.priority ?? task.priority,
        notes: patch.notes === undefined ? task.notes : patch.notes.trim(),
        firstStep: patch.firstStep === undefined ? task.firstStep : patch.firstStep.trim(),
        recurrence: patch.recurrence ? normalizeRecurrence(patch.recurrence) : task.recurrence,
        estimatedPomodoros: patch.estimatedPomodoros === undefined ? task.estimatedPomodoros : Math.max(1, Math.round(patch.estimatedPomodoros)),
        durationMinutes: patch.durationMinutes === undefined ? task.durationMinutes : Math.max(5, Math.round(patch.durationMinutes)),
        updatedAt: now,
      };
    }),
  };
}

function nextOccurrenceAt(base: number, recurrence: RecurrenceRule) {
  const date = new Date(base);
  if (recurrence.kind === 'daily') return base + recurrence.interval * DAY_MS;
  if (recurrence.kind === 'weekly') return base + recurrence.interval * 7 * DAY_MS;
  if (recurrence.kind === 'monthly') {
    date.setMonth(date.getMonth() + recurrence.interval);
    return date.getTime();
  }
  if (recurrence.kind === 'weekdays') {
    let next = base;
    let count = 0;
    while (count < recurrence.interval) {
      next += DAY_MS;
      const day = new Date(next).getDay();
      if (day !== 0 && day !== 6) count += 1;
    }
    return next;
  }
  return base;
}

function createNextOccurrence(state: FocoState, task: Task, now: number): Task | undefined {
  if (task.recurrence.kind === 'none') return undefined;

  const originalAnchor = task.plannedStartAt ?? task.dueAt ?? now;
  const recurrenceBase = task.recurrence.fromCompletion ? now : originalAnchor;
  const nextAnchor = nextOccurrenceAt(recurrenceBase, task.recurrence);
  const fixedShift = nextAnchor - originalAnchor;
  const dueOffset = task.plannedStartAt !== undefined && task.dueAt !== undefined
    ? Math.max(task.durationMinutes * 60_000, task.dueAt - task.plannedStartAt)
    : task.durationMinutes * 60_000;
  const reminderAnchor = task.plannedStartAt ?? task.dueAt;
  const reminderOffset = task.reminderAt !== undefined && reminderAnchor !== undefined
    ? task.reminderAt - reminderAnchor
    : undefined;

  const plannedStartAt = task.plannedStartAt === undefined
    ? undefined
    : task.recurrence.fromCompletion
      ? nextAnchor
      : task.plannedStartAt + fixedShift;
  const dueAt = task.dueAt === undefined
    ? undefined
    : task.recurrence.fromCompletion
      ? plannedStartAt !== undefined ? plannedStartAt + dueOffset : nextAnchor
      : task.dueAt + fixedShift;
  const nextReminderBase = plannedStartAt ?? dueAt ?? nextAnchor;
  const reminderAt = task.reminderAt === undefined
    ? undefined
    : task.recurrence.fromCompletion
      ? nextReminderBase + (reminderOffset ?? 0)
      : task.reminderAt + fixedShift;

  const id = makeId('task', now + 1, state.tasks.length + 1);
  return {
    ...task,
    id,
    completed: false,
    completedAt: undefined,
    inProgress: false,
    captured: false,
    plannedStartAt,
    dueAt,
    reminderAt,
    notificationId: undefined,
    subtasks: task.subtasks.map((subtask, index) => ({
      ...subtask,
      id: makeId(`${id}-subtask`, now + 1, index + 1),
      completed: false,
      completedAt: undefined,
      createdAt: now + 1,
    })),
    createdAt: now + 1,
    updatedAt: now + 1,
    sortOrder: state.tasks.length,
  };
}

export function completeTask(state: FocoState, taskId: string, now = Date.now()): TaskCompletionResult {
  const originalTask = state.tasks.find((task) => task.id === taskId);
  if (!originalTask) throw new Error(`Task not found: ${taskId}`);
  if (originalTask.completed) return { state, originalTask, completedTask: originalTask };
  const completedTask: Task = { ...originalTask, completed: true, inProgress: false, completedAt: now, updatedAt: now };
  const generatedTask = createNextOccurrence(state, originalTask, now);
  const tasks = state.tasks.map((task) => task.id === taskId ? completedTask : task);
  return { state: { ...state, tasks: generatedTask ? [generatedTask, ...tasks] : tasks }, originalTask, completedTask, generatedTask };
}

export function undoTaskCompletion(state: FocoState, result: TaskCompletionResult): FocoState {
  return { ...state, tasks: state.tasks.filter((task) => task.id !== result.generatedTask?.id).map((task) => task.id === result.originalTask.id ? result.originalTask : task) };
}

export function reopenTask(state: FocoState, taskId: string, now = Date.now()) {
  return updateTaskV2(state, taskId, { completed: false, completedAt: undefined }, now);
}

export function duplicateTask(state: FocoState, taskId: string, now = Date.now()): FocoState {
  const source = state.tasks.find((task) => task.id === taskId);
  if (!source) return state;
  const id = makeId('task', now, state.tasks.length + 1);
  const duplicate: Task = {
    ...source,
    id,
    completed: false,
    completedAt: undefined,
    inProgress: false,
    notificationId: undefined,
    subtasks: source.subtasks.map((subtask, index) => ({ ...subtask, id: makeId(`${id}-subtask`, now, index + 1), completed: false, completedAt: undefined, createdAt: now })),
    createdAt: now,
    updatedAt: now,
    sortOrder: state.tasks.length,
  };
  return { ...state, tasks: [duplicate, ...state.tasks] };
}

export function postponeTask(state: FocoState, taskId: string, days = 1, now = Date.now()): FocoState {
  const delta = Math.max(1, Math.round(days)) * DAY_MS;
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return state;
  return updateTaskV2(state, taskId, {
    dueAt: task.dueAt === undefined ? now + delta : task.dueAt + delta,
    plannedStartAt: task.plannedStartAt === undefined ? undefined : task.plannedStartAt + delta,
    reminderAt: task.reminderAt === undefined ? undefined : task.reminderAt + delta,
    captured: false,
    completed: false,
    completedAt: undefined,
  }, now);
}

export function moveTaskToInbox(state: FocoState, taskId: string, now = Date.now()) {
  return updateTaskV2(state, taskId, { dueAt: undefined, plannedStartAt: undefined, reminderAt: undefined, captured: true, completed: false, completedAt: undefined }, now);
}

export function scheduleTask(state: FocoState, taskId: string, plannedStartAt: number, now = Date.now()) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task || !Number.isFinite(plannedStartAt)) return state;

  const previousAnchor = task.plannedStartAt ?? task.dueAt;
  const dueOffset = previousAnchor !== undefined && task.dueAt !== undefined
    ? Math.max(task.durationMinutes * 60_000, task.dueAt - previousAnchor)
    : task.durationMinutes * 60_000;
  const reminderOffset = previousAnchor !== undefined && task.reminderAt !== undefined
    ? task.reminderAt - previousAnchor
    : undefined;

  return updateTaskV2(state, taskId, {
    plannedStartAt,
    dueAt: plannedStartAt + dueOffset,
    reminderAt: reminderOffset === undefined ? task.reminderAt : plannedStartAt + reminderOffset,
    captured: false,
    completed: false,
    completedAt: undefined,
  }, now);
}

export function addSubtask(state: FocoState, taskId: string, title: string, now = Date.now()) {
  const normalized = title.trim();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!normalized || !task) return state;
  const subtask: Subtask = { id: makeId(`${taskId}-subtask`, now, task.subtasks.length + 1), title: normalized, completed: false, createdAt: now };
  return updateTaskV2(state, taskId, { subtasks: [...task.subtasks, subtask] }, now);
}

export function toggleSubtask(state: FocoState, taskId: string, subtaskId: string, now = Date.now()) {
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return state;
  const subtasks = task.subtasks.map((subtask) => subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed, completedAt: subtask.completed ? undefined : now } : subtask);
  return updateTaskV2(state, taskId, { subtasks }, now);
}

export function deleteSubtask(state: FocoState, taskId: string, subtaskId: string, now = Date.now()) {
  const task = state.tasks.find((item) => item.id === taskId);
  return task ? updateTaskV2(state, taskId, { subtasks: task.subtasks.filter((subtask) => subtask.id !== subtaskId) }, now) : state;
}

export function deleteTask(state: FocoState, taskId: string) { return { ...state, tasks: state.tasks.filter((task) => task.id !== taskId) }; }
export function restoreTask(state: FocoState, task: Task) { return state.tasks.some((item) => item.id === task.id) ? state : { ...state, tasks: [task, ...state.tasks] }; }

export function addProject(state: FocoState, name: string, icon: ProjectIcon = 'grid', now = Date.now()): FocoState {
  const normalized = name.trim();
  if (!normalized || state.projects.some((project) => project.name.toLowerCase() === normalized.toLowerCase())) return state;
  const project: Project = { id: makeId('project', now, state.projects.length + 1), name: normalized, icon, archived: false, description: '', sortOrder: state.projects.length, createdAt: now, updatedAt: now };
  return { ...state, projects: [project, ...state.projects] };
}

export function updateProject(state: FocoState, projectId: string, patch: Partial<Pick<Project, 'name' | 'icon' | 'description' | 'archived' | 'sortOrder'>>, now = Date.now()): FocoState {
  return { ...state, projects: state.projects.map((project) => project.id === projectId ? { ...project, ...patch, name: patch.name === undefined ? project.name : patch.name.trim() || project.name, description: patch.description === undefined ? project.description : patch.description.trim(), updatedAt: now } : project) };
}

export function toggleProjectArchived(state: FocoState, projectId: string) {
  const project = state.projects.find((item) => item.id === projectId);
  return project ? updateProject(state, projectId, { archived: !project.archived }) : state;
}

export function updateFocusPreferences(state: FocoState, patch: Partial<FocusPreferences>): FocoState {
  return { ...state, preferences: { ...state.preferences, ...patch, focusMinutes: Math.max(1, Math.round(patch.focusMinutes ?? state.preferences.focusMinutes)), shortBreakMinutes: Math.max(1, Math.round(patch.shortBreakMinutes ?? state.preferences.shortBreakMinutes)), longBreakMinutes: Math.max(1, Math.round(patch.longBreakMinutes ?? state.preferences.longBreakMinutes)), longBreakEvery: Math.max(1, Math.round(patch.longBreakEvery ?? state.preferences.longBreakEvery)), targetCycles: Math.max(1, Math.round(patch.targetCycles ?? state.preferences.targetCycles)), notifyBeforeEndMinutes: Math.max(0, Math.round(patch.notifyBeforeEndMinutes ?? state.preferences.notifyBeforeEndMinutes)) } };
}

export function updatePlanningPreferences(state: FocoState, patch: Partial<PlanningPreferences>): FocoState {
  const start = Math.min(22, Math.max(0, Math.round(patch.workdayStartHour ?? state.planning.workdayStartHour)));
  const end = Math.min(24, Math.max(start + 1, Math.round(patch.workdayEndHour ?? state.planning.workdayEndHour)));
  return { ...state, planning: { ...state.planning, ...patch, workdayStartHour: start, workdayEndHour: end, bufferMinutes: Math.min(120, Math.max(0, Math.round(patch.bufferMinutes ?? state.planning.bufferMinutes))), defaultTaskDurationMinutes: Math.min(480, Math.max(5, Math.round(patch.defaultTaskDurationMinutes ?? state.planning.defaultTaskDurationMinutes))) } };
}

export function updateAppearance(state: FocoState, appearance: AppearancePreference): FocoState {
  return { ...state, appearance: ['system', 'light', 'dark'].includes(appearance) ? appearance : 'system' };
}

export function addRoutine(state: FocoState, draft: RoutineDraft, now = Date.now()): FocoState {
  const name = draft.name.trim();
  if (!name) return state;
  const routine: RoutineTemplate = { ...draft, id: makeId('routine', now, state.routines.length + 1), name, projectId: resolveProjectId(state, draft.projectId), notes: draft.notes.trim(), firstStep: draft.firstStep.trim(), durationMinutes: Math.max(5, Math.round(draft.durationMinutes)), estimatedPomodoros: Math.max(1, Math.round(draft.estimatedPomodoros)), recurrence: normalizeRecurrence(draft.recurrence), subtasks: draft.subtasks.map((item) => item.trim()).filter(Boolean), createdAt: now, updatedAt: now };
  return { ...state, routines: [routine, ...state.routines] };
}

export function updateRoutine(state: FocoState, routineId: string, patch: Partial<Omit<RoutineTemplate, 'id' | 'createdAt'>>, now = Date.now()): FocoState {
  return { ...state, routines: state.routines.map((routine) => routine.id === routineId ? { ...routine, ...patch, name: patch.name === undefined ? routine.name : patch.name.trim() || routine.name, recurrence: patch.recurrence ? normalizeRecurrence(patch.recurrence) : routine.recurrence, updatedAt: now } : routine) };
}

export function toggleRoutinePaused(state: FocoState, routineId: string, now = Date.now()) {
  const routine = state.routines.find((item) => item.id === routineId);
  return routine ? updateRoutine(state, routineId, { paused: !routine.paused }, now) : state;
}

export function generateRoutineTask(state: FocoState, routineId: string, plannedStartAt = Date.now(), now = Date.now()): FocoState {
  const routine = state.routines.find((item) => item.id === routineId);
  if (!routine || routine.paused) return state;
  const duplicate = state.tasks.some((task) => task.routineId === routine.id && !task.completed && task.plannedStartAt !== undefined && startOfLocalDay(task.plannedStartAt) === startOfLocalDay(plannedStartAt));
  if (duplicate) return state;
  const withTask = createTask(state, { title: routine.name, projectId: routine.projectId, priority: routine.priority, notes: routine.notes, firstStep: routine.firstStep, durationMinutes: routine.durationMinutes, estimatedPomodoros: routine.estimatedPomodoros, recurrence: routine.recurrence, subtasks: routine.subtasks, plannedStartAt, dueAt: plannedStartAt + routine.durationMinutes * 60_000, routineId: routine.id, captured: false }, now);
  return updateRoutine(withTask, routine.id, { lastGeneratedAt: now }, now);
}

export function addSession(state: FocoState, session: SessionDraft, now = Date.now()): FocoState {
  if (!Number.isFinite(session.durationSec) || session.durationSec < 1) return state;
  const normalized: FocusSession = { ...session, id: makeId('session', now, state.sessions.length + 1), phase: session.phase ?? 'focus', plannedSec: Math.max(1, Math.round(session.plannedSec ?? session.durationSec)), durationSec: Math.max(1, Math.round(session.durationSec)), completed: session.completed ?? true, interrupted: session.interrupted ?? false, cycleNumber: Math.max(1, Math.round(session.cycleNumber ?? 1)) };
  return { ...state, sessions: [normalized, ...state.sessions] };
}

export function getTodaySummary(state: FocoState, now = Date.now()): TodaySummary {
  const dayStart = startOfLocalDay(now);
  const dayEnd = endOfLocalDay(now);
  const openToday = state.tasks.filter((task) => !task.completed && ((task.plannedStartAt ?? task.dueAt) ?? -1) >= dayStart && ((task.plannedStartAt ?? task.dueAt) ?? -1) < dayEnd);
  return { pending: openToday.filter((task) => !task.inProgress).length, active: state.tasks.filter((task) => !task.completed && task.inProgress).length, completed: state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= dayStart && task.completedAt < dayEnd).length, focusSeconds: state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= dayStart && session.endedAt < dayEnd).reduce((sum, session) => sum + session.durationSec, 0) };
}

export function getProjectMetrics(state: FocoState, projectId: string): ProjectMetrics {
  const tasks = state.tasks.filter((task) => task.projectId === projectId);
  const sessions = state.sessions.filter((session) => session.projectId === projectId && session.phase === 'focus');
  const completedCount = tasks.filter((task) => task.completed).length;
  return { taskCount: tasks.length, completedCount, progress: tasks.length === 0 ? 0 : completedCount / tasks.length, focusSeconds: sessions.reduce((sum, session) => sum + session.durationSec, 0), completedPomodoros: sessions.filter((session) => session.mode === 'pomodoro' && session.completed).length, plannedPomodoros: tasks.filter((task) => !task.completed).reduce((sum, task) => sum + task.estimatedPomodoros, 0) };
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
  const sessions = state.sessions.filter((session) => session.phase === 'focus' && session.endedAt >= start && session.endedAt < end);
  for (const session of sessions) {
    const index = Math.min(6, Math.max(0, Math.floor((startOfLocalDay(session.endedAt) - start) / DAY_MS)));
    daySeconds[index] = (daySeconds[index] ?? 0) + session.durationSec;
  }
  const completedTasks = state.tasks.filter((task) => task.completedAt !== undefined && task.completedAt >= start && task.completedAt < end).length;
  return { start, end, daySeconds, totalSeconds: daySeconds.reduce((sum, value) => sum + value, 0), completedTasks, sessions };
}

export function formatDuration(seconds: number, compact = false) {
  const safe = Math.max(0, Math.round(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  if (compact) return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function normalizeState(value: unknown, now = Date.now()): FocoState {
  if (!value || typeof value !== 'object') return createInitialState(now);
  const candidate = value as Partial<FocoState>;
  if (candidate.version !== 3 || !Array.isArray(candidate.projects) || !Array.isArray(candidate.tasks) || !Array.isArray(candidate.sessions)) return createInitialState(now);
  return { ...candidate, version: 3, routines: Array.isArray(candidate.routines) ? candidate.routines : [], preferences: { ...defaultFocusPreferences, ...(candidate.preferences ?? {}) }, planning: { ...defaultPlanningPreferences, ...(candidate.planning ?? {}) }, appearance: candidate.appearance ?? 'system' } as FocoState;
}

export function addTask(state: FocoState, title: string, projectId = 'personal', priority: TaskPriority = 'Media', now = Date.now()) { return createTask(state, { title, projectId, priority, dueAt: now, captured: false }, now); }
export function updateTask(state: FocoState, taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) { return updateTaskV2(state, taskId, patch); }
export function toggleTask(state: FocoState, taskId: string, now = Date.now()) { const task = state.tasks.find((item) => item.id === taskId); return !task ? state : task.completed ? reopenTask(state, taskId, now) : completeTask(state, taskId, now).state; }
