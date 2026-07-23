# FOCO Product Core Block 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver one integrated offline-first FOCO product core containing planning navigation, rich tasks/agenda, project detail, professional Pomodoro behavior, and advanced statistics.

**Architecture:** Upgrade the pure domain model to version 2 and keep SQLite KV persistence. Derive agenda/project/statistics views from immutable state transitions. Add official Expo modules only for native date/time, local notifications, and keep-awake. Replace dashboard-heavy screens with compact grouped mobile surfaces and focused detail routes/sheets.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, TypeScript 5.9, expo-sqlite, expo-notifications, expo-keep-awake, @react-native-community/datetimepicker, react-native-svg.

## Global Constraints

- Branch: `feature/foco-product-core-block-2`; base SHA `7ee9894b1bcf408a585e98521d76256cda40ade3`.
- No backend, auth, cloud sync, analytics, payments, widgets, Wear OS or app blocking.
- Preserve existing user data through deterministic v1→v2 migration.
- Use local notifications only; remote push is out of scope.
- All core views use real persisted data.
- No visible control is decorative or dead.
- CI gates: tests, TypeScript, ESLint, Expo Doctor, Android export.

---

### Task 1: Domain v2, migration and rich task transitions

**Files:**
- Replace: `src/core/model.ts`
- Create: `src/core/migration.ts`
- Modify: `src/core/hydration.ts`
- Modify: `src/core/FocoStore.tsx`
- Modify: `tsconfig.core-test.json`
- Test: `tests/product-model-v2.test.cjs`

**Interfaces:**
- Produces `FocoState` version 2, `TaskDraft`, `RecurrenceRule`, `FocusPreferences`.
- Produces `createTask`, `updateTaskV2`, `completeTask`, `reopenTask`, `duplicateTask`, `postponeTask`, `addSubtask`, `toggleSubtask`, `deleteSubtask`.
- Produces `migrateState(value, now): FocoState`.

- [ ] Write failing tests for v1 migration, rich task creation, recurrence next occurrence, postpone, duplicate and subtasks.
- [ ] Run `npm test`; confirm failures are caused by missing v2 contracts.
- [ ] Implement minimal immutable transitions and migration.
- [ ] Update store actions and persistence key to `foco:state:v2`, while reading v1 as fallback.
- [ ] Run tests, typecheck and lint.
- [ ] Commit `feat: add FOCO rich task domain v2`.

### Task 2: Agenda queries, search and period analytics

**Files:**
- Create: `src/core/agenda.ts`
- Create: `src/core/analytics.ts`
- Modify: `tsconfig.core-test.json`
- Test: `tests/agenda.test.cjs`
- Test: `tests/analytics-v2.test.cjs`

**Interfaces:**
- Produces `getAgendaBuckets(state, now)`, `searchTasks(state, query)`, `getTasksForDate(state, date)`.
- Produces `getPeriodStats(state, period, anchor)`, `getStreak`, `getProjectDistribution`, `getTaskDistribution`, `getRecentSessions`.

- [ ] Write failing bucket/search tests covering overdue, today, upcoming, no-date and completed.
- [ ] Write failing analytics tests covering day/week/month, previous-period trend, streak and planned-vs-completed Pomodoros.
- [ ] Implement pure query helpers.
- [ ] Run all checks.
- [ ] Commit `feat: add agenda and advanced analytics models`.

### Task 3: Native reminders and date/time infrastructure

**Files:**
- Modify: `package.json`
- Modify: `app.json`
- Create: `src/platform/reminders.ts`
- Create: `src/platform/notificationObserver.ts`
- Create: `src/ui/NativeDateTimeField.tsx`
- Modify: `app/_layout.tsx`
- Test: `tests/reminder-model.test.cjs`

**Interfaces:**
- Produces pure `buildReminderRequest(task)` and runtime `syncTaskReminder(previous, next)`.
- Produces native date/time field returning `number | undefined`.

- [ ] Write failing tests for one-off reminder descriptors and recurrence rescheduling.
- [ ] Add SDK-compatible dependencies: expo-notifications `~0.32.17`, expo-keep-awake compatible with SDK 54, datetimepicker `8.4.4`.
- [ ] Configure notifications plugin/channel and foreground handler.
- [ ] Implement reminder permission, schedule/cancel and notification deep-link observer.
- [ ] Implement native date/time field.
- [ ] Run all checks.
- [ ] Commit `feat: add local reminders and native scheduling fields`.

