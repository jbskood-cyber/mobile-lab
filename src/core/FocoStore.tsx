import Storage from 'expo-sqlite/kv-store';
import {
  createContext,
  type PropsWithChildren,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  addProject as addProjectToState,
  addSession as addSessionToState,
  addSubtask as addSubtaskToState,
  completeTask as completeTaskInState,
  createInitialState,
  createTask as createTaskInState,
  deleteSubtask as deleteSubtaskFromState,
  deleteTask as deleteTaskFromState,
  duplicateTask as duplicateTaskInState,
  postponeTask as postponeTaskInState,
  reopenTask as reopenTaskInState,
  restoreTask as restoreTaskToState,
  toggleProjectArchived as toggleProjectArchivedInState,
  toggleSubtask as toggleSubtaskInState,
  toggleTask as toggleTaskInState,
  updateFocusPreferences as updatePreferencesInState,
  updateProject as updateProjectInState,
  updateTask as updateTaskInState,
  updateTaskV2 as updateTaskDetailsInState,
  type FocusPreferences,
  type FocoState,
  type FocusSession,
  type Project,
  type ProjectIcon,
  type SessionDraft,
  type Task,
  type TaskCompletionResult,
  type TaskDraft,
  type TaskPriority,
} from './model';
import { resolveHydratedState } from './hydration';

const STORAGE_KEY = 'foco:state:v2';
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
  addSession: (session: SessionDraft) => FocusSession | null;
  updatePreferences: (patch: Partial<FocusPreferences>) => void;
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
        const stored = await Storage.getItem(STORAGE_KEY) ?? await Storage.getItem(LEGACY_STORAGE_KEY);
        if (active) setState(resolveHydratedState(stored));
      } catch {
        if (active) {
          setStorageError('No pudimos leer tus datos locales. FOCO seguirá disponible durante esta sesión.');
          setState(createInitialState());
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!ready) return;
    onReady?.();
  }, [onReady, ready]);

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
    setState(next);
    return next.tasks[0] ?? null;
  }, [state]);

  const updateTaskDetails = useCallback((taskId: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    if (!state) return null;
    const next = updateTaskDetailsInState(state, taskId, patch);
    setState(next);
    return next.tasks.find((task) => task.id === taskId) ?? null;
  }, [state]);

  const completeTask = useCallback((taskId: string) => {
    if (!state) return null;
    const task = state.tasks.find((item) => item.id === taskId);
    if (!task || task.completed) return null;
    const result = completeTaskInState(state, taskId);
    setState(result.state);
    return result;
  }, [state]);

  const reopenTask = useCallback((taskId: string) => setState((current) => current ? reopenTaskInState(current, taskId) : current), []);
  const duplicateTask = useCallback((taskId: string) => {
    if (!state) return null;
    const next = duplicateTaskInState(state, taskId);
    if (next === state) return null;
    setState(next);
    return next.tasks[0] ?? null;
  }, [state]);
  const postponeTask = useCallback((taskId: string, days = 1) => setState((current) => current ? postponeTaskInState(current, taskId, days) : current), []);
  const addSubtask = useCallback((taskId: string, title: string) => setState((current) => current ? addSubtaskToState(current, taskId, title) : current), []);
  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => setState((current) => current ? toggleSubtaskInState(current, taskId, subtaskId) : current), []);
  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => setState((current) => current ? deleteSubtaskFromState(current, taskId, subtaskId) : current), []);

  const addTask = useCallback((title: string, projectId?: string, priority?: TaskPriority) => setState((current) => current ? createTaskInState(current, { title, projectId, priority, dueAt: Date.now() }) : current), []);
  const updateTask = useCallback((taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) => setState((current) => current ? updateTaskInState(current, taskId, patch) : current), []);
  const toggleTask = useCallback((taskId: string) => setState((current) => current ? toggleTaskInState(current, taskId) : current), []);
  const deleteTask = useCallback((taskId: string) => setState((current) => current ? deleteTaskFromState(current, taskId) : current), []);
  const restoreTask = useCallback((task: Task) => setState((current) => current ? restoreTaskToState(current, task) : current), []);

  const addProject = useCallback((name: string, icon?: ProjectIcon) => {
    if (!state) return null;
    const next = addProjectToState(state, name, icon);
    if (next === state) return null;
    setState(next);
    return next.projects[0] ?? null;
  }, [state]);
  const updateProject = useCallback((projectId: string, patch: Partial<Pick<Project, 'name' | 'icon' | 'description' | 'archived' | 'sortOrder'>>) => setState((current) => current ? updateProjectInState(current, projectId, patch) : current), []);
  const toggleProjectArchived = useCallback((projectId: string) => setState((current) => current ? toggleProjectArchivedInState(current, projectId) : current), []);

  const addSession = useCallback((session: SessionDraft) => {
    if (!state) return null;
    const next = addSessionToState(state, session);
    if (next === state) return null;
    setState(next);
    return next.sessions[0] ?? null;
  }, [state]);
  const updatePreferences = useCallback((patch: Partial<FocusPreferences>) => setState((current) => current ? updatePreferencesInState(current, patch) : current), []);

  const resetLocalData = useCallback(() => {
    const reset = createInitialState();
    setState(reset);
    setResetToken((value) => value + 1);
    setStorageError(null);
    void Promise.all([
      Storage.setItem(STORAGE_KEY, JSON.stringify(reset)),
      Storage.removeItem(LEGACY_STORAGE_KEY),
      Storage.removeItem(TIMER_KEY),
      Storage.removeItem(LEGACY_TIMER_KEY),
    ]).catch(() => setStorageError('FOCO se reinició en esta sesión, pero no pudo confirmar todos los cambios locales.'));
  }, []);

  const value = useMemo<StoreValue | null>(() => state && ready ? ({
    state, ready: true, storageError, resetToken,
    createTask, updateTaskDetails, completeTask, reopenTask, duplicateTask, postponeTask, addSubtask, toggleSubtask, deleteSubtask,
    addTask, updateTask, toggleTask, deleteTask, restoreTask,
    addProject, updateProject, toggleProjectArchived,
    addSession, updatePreferences, resetLocalData,
  }) : null, [
    state, ready, storageError, resetToken, createTask, updateTaskDetails, completeTask, reopenTask, duplicateTask, postponeTask,
    addSubtask, toggleSubtask, deleteSubtask, addTask, updateTask, toggleTask, deleteTask, restoreTask, addProject, updateProject,
    toggleProjectArchived, addSession, updatePreferences, resetLocalData,
  ]);

  if (!value) return <>{fallback}</>;
  return <FocoStoreContext.Provider value={value}>{children}</FocoStoreContext.Provider>;
}

export function useFocoStore() {
  const value = useContext(FocoStoreContext);
  if (!value) throw new Error('useFocoStore must be used inside a ready FocoStoreProvider');
  return value;
}
