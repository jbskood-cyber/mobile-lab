import { createInitialState, normalizeState, type FocoState } from './model';

export function resolveHydratedState(stored: string | null, now = Date.now()): FocoState {
  if (!stored) return createInitialState(now);

  try {
    return normalizeState(JSON.parse(stored), now);
  } catch {
    return createInitialState(now);
  }
}
