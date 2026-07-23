import Storage from 'expo-sqlite/kv-store';
import { createContext, type PropsWithChildren, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { createDemoState } from './demoState';
import {
  addProject as addProjectToState,
  addRoutine as addRoutineToState,
  addSession as addSessionToState,
  addSubtask as addSubtaskToState,
  completeTask as completeTaskInState,
  createInitialState,
  createTask as createTaskInState,
  deleteSubtask as deleteSubtaskFromState,
  deleteTask as deleteTaskFromState,
  duplicateTask as duplicateTaskInState,
  generateRoutineTask as generateRoutineTaskInState,
  moveTaskToInbox as moveTaskToInboxInState,
  postponeTask as postponeTaskInState,
  reopenTask as reopenTaskInState,
  restoreTask as restoreTaskToState,
  scheduleTask as scheduleTaskInState,
  toggleProjectArchived as toggleProjectArchivedInState,
  toggleRoutinePaused as toggleRoutinePausedInState,
  toggleSubtask as toggleSubtaskInState,
  toggleTask as toggleTaskInState,
  updateAppearance as updateAppearanceInState,
  updateFocusPreferences as updatePreferencesInState,
  updatePlanningPreferences as updatePlanningInState,
  updateProject as updateProjectInState,
  updateRoutine as updateRoutineInState,
  updateTask as updateTaskInState,
  updateTaskV2 as updateTaskDetailsInState,
  type AppearancePreference,
  type FocusPreferences,
  type FocoState,
  type FocusSession,
  type PlanningPreferences,
  type Project,
  type ProjectIcon,
  type RoutineDraft,
  type RoutineTemplate,
  type SessionDraft,
  type Task,
  type TaskCompletionResult,
  type TaskDraft,
  type TaskPriority,
} from './model';
import { resolveHydratedState } from './hydration';
import { syncTaskReminder } from '@/src/platform/reminders';

const STORAGE_KEY = 'foco:state:v3';
const V2_STORAGE_KEY = 'foco:state:v2';
const LEGACY_STORAGE_KEY = 'foco:state:v1';
const TIMER_KEY = 'foco:timer:v2';
const LEGACY_TIMER_KEY = 'foco:timer:v1';

type StoreValue = {
  state: FocoState;
  ready: true;
  storageError: string | null;
  resetToken: number;
  createTask: (draft: TaskDraft) => Task | null;
  updateTaskDetails: (taskId: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => Task | null;
  completeTask: (taskId: string) => TaskCompletionResult | null;
  reopenTask: (taskId: string) => void;
  duplicateTask: (taskId: string) => Task | null;
  postponeTask: (taskId: string, days?: number) => void;
  moveTaskToInbox: (taskId: string) => void;
  scheduleTask: (taskId: string, plannedStartAt: number) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  addTask: (title: string, projectId?: string, priority?: TaskPriority) => void;
  updateTask: (taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  restoreTask: (task: Task) => void;
  addProject: (name: string, icon?: ProjectIcon) => Project | null;
  updateProject: (projectId: string, patch: Partial<Pick<Project, 'name' | 'icon' | 'description' | 'archived' | 'sortOrder'>>) => void;
  toggleProjectArchived: (projectId: string) => void;
  addRoutine: (draft: RoutineDraft) => RoutineTemplate | null;
  updateRoutine: (routineId: string, patch: Partial<Omit<RoutineTemplate, 'id' | 'createdAt'>>) => void;
  toggleRoutinePaused: (routineId: string) => void;
  generateRoutineTask: (routineId: string, plannedStartAt?: number) => Task | null;
  addSession: (session: SessionDraft) => FocusSession | null;
  updatePreferences: (patch: Partial<FocusPreferences>) => void;
  updatePlanning: (patch: Partial<PlanningPreferences>) => void;
  updateAppearance: (appearance: AppearancePreference) => void;
  replaceState: (next: FocoState) => void;
  loadDemoData: () => void;
  startEmpty: () => void;
  resetLocalData: () => void;
};

type ProviderProps = PropsWithChildren<{ fallback?: ReactNode; onReady?: () => void }>;
const FocoStoreContext = createContext<StoreValue | null>(null);

export function FocoStoreProvider({ children, fallback = null, onReady }: ProviderProps) {
  const [state, setState] = useState<FocoState | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await Storage.getItem(STORAGE_KEY) ?? await Storage.getItem(V2_STORAGE_KEY) ?? await Storage.getItem(LEGACY_STORAGE_KEY);
        if (active) setState(resolveHydratedState(stored));
      } catch {
        if (active) {
          setStorageError('No pudimos leer tus datos locales. FOCO seguirá disponible durante esta sesión.');
          setState(createDemoState());
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => { if (ready) onReady?.(); }, [onReady, ready]);

  useEffect(() => {
    if (!ready || !state) return;
    const timeout = setTimeout(() => {
      void Storage.setItem(STORAGE_KEY, JSON.stringify(state)).then(
        () => setStorageError(null),
        () => setStorageError('Este cambio está activo, pero todavía no pudo guardarse en el dispositivo.'),
      );
    }, 100);
    return () => clearTimeout(timeout);
  }, [ready, state]);

  const createTask = useCallback((draft: TaskDraft) => {
    if (!state) return null;
    const next = createTaskInState(state, draft);
    if (next === state) return null;
    const created = next.tasks[0] ?? null;
    setState(next);
    if (created) void syncTaskReminder(undefined, created);
    return created;
  }, [state]);

  const updateTaskDetails = useCallback((taskId: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    if (!state) return null;
    const previous = state.tasks.find((task) => task.id === taskId);
    const next = updateTaskDetailsInState(state, taskId, patch);
    const updated = next.tasks.find((task) => task.id === taskId) ?? null;
    setState(next);
    if (previous || updated) void syncTaskReminder(previous, updated ?? undefined);
    return updated;
  }, [state]);

  const completeTask = useCallback((taskId: string) => {
    if (!state) return null;
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task || task.completed) return null;
    const result = completeTaskInState(state, taskId);
    setState(result.state);
    void syncTaskReminder(result.originalTask, undefined).then(() => result.generatedTask ? syncTaskReminder(undefined, result.generatedTask) : undefined);
    return result;
  }, [state]);

  const reopenTask = useCallback((taskId: string) => {
    setState((current) => {
      if (!current) return current;
      const previous = current.tasks.find((task) => task.id === taskId);
      const next = reopenTaskInState(current, taskId);
      const updated = next.tasks.find((task) => task.id === taskId);
      void syncTaskReminder(previous, updated);
      return next;
    });
  }, []);

  const duplicateTask = useCallback((taskId: string) => {
    if (!state) return null;
    const next = duplicateTaskInState(state, taskId);
    if (next === state) return null;
    const created = next.tasks[0] ?? null;
    setState(next);
    if (created) void syncTaskReminder(undefined, created);
    return created;
  }, [state]);

  const transitionTask = useCallback((taskId: string, transition: (current: FocoState) => FocoState) => {
    setState((current) => {
      if (!current) return current;
      const previous = current.tasks.find((task) => task.id === taskId);
      const next = transition(current);
      const updated = next.tasks.find((task) => task.id === taskId);
      void syncTaskReminder(previous, updated);
      return next;
    });
  }, []);

  const postponeTask = useCallback((taskId: string, days = 1) => transitionTask(taskId, (current) => postponeTaskInState(current, taskId, days)), [transitionTask]);
  const moveTaskToInbox = useCallback((taskId: string) => transitionTask(taskId, (current) => moveTaskToInboxInState(current, taskId)), [transitionTask]);
  const scheduleTask = useCallback((taskId: string, plannedStartAt: number) => transitionTask(taskId, (current) => scheduleTaskInState(current, taskId, plannedStartAt)), [transitionTask]);
  const addSubtask = useCallback((taskId: string, title: string) => setState((current) => current ? addSubtaskToState(current, taskId, title) : current), []);
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => setState((current) => current ? toggleSubtaskInState(current, taskId, subtaskId) : current), []);
  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => setState((current) => current ? deleteSubtaskFromState(current, taskId, subtaskId) : current), []);
  const addTask = useCallback((title: string, projectId?: string, priority?: TaskPriority) => { createTask({ title, projectId, priority, dueAt: Date.now(), captured: false }); }, [createTask]);
  const updateTask = useCallback((taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) => setState((current) => current ? updateTaskInState(current, taskId, patch) : current), []);
  const toggleTask = useCallback((taskId: string) => setState((current) => current ? toggleTaskInState(current, taskId) : current), []);

  const deleteTask = useCallback((taskId: string) => {
    setState((current) => {
      if (!current) return current;
      const previous = current.tasks.find((task) => task.id === taskId);
      void syncTaskReminder(previous, undefined);
      return deleteTaskFromState(current, taskId);
    });
  }, []);

  const restoreTask = useCallback((task: Task) => {
    setState((current) => {
      if (!current) return current;
      const next = restoreTaskToState(current, task);
      void syncTaskReminder(undefined, task);
      return next;
    });
  }, []);

  const addProject = useCallback((name: string, icon?: ProjectIcon) => {
    if (!state) return null;
    const next = addProjectToState(state, name, icon);
    if (next === state) return null;
    setState(next);
    return next.projects[0] ?? null;
  }, [state]);
  const updateProject = useCallback((projectId: string, patch: Partial<Pick<Project, 'name' | 'icon' | 'description' | 'archived' | 'sortOrder'>>) => setState((current) => current ? updateProjectInState(current, projectId, patch) : current), []);
  const toggleProjectArchived = useCallback((projectId: string) => setState((current) => current ? toggleProjectArchivedInState(current, projectId) : current), []);

  const addRoutine = useCallback((draft: RoutineDraft) => {
    if (!state) return null;
    const next = addRoutineToState(state, draft);
    if (next === state) return null;
    setState(next);
    return next.routines[0] ?? null;
  }, [state]);
  const updateRoutine = useCallback((routineId: string, patch: Partial<Omit<RoutineTemplate, 'id' | 'createdAt'>>) => setState((current) => current ? updateRoutineInState(current, routineId, patch) : current), []);
  const toggleRoutinePaused = useCallback((routineId: string) => setState((current) => current ? toggleRoutinePausedInState(current, routineId) : current), []);
  const generateRoutineTask = useCallback((routineId: string, plannedStartAt = Date.now()) => {
    if (!state) return null;
    const before = new Set(state.tasks.map((task) => task.id));
    const next = generateRoutineTaskInState(state, routineId, plannedStartAt);
    const created = next.tasks.find((task) => !before.has(task.id)) ?? null;
    setState(next);
    if (created) void syncTaskReminder(undefined, created);
    return created;
  }, [state]);

  const addSession = useCallback((session: SessionDraft) => {
    if (!state) return null;
    const next = addSessionToState(state, session);
    if (next === state) return null;
    setState(next);
    return next.sessions[0] ?? null;
  }, [state]);
  const updatePreferences = useCallback((patch: Partial<FocusPreferences>) => setState((current) => current ? updatePreferencesInState(current, patch) : current), []);
  const updatePlanning = useCallback((patch: Partial<PlanningPreferences>) => setState((current) => current ? updatePlanningInState(current, patch) : current), []);
  const updateAppearance = useCallback((appearance: AppearancePreference) => setState((current) => current ? updateAppearanceInState(current, appearance) : current), []);
  const replaceState = useCallback((next: FocoState) => { setState(next); setResetToken((value) => value + 1); }, []);

  const resetWith = useCallback((next: FocoState) => {
    setState(next);
    setResetToken((value) => value + 1);
    setStorageError(null);
    void Promise.all([
      Storage.setItem(STORAGE_KEY, JSON.stringify(next)),
      Storage.removeItem(V2_STORAGE_KEY),
      Storage.removeItem(LEGACY_STORAGE_KEY),
      Storage.removeItem(TIMER_KEY),
      Storage.removeItem(LEGACY_TIMER_KEY),
    ]).catch(() => setStorageError('FOCO cambió en esta sesión, pero no pudo confirmar todos los cambios locales.'));
  }, []);
  const loadDemoData = useCallback(() => resetWith(createDemoState()), [resetWith]);
  const startEmpty = useCallback(() => resetWith(createInitialState()), [resetWith]);
  const resetLocalData = startEmpty;

  const value = useMemo<StoreValue | null>(() => state && ready ? ({
    state, ready: true, storageError, resetToken,
    createTask, updateTaskDetails, completeTask, reopenTask, duplicateTask, postponeTask, moveTaskToInbox, scheduleTask,
    addSubtask, toggleSubtask, deleteSubtask, addTask, updateTask, toggleTask, deleteTask, restoreTask,
    addProject, updateProject, toggleProjectArchived,
    addRoutine, updateRoutine, toggleRoutinePaused, generateRoutineTask,
    addSession, updatePreferences, updatePlanning, updateAppearance, replaceState, loadDemoData, startEmpty, resetLocalData,
  }) : null, [
    state, ready, storageError, resetToken, createTask, updateTaskDetails, completeTask, reopenTask, duplicateTask, postponeTask,
    moveTaskToInbox, scheduleTask, addSubtask, toggleSubtask, deleteSubtask, addTask, updateTask, toggleTask, deleteTask, restoreTask,
    addProject, updateProject, toggleProjectArchived, addRoutine, updateRoutine, toggleRoutinePaused, generateRoutineTask,
    addSession, updatePreferences, updatePlanning, updateAppearance, replaceState, loadDemoData, startEmpty, resetLocalData,
  ]);

  if (!value) return <>{fallback}</>;
  return <FocoStoreContext.Provider value={value}>{children}</FocoStoreContext.Provider>;
}

export function useFocoStore() {
  const value = useContext(FocoStoreContext);
  if (!value) throw new Error('useFocoStore must be used inside a ready FocoStoreProvider');
  return value;
}
