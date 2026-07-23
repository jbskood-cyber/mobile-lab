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

type FocoUIValue = {
  overlayCount: number;
  keyboardVisible: boolean;
  appMenuVisible: boolean;
  resetArmed: boolean;
  openAppMenu: () => void;
  closeAppMenu: () => void;
  registerOverlay: () => void;
  unregisterOverlay: () => void;
  requestReset: () => void;
  cancelReset: () => void;
  completeReset: () => void;
  registerScrollTarget: (key: string, target: ScrollTarget) => () => void;
  scrollToTop: (key: string) => void;
};

const FocoUIContext = createContext<FocoUIValue | null>(null);

export function FocoUIProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reduceUIState, undefined, createUIState);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [appMenuVisible, setAppMenuVisible] = useState(false);
  const scrollTargets = useRef(new Map<string, ScrollTarget>());

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

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
    openAppMenu,
    closeAppMenu,
    registerOverlay,
    unregisterOverlay,
    requestReset,
    cancelReset,
    completeReset,
    registerScrollTarget,
    scrollToTop,
  }), [
    state.overlays,
    state.resetArmed,
    keyboardVisible,
    appMenuVisible,
    openAppMenu,
    closeAppMenu,
    registerOverlay,
    unregisterOverlay,
    requestReset,
    cancelReset,
    completeReset,
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
