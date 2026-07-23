# FOCO Adaptive Day + Visual System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a compact light/dark FOCO with a detailed calendar/timeline, adaptive daily planning, replan, Momentum mode, routines, rich demo data and local backup/export.

**Architecture:** Upgrade the immutable domain to state version 3, derive planning behavior through pure functions, and isolate native side effects behind adapters. Replace global dark constants with a runtime theme context while preserving Expo Go compatibility and existing offline persistence.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript 5.9, SQLite KV store, Expo Font, Manrope, Expo FileSystem, Expo Sharing and Expo Clipboard.

## Global Constraints

- Branch: `feature/foco-adaptive-day-block-3`; base SHA `74929c5c1264117277e993dc07309b96cf1b4303`.
- Preserve v1 and v2 user data through deterministic migration.
- No backend, account, cloud sync, widgets, Wear OS, app blocking or remote AI.
- All core workflows remain functional offline.
- Keep interactive targets at least 44 dp and primary controls at least 48 dp.
- Do not reintroduce imperative `expo-navigation-bar` runtime calls.
- Use only portable font weights 400, 500, 600 and 700.
- Every visible setting changes real behavior.

---

### Task 1: State v3 and migration

**Files:**
- Modify: `src/core/model.ts`
- Modify: `src/core/migration.ts`
- Modify: `src/core/hydration.ts`
- Test: `tests/model-v3.test.cjs`
- Test: `tests/migration-v3.test.cjs`

**Interfaces:**
- Produces `FocoState.version = 3`, `AppearancePreference`, `PlanningPreferences`, extended `Task`, extended `RecurrenceRule`, and `RoutineTemplate`.
- Produces `migrateToV3(value, now): FocoState`.

- [ ] Write failing tests for v2 migration, new task defaults and completion-based recurrence.
- [ ] Run `npm test` and confirm the new tests fail.
- [ ] Implement v3 types, defaults, normalization and immutable transitions.
- [ ] Implement v1/v2/v3 migration without data loss.
- [ ] Run tests and commit `feat: add FOCO state v3 and migration`.

### Task 2: Rich deterministic demo state

**Files:**
- Create: `src/core/demoState.ts`
- Modify: `src/core/hydration.ts`
- Modify: `src/core/FocoStore.tsx`
- Test: `tests/demo-state.test.cjs`

**Interfaces:**
- Produces `createDemoState(now): FocoState`.
- Store exposes `loadDemoData()` and `startEmpty()`.

- [ ] Write failing tests for deterministic counts, calendar coverage and analytics coverage.
- [ ] Implement projects, Inbox, scheduled/flexible/recurring/completed tasks, routines and session history.
- [ ] Use demo state only for fresh installs and explicit menu action.
- [ ] Verify existing persisted state remains unchanged.
- [ ] Commit `feat: add rich removable demo workspace`.

### Task 3: Adaptive day engine

**Files:**
- Create: `src/core/dayPlan.ts`
- Test: `tests/day-plan.test.cjs`

**Interfaces:**
- Produces `buildDayPlan(state, day)`, `getReplanQueue(state, now)`, `getMomentumCandidates(state, now)` and `moveTaskToSlot(state, taskId, startAt)`.

- [ ] Write failing tests for fixed load, flexible load, gaps, overload, insertion and recommendation ordering.
- [ ] Implement pure planning calculations with no side effects.
- [ ] Test collisions, empty days and workday boundaries.
- [ ] Commit `feat: add adaptive day planning engine`.

### Task 4: Backup and export domain

**Files:**
- Create: `src/core/backup.ts`
- Test: `tests/backup.test.cjs`

**Interfaces:**
- Produces `serializeBackup`, `parseBackup`, `summarizeBackup`, `tasksToCsv` and `sessionsToCsv`.

- [ ] Write failing round-trip, invalid schema and CSV escaping tests.
- [ ] Implement atomic versioned backup parsing and export.
- [ ] Verify invalid input cannot produce partial state.
- [ ] Commit `feat: add local backup and export contracts`.

### Task 5: Runtime theme and typography

**Files:**
- Create: `src/ui/themeTokens.ts`
- Create: `src/ui/FocoThemeContext.tsx`
- Modify: `src/ui/focoTheme.ts`
- Modify: `src/ui/typeScale.ts`
- Modify: `app/_layout.tsx`
- Modify: `package.json`
- Test: `tests/theme.test.cjs`
- Test: `tests/runtime-safety.test.cjs`

**Interfaces:**
- Produces `useFocoTheme()` and semantic tokens for light/dark.
- Produces font families `Manrope_400Regular`, `Manrope_500Medium`, `Manrope_600SemiBold`, `Manrope_700Bold` with fallback.

- [ ] Write failing tests for system/light/dark resolution and portable weights.
- [ ] Add Expo-compatible font and platform dependencies.
- [ ] Load fonts without blocking startup on failure.
- [ ] Update status bar and root background from active theme.
- [ ] Commit `feat: add FOCO light dark theme and Manrope`.

### Task 6: Compact design-system migration

**Files:**
- Modify: `src/ui/FocoShell.tsx`
- Modify: `src/ui/FocoTabBar.tsx`
- Modify: `src/ui/FocoSheet.tsx`
- Modify: `src/ui/FocoAppMenu.tsx`
- Modify: `src/ui/FocoSkeleton.tsx`
- Modify: feature components that reference static colors.
- Test: `tests/compact-ui.test.cjs`

