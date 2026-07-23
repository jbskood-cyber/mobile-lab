export type FocoUIState = {
  overlays: number;
  resetArmed: boolean;
};

export type FocoUIAction =
  | { type: 'open-overlay' }
  | { type: 'close-overlay' }
  | { type: 'request-reset' }
  | { type: 'cancel-reset' }
  | { type: 'complete-reset' };

export function createUIState(): FocoUIState {
  return { overlays: 0, resetArmed: false };
}

export function reduceUIState(state: FocoUIState, action: FocoUIAction): FocoUIState {
  switch (action.type) {
    case 'open-overlay':
      return { ...state, overlays: state.overlays + 1 };
    case 'close-overlay':
      return { ...state, overlays: Math.max(0, state.overlays - 1) };
    case 'request-reset':
      return { ...state, resetArmed: true };
    case 'cancel-reset':
    case 'complete-reset':
      return { ...state, resetArmed: false };
    default:
      return state;
  }
}
