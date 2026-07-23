import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { Keyboard } from 'react-native';

import { createUIState, reduceUIState } from './uiState';

type ScrollTarget = () => void;
type UndoRequest = {
  id: number;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

type FocoUIValue = {
  overlayCount: number;
  keyboardVisible: boolean;
  appMenuVisible: boolean;
  resetArmed: boolean;
  undo: UndoRequest | null;
  openAppMenu: () => void;
  closeAppMenu: () => void;
  registerOverlay: () => void;
  unregisterOverlay: () => void;
  requestReset: () => void;
  cancelReset: () => void;
  completeReset: () => void;
  showUndo: (message: string, onAction: () => void, actionLabel?: string) => void;
  runUndo: () => void;
  dismissUndo: () => void;
  registerScrollTarget: (key: string, target: ScrollTarget) => () => void;
  scrollToTop: (key: string) => void;
};

const FocoUIContext = createContext<FocoUIValue | null>(null);

export function FocoUIProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reduceUIState, undefined, createUIState);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [appMenuVisible, setAppMenuVisible] = useState(false);
  const [undo, setUndo] = useState<UndoRequest | null>(null);
  const undoId = useRef(0);
  const scrollTargets = useRef(new Map<string, ScrollTarget>());

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => {
    if (!undo) return;
    const timeout = setTimeout(() => setUndo((current) => current?.id === undo.id ? null : current), 4500);
    return () => clearTimeout(timeout);
  }, [undo]);

  const openAppMenu = useCallback(() => {
    Keyboard.dismiss();
    setAppMenuVisible(true);
  }, []);

  const closeAppMenu = useCallback(() => {
    setAppMenuVisible(false);
    dispatch({ type: 'cancel-reset' });
  }, []);

  const registerOverlay = useCallback(() => dispatch({ type: 'open-overlay' }), []);
  const unregisterOverlay = useCallback(() => dispatch({ type: 'close-overlay' }), []);
  const requestReset = useCallback(() => dispatch({ type: 'request-reset' }), []);
  const cancelReset = useCallback(() => dispatch({ type: 'cancel-reset' }), []);
  const completeReset = useCallback(() => dispatch({ type: 'complete-reset' }), []);

  const showUndo = useCallback((message: string, onAction: () => void, actionLabel = 'Deshacer') => {
    undoId.current += 1;
    setUndo({ id: undoId.current, message, onAction, actionLabel });
  }, []);

  const runUndo = useCallback(() => {
    setUndo((current) => {
      current?.onAction();
      return null;
    });
  }, []);

  const dismissUndo = useCallback(() => setUndo(null), []);

  const registerScrollTarget = useCallback((key: string, target: ScrollTarget) => {
    scrollTargets.current.set(key, target);
    return () => {
      if (scrollTargets.current.get(key) === target) scrollTargets.current.delete(key);
    };
  }, []);

  const scrollToTop = useCallback((key: string) => {
    scrollTargets.current.get(key)?.();
  }, []);

  const value = useMemo<FocoUIValue>(() => ({
    overlayCount: state.overlays,
    keyboardVisible,
    appMenuVisible,
    resetArmed: state.resetArmed,
    undo,
    openAppMenu,
    closeAppMenu,
    registerOverlay,
    unregisterOverlay,
    requestReset,
    cancelReset,
    completeReset,
    showUndo,
    runUndo,
    dismissUndo,
    registerScrollTarget,
    scrollToTop,
  }), [
    state.overlays,
    state.resetArmed,
    keyboardVisible,
    appMenuVisible,
    undo,
    openAppMenu,
    closeAppMenu,
    registerOverlay,
    unregisterOverlay,
    requestReset,
    cancelReset,
    completeReset,
    showUndo,
    runUndo,
    dismissUndo,
    registerScrollTarget,
    scrollToTop,
  ]);

  return <FocoUIContext.Provider value={value}>{children}</FocoUIContext.Provider>;
}

export function useFocoUI() {
  const value = useContext(FocoUIContext);
  if (!value) throw new Error('useFocoUI must be used inside FocoUIProvider');
  return value;
}
