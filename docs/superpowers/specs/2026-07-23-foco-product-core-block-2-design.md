# FOCO Product Core — Block 2 Design Contract

## Objective

Rebuild FOCO from a four-screen prototype into a coherent offline-first productivity product with the core depth users expect from Focus To-Do: agenda planning, rich tasks, real project detail, a professional Pomodoro engine, and actionable analytics. FOCO keeps its own graphite visual identity and does not copy Focus To-Do branding or screen composition.

## Benchmark contract

The official Focus To-Do product currently advertises due dates, reminders, recurring tasks, subtasks/checklists, notes, task priority, estimated Pomodoros, configurable Pomodoro and break lengths, short and long breaks, continuous mode, and detailed reports for focus time, completed tasks, project distribution, trends, calendar history, and Gantt-style focus history.

FOCO Block 2 implements the offline/local equivalent of those five core areas:

1. Product navigation and planning surfaces.
2. Rich task and agenda engine.
3. Project detail and organization.
4. Professional Pomodoro/stopwatch engine.
5. Advanced local statistics.

Cross-device sync, widgets, Wear OS, app blocking/whitelisting, cloud accounts, remote push, and store distribution are explicitly outside this block.

## Product information architecture

### Primary navigation

- **Hoy** — operational day plan: overdue, next action, scheduled today, and completed today.
- **Agenda** — calendar/period planning: overdue, today, upcoming, no date, completed, search and filters.
- **Enfoque** — task-linked Pomodoro, stopwatch, breaks, cycles, continuous/automatic behavior.
- **Proyectos** — compact project list and full project detail.
- **Progreso** — day/week/month/range analytics, trends, distribution, heatmap and session history.

Five tabs are acceptable because each destination represents a distinct high-frequency job. Labels and icons remain visible and compact.

## Domain model v2

### Task

A task contains:

- id, title, projectId, priority, createdAt, updatedAt;
- completed, completedAt, inProgress, favorite;
- dueAt and optional reminderAt;
- recurrence rule: none, daily, weekdays, weekly, monthly;
- notes;
- estimatedPomodoros;
- ordered subtasks with completion state;
- sortOrder;
- notificationId for scheduled local reminder reconciliation.

Completing a recurring task records completion on the current item and immediately creates the next occurrence with a new id and advanced due/reminder dates. Undo removes that generated occurrence.

### Project

A project contains id, name, icon, archived, createdAt, updatedAt, description and sortOrder. Metrics are derived from tasks and sessions rather than stored.

### Focus session

A session contains projectId, optional taskId, mode, phase, startedAt, endedAt, durationSec, plannedSec, completed, interrupted, and cycleNumber. Task/project time and completed Pomodoros are derived from sessions.

### Focus preferences

Persist focusMinutes, shortBreakMinutes, longBreakMinutes, longBreakEvery, targetCycles, autoStartBreaks, autoStartFocus, continuousMode, keepAwake, vibrationEnabled, soundEnabled, and notifyBeforeEndMinutes.

### State and migration

- State version becomes `2`.
- Existing v1 projects, tasks and sessions migrate without data loss.
- Missing v2 fields receive deterministic defaults.
- Seed content is reduced and realistic; user-created persisted state is never replaced.

## Task and agenda behavior

- Quick add creates a task for today.
- Full editor supports title, due date/time, reminder, recurrence, project, priority, estimated Pomodoros, notes and subtasks.
- Native date/time picker is used on Android/iOS.
- Reminder scheduling uses local notifications; local notifications remain compatible with Expo Go.
- Agenda smart lists are derived from dueAt/completed state.
- Search covers title, notes, project and subtask titles.
- A task can be duplicated, postponed by one day, moved between projects, completed, reopened or deleted with undo.
- Overdue status is visible but does not use large red cards.
- Completed tasks remain accessible and can be reopened.

## Project behavior

- Project list is compact and searchable.
- Detail screen shows open/completed tasks, focus time, planned/completed Pomodoros, progress and recent sessions.
- Create/edit project supports name, icon and description.
- Project tasks can be added directly from detail.
- Archive/restore remains reversible.
- Deleting a project is not included; archive is the safe lifecycle action.

## Focus behavior

- User chooses a concrete task or a project-only session.
- Modes: Pomodoro and stopwatch.
- Pomodoro phases: focus, short break, long break.
- Long break occurs after configurable cycles.
- Pause/resume/stop/skip are timestamp-based.
- Continuous mode and automatic start settings are honored.
- Meaningful focus phases record a session; breaks are tracked separately but excluded from focus totals.
- Completed focus sessions increment task progress through derived completed Pomodoros.
- Local notification is scheduled for phase completion and optional pre-end warning.
- Running sessions can keep the screen awake.
- App foreground reconciliation does not double-record sessions.

## Statistics behavior

- Periods: day, week, month and rolling 90-day heatmap.
- Metrics: focus time, completed tasks, completed Pomodoros, goal rate, average session and streak.
- Trends compare current period with previous equivalent period.
- Distribution by project and task.
- Daily focus/task series.
- Planned vs completed Pomodoros.
- Recent session timeline with task/project context.
- Empty periods preserve axes/context and offer a direct action.
- No fake or explanatory analytics.

## Visual reset

- Remove the decorative corner circle.
- Reduce giant page titles and excessive vertical whitespace.
- Limit raised surfaces; lists use separators and grouped native sections.
- Use one consistent 16 px content gutter, 12–16 px section spacing and 48 dp hit areas.
- Bottom navigation uses five compact destinations without boxed active backgrounds.
- Task rows prioritize title, schedule and estimated/completed Pomodoros.
- Details and editing use bottom sheets or focused detail routes, not dense dashboards.
- Enfoque remains the strongest visual moment but with controls aligned to actual state.
- Analytics use compact cards only for top metrics; charts live on flat grouped surfaces.

## Platform modules

Add only official/Expo-Go-compatible modules:

- `expo-notifications` for local reminders and timer completion.
- `expo-keep-awake` for active focus sessions.
- `@react-native-community/datetimepicker` for native date/time selection.

No backend or paid service is introduced.

## Quality and testing

Automated contracts cover:

- v1→v2 migration;
- agenda buckets and search;
- recurrence generation and undo metadata;
- reminder scheduling descriptors;
- task/project metrics;
- Pomodoro short/long break transitions and auto-start decisions;
- period analytics, streaks, trends and planned/completed Pomodoros;
- configuration/dependency versions.

CI must pass unit tests, TypeScript, ESLint, Expo Doctor and Android export. The block can merge autonomously after CI is green, but product acceptance remains pending physical Samsung review.