**Interfaces:**
- All shared UI consumes `useFocoTheme()`.
- Density tokens define compact headers, rows, chips and surfaces.

- [ ] Add static regression tests against oversized display/title/tab values and hard-coded background colors in shared components.
- [ ] Convert shared components to semantic themes.
- [ ] Reduce visual bulk while preserving touch targets.
- [ ] Audit both palettes for contrast roles.
- [ ] Commit `refactor: compact and theme FOCO shared UI`.

### Task 7: Detailed calendar and timeline Agenda

**Files:**
- Rewrite: `src/features/agenda/AgendaScreen.tsx`
- Create: `src/features/agenda/MonthCalendar.tsx`
- Create: `src/features/agenda/DayTimeline.tsx`
- Create: `src/features/agenda/AgendaTaskBlock.tsx`
- Create: `src/core/calendar.ts`
- Modify: `src/features/tasks/TaskEditorSheet.tsx`
- Test: `tests/calendar.test.cjs`

**Interfaces:**
- Produces `buildMonthGrid(anchor)`, activity markers and timeline layout.
- Task editor accepts `defaultPlannedStartAt` and duration.

- [ ] Write failing month-grid, marker and timeline-position tests.
- [ ] Implement month navigation and date selection.
- [ ] Implement workday timeline, current-time line, free gaps, flexible queue and session history.
- [ ] Enable tap-to-create at a date/hour.
- [ ] Commit `feat: build detailed FOCO calendar and timeline`.

### Task 8: Today, Inbox and Replan

**Files:**
- Modify: `src/features/today/TodayScreen.tsx`
- Create: `src/features/replan/ReplanSheet.tsx`
- Create: `src/features/inbox/InboxSheet.tsx`
- Modify: `src/core/FocoStore.tsx`
- Test: `tests/replan.test.cjs`

**Interfaces:**
- Store exposes replan actions that also reconcile reminders.
- Today consumes `buildDayPlan` and `getReplanQueue`.

- [ ] Write failing tests for each replan action and Undo-safe restoration.
- [ ] Add one-tap Inbox capture.
- [ ] Add compact capacity, overload and next-task sections.
- [ ] Implement Replan actions with reminder reconciliation.
- [ ] Commit `feat: add Inbox and daily replan`.

### Task 9: Momentum mode

**Files:**
- Create: `app/momentum.tsx`
- Create: `src/features/momentum/MomentumScreen.tsx`
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `src/features/focus/FocusScreen.tsx`
- Test: `tests/momentum.test.cjs`

**Interfaces:**
- Momentum links a recommended task to the focus timer with starter durations of 2, 5 or 10 minutes.

- [ ] Write failing recommendation and starter-duration tests.
- [ ] Build distraction-free recommendation screen.
- [ ] Add skip without mutation and immediate focus start.
- [ ] Commit `feat: add FOCO Momentum mode`.

### Task 10: Routine templates

**Files:**
- Create: `src/features/routines/RoutinesSheet.tsx`
- Create: `src/features/routines/RoutineEditorSheet.tsx`
- Modify: `src/core/model.ts`
- Modify: `src/core/FocoStore.tsx`
- Modify: `src/features/agenda/AgendaScreen.tsx`
- Test: `tests/routines.test.cjs`

**Interfaces:**
- Store exposes create/update/pause/generate routine actions.

- [ ] Write failing template generation and pause tests.
- [ ] Implement reusable template editor and list.
- [ ] Generate occurrences without duplicates.
- [ ] Commit `feat: add reusable routines`.

### Task 11: Data, appearance and diagnostics

**Files:**
- Create: `src/features/settings/PreferencesScreen.tsx`
- Create: `src/features/settings/DataDiagnosticsSheet.tsx`
- Create: `src/platform/backupFiles.ts`
- Modify: `src/ui/FocoAppMenu.tsx`
- Modify: `app/_layout.tsx`
- Modify: `package.json`
- Test: `tests/data-diagnostics.test.cjs`

**Interfaces:**
- Platform adapter shares JSON/CSV files and falls back to clipboard.
- Import preview calls store replacement only after confirmation.

- [ ] Add appearance controls and planning preferences.
- [ ] Add backup, CSV, clipboard and pasted-import flows.
- [ ] Add storage/notification counts and demo/empty controls.
- [ ] Commit `feat: add preferences backup and diagnostics`.

### Task 12: Whole-product visual audit and gate

**Files:**
- Modify: all five tab screens and detail screens as necessary.
- Modify: `docs/PROJECT_STATUS.md`
- Create: `docs/BLOCK_3_VALIDATION.md`
- Modify: `.github/workflows/ci.yml` only if evidence collection needs improvement.

- [ ] Scan for static `foco.colors` use and migrate remaining visual components.
- [ ] Verify light/dark states, empty/demo states, keyboard, safe areas and no horizontal overflow.
- [ ] Run `npm test`, `npm run typecheck`, `npm run lint`, `npx expo-doctor@latest`, and Android export.
- [ ] Open a draft PR, inspect CI, fix all failures and perform code review.
- [ ] Merge by squash only after the final HEAD is green.
- [ ] Document the physical Samsung checklist and honest deferred scope.
