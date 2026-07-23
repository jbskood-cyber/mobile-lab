import Storage from 'expo-sqlite/kv-store';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  addProject as addProjectToState,
  addSession as addSessionToState,
  addTask as addTaskToState,
  createInitialState,
  deleteTask as deleteTaskFromState,
  normalizeState,
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

const STORAGE_KEY = 'foco:state:v1';

type StoreValue = {
  state: FocoState;
  ready: boolean;
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

const FocoStoreContext = createContext<StoreValue | null>(null);

export function FocoStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<FocoState>(() => createInitialState());
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const stored = await Storage.getItem(STORAGE_KEY);
        if (!active) return;
        setState(stored ? normalizeState(JSON.parse(stored)) : createInitialState());
      } catch {
        if (active) {
          setStorageError('No se pudo leer el almacenamiento local. Los cambios seguirán funcionando durante esta sesión.');
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
    const timeout = setTimeout(() => {
      void Storage.setItem(STORAGE_KEY, JSON.stringify(state)).then(
        () => setStorageError(null),
        () => setStorageError('No se pudo guardar un cambio. Revisa el almacenamiento disponible del dispositivo.'),
      );
    }, 80);
    return () => clearTimeout(timeout);
  }, [ready, state]);

  const addTask = useCallback((title: string, projectId?: string, priority?: TaskPriority) => {
    setState((current) => addTaskToState(current, title, projectId, priority));
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Pick<Task, 'title' | 'projectId' | 'priority' | 'inProgress' | 'favorite'>>) => {
    setState((current) => updateTaskInState(current, taskId, patch));
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setState((current) => toggleTaskInState(current, taskId));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState((current) => deleteTaskFromState(current, taskId));
  }, []);

  const restoreTask = useCallback((task: Task) => {
    setState((current) => restoreTaskToState(current, task));
  }, []);

  const addProject = useCallback((name: string, icon?: ProjectIcon) => {
    setState((current) => addProjectToState(current, name, icon));
  }, []);

  const toggleProjectArchived = useCallback((projectId: string) => {
    setState((current) => toggleProjectArchivedInState(current, projectId));
  }, []);

  const addSession = useCallback((session: Omit<FocusSession, 'id'>) => {
    setState((current) => addSessionToState(current, session));
  }, []);

  const resetLocalData = useCallback(() => {
    setState(createInitialState());
  }, []);

  const value = useMemo<StoreValue>(() => ({
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
  }), [
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

  return <FocoStoreContext.Provider value={value}>{children}</FocoStoreContext.Provider>;
}

export function useFocoStore() {
  const value = useContext(FocoStoreContext);
  if (!value) throw new Error('useFocoStore must be used inside FocoStoreProvider');
  return value;
}