### Task 4: Product navigation and rich agenda UI

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/agenda.tsx`
- Create: `app/task/[id].tsx`
- Create: `src/features/agenda/AgendaScreen.tsx`
- Create: `src/features/tasks/TaskDetailScreen.tsx`
- Create: `src/features/tasks/TaskEditorSheet.tsx`
- Create: `src/features/tasks/TaskRow.tsx`
- Replace: `src/features/today/TodayScreen.tsx`
- Modify: `src/ui/FocoTabBar.tsx`
- Modify: `src/ui/FocoIcon.tsx`
- Modify: `src/ui/FocoShell.tsx`

**Interfaces:**
- Today uses agenda buckets and opens task detail.
- Agenda provides smart-list tabs, date strip, search and quick creation.
- Task detail/editor supports every v2 task field and subtask actions.

- [ ] Add route/config regression tests for five tabs and task route.
- [ ] Implement compact five-tab navigation.
- [ ] Build reusable compact task row and editor.
- [ ] Rebuild Today as an operational plan, not a dashboard.
- [ ] Build Agenda and Task Detail.
- [ ] Verify keyboard, sheets, back navigation and empty states.
- [ ] Run all checks.
- [ ] Commit `feat: deliver FOCO agenda and rich task experience`.

### Task 5: Project detail and organization

**Files:**
- Create: `app/project/[id].tsx`
- Create: `src/features/projects/ProjectDetailScreen.tsx`
- Create: `src/features/projects/ProjectEditorSheet.tsx`
- Replace: `src/features/projects/ProjectsScreen.tsx`
- Modify: `src/core/FocoStore.tsx`
- Test: `tests/project-v2.test.cjs`

**Interfaces:**
- Project list opens detail route.
- Project detail derives progress, focus, Pomodoros, tasks and recent sessions.
- Editor updates name/icon/description and archive state.

- [ ] Write failing project update/order/metric tests.
- [ ] Implement project transitions and store actions.
- [ ] Build compact list and detail route.
- [ ] Add direct task creation from project detail.
- [ ] Run all checks.
- [ ] Commit `feat: add complete FOCO project workspace`.

### Task 6: Professional Pomodoro engine

**Files:**
- Replace: `src/core/focusTimer.ts`
- Replace: `src/core/useFocusTimer.ts`
- Replace: `src/features/focus/FocusScreen.tsx`
- Create: `src/platform/focusEffects.ts`
- Modify: `src/core/FocoStore.tsx`
- Test: `tests/focus-engine-v2.test.cjs`

**Interfaces:**
- Timer supports focus, short break, long break, stopwatch, auto-start and continuous mode.
- Session records optional taskId, cycle, planned duration, completed/interrupted state.
- Focus effects schedule phase notifications and keep screen awake.

- [ ] Write failing phase-transition tests for short/long breaks and auto-start decisions.
- [ ] Write failing tests for task-linked session recording and foreground reconciliation exactly once.
- [ ] Implement engine and hook.
- [ ] Build task selector, settings and focused-session UI.
- [ ] Integrate keep-awake and local phase notifications.
- [ ] Run all checks.
- [ ] Commit `feat: deliver professional FOCO focus engine`.

### Task 7: Advanced progress UI

**Files:**
- Replace: `src/features/stats/StatsScreen.tsx`
- Create: `src/features/stats/PeriodSelector.tsx`
- Create: `src/features/stats/TrendChart.tsx`
- Create: `src/features/stats/DistributionList.tsx`
- Create: `src/features/stats/SessionTimeline.tsx`
- Modify: `src/features/stats/statsModel.ts`

**Interfaces:**
- Progress exposes day/week/month.
- Uses analytics helpers only; no seeded chart values.

- [ ] Rebuild top metrics, trend, planned/completed, project/task distribution, heatmap and recent sessions.
- [ ] Preserve readable empty states and narrow-phone layout.
- [ ] Add accessible chart labels.
- [ ] Run all checks.
- [ ] Commit `feat: add actionable FOCO progress analytics`.

### Task 8: Self-review, visual consolidation and release gate

**Files:**
- Modify: `src/ui/focoTheme.ts`
- Modify: `src/ui/typeScale.ts`
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/VALIDATION.md`
- Create: `docs/FOCUS_TO_DO_PARITY.md`

- [ ] Audit every visible control for behavior.
- [ ] Remove decorative corner circles, oversized titles and redundant cards.
- [ ] Standardize spacing, separators, hit targets and empty/loading/error states.
- [ ] Document implemented parity and deferred native/cloud capabilities.
- [ ] Run final `npm test`, typecheck, lint, Expo Doctor and Android export in CI.
- [ ] Fix every regression and repeat until green.
- [ ] Merge the validated PR to `main` through squash.
