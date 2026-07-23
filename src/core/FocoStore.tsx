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
  addTask as addTaskToState,
  createInitialState,
  deleteTask as deleteTaskFromState,
  restoreTask as restoreTaskToState,
  toggleProjectArchived as toggleProjectArchivedInState,
  toggleTask as toggleTaskInState,
  updateTask as updateTaskInState,
  type FocusSession,
  type FocoState,
  type ProjectIcon,
  type Task,
  type TaskPriority,
} from './model';
import { resolveHydratedState } from './hydration';

const STORAGE_KEY = 'foco:state:v1';

type StoreValue = {
  state: FocoState;
  ready: true;
  storageError: string | null;
  addTask: (title: string, projectId?: string, priority?: TaskPriority) => void;
  updateTask: (taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  restoreTask: (task: Task) => void;
  addProject: (name: string, icon?: ProjectIcon) => void;
  toggleProjectArchived: (projectId: string) => void;
  addSession: (session: Omit<FocusSession, 'id'>) => void;
  resetLocalData: () => void;
};

type ProviderProps = PropsWithChildren<{
  fallback?: ReactNode;
  onReady?: () => void;
}>;

const FocoStoreContext = createContext<StoreValue | null>(null);

export function FocoStoreProvider({ children, fallback = null, onReady }: ProviderProps) {
  const [state, setState] = useState<FocoState | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await Storage.getItem(STORAGE_KEY);
        if (!active) return;
        setState(resolveHydratedState(stored));
      } catch {
        if (active) {
          setStorageError('No pudimos leer tus datos locales. FOCO seguirá disponible durante esta sesión.');
          setState(createInitialState());
        }
      } finally {
        if (active) setReady(true);
      }
    })();

    return () => {
      active = false;
    };
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

  const addTask = useCallback((title: string, projectId?: string, priority?: TaskPriority) => {
    setState((current) => current ? addTaskToState(current, title, projectId, priority) : current);
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) => {
    setState((current) => current ? updateTaskInState(current, taskId, patch) : current);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setState((current) => current ? toggleTaskInState(current, taskId) : current);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState((current) => current ? deleteTaskFromState(current, taskId) : current);
  }, []);

  const restoreTask = useCallback((task: Task) => {
    setState((current) => current ? restoreTaskToState(current, task) : current);
  }, []);

  const addProject = useCallback((name: string, icon?: ProjectIcon) => {
    setState((current) => current ? addProjectToState(current, name, icon) : current);
  }, []);

  const toggleProjectArchived = useCallback((projectId: string) => {
    setState((current) => current ? toggleProjectArchivedInState(current, projectId) : current);
  }, []);

  const addSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    setState((current) => current ? addSessionToState(current, session) : current);
  }, []);

  const resetLocalData = useCallback(() => {
    const reset = createInitialState();
    setState(reset);
    setStorageError(null);
    void Storage.setItem(STORAGE_KEY, JSON.stringify(reset)).catch(() => {
      setStorageError('FOCO se reinició en esta sesión, pero no pudo confirmar el guardado local.');
    });
  }, []);

  const value = useMemo<StoreValue | null>(() => state && ready ? ({
    state,
    ready: true,
    storageError,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    restoreTask,
    addProject,
    toggleProjectArchived,
    addSession,
    resetLocalData,
  }) : null, [
    state,
    ready,
    storageError,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    restoreTask,
    addProject,
    toggleProjectArchived,
    addSession,
    resetLocalData,
  ]);

  if (!value) return <>{fallback}</>;

  return <FocoStoreContext.Provider value={value}>{children}</FocoStoreContext.Provider>;
}

export function useFocoStore() {
  const value = useContext(FocoStoreContext);
  if (!value) throw new Error('useFocoStore must be used inside a ready FocoStoreProvider');
  return value;
}
