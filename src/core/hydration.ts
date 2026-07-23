import { createDemoState } from './demoState';
import type { FocoState } from './model';
import { migrateState } from './migration';

export function resolveHydratedState(stored: string | null, now = Date.now()): FocoState {
  if (!stored) return createDemoState(now);
  try {
    return migrateState(JSON.parse(stored), now);
  } catch {
    return createDemoState(now);
  }
}
