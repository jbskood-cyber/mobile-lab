# FOCO Visual Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FOCO's graphite mobile shell, working four-tab navigation, and an interactive Hoy screen.

**Architecture:** Expo Router tabs compose reusable primitives from `src/ui`. Hoy keeps its domain state in a framework-independent model under `src/features/today`, allowing tests through Node's built-in test runner without adding a React Native test framework.

**Tech Stack:** React Native 0.81, Expo SDK 54, Expo Router 6, TypeScript 5.9, Node test runner.

## Global Constraints

- Keep Expo Go compatibility.
- Keep Android and future iOS compatibility.
- Add no backend, authentication, payments, AI APIs or paid services.
- Use the approved monochrome graphite direction.
- Do not merge to `main` before CI and physical phone review.

---

### Task 1: Establish a failing task-model test

**Files:**
- Create: `tests/today-model.test.ts`
- Create: `tsconfig.test.json`
- Modify: `package.json`
- Modify: `.github/workflows/ci.yml`

**Produces:** executable tests for `createInitialTasks`, `getTodayMetrics`, `addTask`, and `toggleTask`.

- [ ] Add Node test scripts and `@types/node`.
- [ ] Write tests importing the not-yet-created model.
- [ ] Add `npm test` to CI.
- [ ] Open a draft PR and verify CI fails because the model is absent.

### Task 2: Implement the tested task model

**Files:**
- Create: `src/features/today/model.ts`

**Interfaces:**

```ts
export type TaskPriority = 'Alta' | 'Media' | 'Baja';
export type Task = {
  id: string;
  title: string;
  project: string;
  priority: TaskPriority;
  completed: boolean;
  inProgress?: boolean;
};

export function createInitialTasks(): Task[];
export function getTodayMetrics(tasks: Task[]): {
  pending: number;
  active: number;
  completed: number;
};
export function addTask(tasks: Task[], title: string): Task[];
export function toggleTask(tasks: Task[], id: string): Task[];
```

- [ ] Implement only the behavior required by the tests.
- [ ] Verify `npm test` passes in CI.

### Task 3: Create visual tokens and reusable primitives

**Files:**
- Create: `src/ui/theme.ts`
- Create: `src/ui/Screen.tsx`
- Create: `src/ui/Card.tsx`
- Create: `src/ui/SectionHeader.tsx`
- Create: `src/ui/TabBar.tsx`

- [ ] Define graphite colors, spacing, radii and typography sizes.
- [ ] Build safe-area-aware screen and card primitives.
- [ ] Build a four-destination custom tab bar with accessible labels.

### Task 4: Build the Expo Router tab shell

**Files:**
- Modify: `app/_layout.tsx`
- Delete: `app/index.tsx`
- Create: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/index.tsx`
- Create: `app/(tabs)/projects.tsx`
- Create: `app/(tabs)/focus.tsx`
- Create: `app/(tabs)/stats.tsx`

- [ ] Redirect the root stack to the tab group.
- [ ] Make Hoy the default route.
- [ ] Add polished placeholders for Proyectos, Enfoque and Estadísticas.
- [ ] Verify tab navigation compiles.

### Task 5: Build the interactive Hoy screen

**Files:**
- Create: `src/features/today/MetricStrip.tsx`
- Create: `src/features/today/FocusCard.tsx`
- Create: `src/features/today/QuickAdd.tsx`
- Create: `src/features/today/TaskRow.tsx`
- Create: `src/features/today/TodayScreen.tsx`
- Modify: `app/(tabs)/index.tsx`

- [ ] Compose the approved header, metric strip, quick add, focus card and task list.
- [ ] Connect quick-add to `addTask`.
- [ ] Connect checkboxes to `toggleTask`.
- [ ] Recalculate metrics through `getTodayMetrics`.
- [ ] Keep the keyboard from covering the add-task controls.

### Task 6: Final validation and status update

**Files:**
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `README.md`

- [ ] Run `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run Expo Doctor.
- [ ] Confirm CI is green.
- [ ] Keep the PR open for Samsung review and provide local pull/start instructions.