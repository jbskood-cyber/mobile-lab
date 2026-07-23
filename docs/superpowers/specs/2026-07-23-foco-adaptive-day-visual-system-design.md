# FOCO Adaptive Day + Visual System Design

## Objective

Transform FOCO from a complete local task manager into a compact, trustworthy daily planning system that helps the user capture, schedule, replan, begin and recover work without cognitive overload. This block combines the approved Adaptive Day direction with a complete light theme, a detailed calendar/agenda, richer demonstration data, a refined typographic system and global density improvements.

## Product principles

- FOCO must answer three questions quickly: what matters now, where does it fit today, and what should happen when the plan breaks.
- Existing data must migrate without loss.
- Every important feature must work offline.
- No visible control may be decorative.
- Light, dark and system themes must be first-class and persistent.
- The interface must show more information without reducing touch targets below 44–48 dp.
- Demonstration data must illustrate real workflows but remain removable.
- The implementation must remain compatible with Expo Go and Expo SDK 54.

## Scope

### 1. Theme and typography

Create semantic light and dark palettes instead of importing a global dark constant. Add a persisted appearance preference with `system`, `light` and `dark` values. All screens, sheets, navigation, charts, status bar and empty states consume the active palette.

Use Manrope through `@expo-google-fonts/manrope` and `expo-font`, loading 400, 500, 600 and 700 weights at runtime with a safe system-font fallback. Reduce the scale to compact mobile roles: display 28, title 20, section 15.5, body 14, metadata 12 and caption 10.5. Timer and metric numerals keep tabular figures.

### 2. Data model v3

Upgrade persisted state to version 3. Extend tasks with:

- `plannedStartAt?: number` for calendar placement;
- `durationMinutes: number` for capacity and timeline sizing;
- `captured: boolean` for Inbox items;
- `firstStep: string` for Momentum mode;
- `routineId?: string` for generated routine occurrences.

Extend recurrence with `fromCompletion: boolean` and preserve the existing interval. Add `RoutineTemplate` entities with reusable title, project, duration, Pomodoro estimate, notes, subtasks and recurrence. Add planning preferences for working-day start/end, buffer minutes and default task duration. Add appearance preference to state.

Migration v2 → v3 must preserve projects, tasks, sessions, reminders and focus preferences while filling deterministic defaults.

### 3. Rich demonstration state

Provide a deterministic `createDemoState(now)` with:

- multiple projects and descriptions;
- Inbox captures;
- fixed-time and flexible tasks across past, current and future dates;
- overdue, completed and recurring tasks;
- subtasks, notes, reminders and priorities;
- focus sessions and breaks across several weeks;
- routine templates;
- enough data to populate all analytics and calendar views.

Fresh installs use the demonstration state. Existing users keep their data. The app menu includes explicit actions to load the demo and to start empty, both with confirmation and Undo where safe.

### 4. Detailed Agenda

Agenda becomes a planning workspace with two modes:

- **Calendar:** compact month grid with activity dots, selected date, month navigation and a day summary.
- **Timeline:** hourly day view using the configured workday range, a current-time indicator, fixed tasks positioned by time, flexible tasks in a separate queue, focus-session history and visible free gaps.

Tapping a day selects it. Tapping an hour creates a task prefilled with `plannedStartAt`. Task blocks show title, project, duration, priority, recurrence, reminder and Pomodoro progress without becoming oversized cards. Search and smart lists remain available through a compact control row.

### 5. Adaptive day engine

Create pure functions that derive:

- scheduled load, flexible load, free minutes and overload;
- free gaps between fixed tasks;
- a recommended insertion time for flexible tasks;
- a sorted replan queue for unfinished past tasks;
- the next Momentum task based on lateness, priority, duration and current context.

Today shows a compact capacity line, the current/next task, the flexible queue and an Inbox capture entry point. No data is silently moved.

### 6. Daily Replan

When overdue tasks exist, offer a compact Replan sheet. Each task supports:

- complete;
- move to today;
- move to tomorrow;
- choose another date;
- return to Inbox;
- delete.

Actions update reminders consistently and support Undo where data can be restored. Replan progress is visible and dismissible; unfinished items remain available later.

### 7. Momentum mode

Momentum mode reduces the interface to one decision. It shows the recommended task, its first concrete step and a 2, 5 or 10 minute starter option. Starting creates a timer context linked to the task. The user can skip to another recommendation without altering task data.

### 8. Routines

Add a compact routines screen or sheet reachable from Agenda. Users can create a reusable template, activate it and generate the next occurrence. Completion-based recurrence calculates the next due date from completion time; fixed recurrence continues to use scheduled time. Templates can be paused without deleting history.

### 9. Backup, export and diagnostics

Add a Data & Diagnostics sheet with:

- JSON backup generation and sharing;
- CSV export for tasks and focus sessions;
- copy-to-clipboard fallback;
- pasted JSON import with schema validation and a preview summary;
- explicit confirmation before replacing local data;
- storage counts and notification diagnostics.

Use Expo SDK 54-compatible `expo-file-system`, `expo-sharing` and `expo-clipboard`. Import never partially mutates state.

### 10. Global compactness and visual audit

Replace remaining hard-coded dark colors with semantic tokens. Reduce headers, rows, cards, chips, sheets and tab-bar visual bulk while retaining accessible targets. Prefer dividers and grouped lists over nested cards. Remove decorative background circles and unnecessary explanatory copy. Apply one radius scale, consistent icon weights and predictable spacing.

## Architecture

- `src/core/model.ts`: version 3 types and immutable transitions.
- `src/core/migration.ts`: v1/v2/v3 parsing and deterministic migration.
- `src/core/demoState.ts`: removable rich demonstration fixtures.
- `src/core/dayPlan.ts`: capacity, gaps, replan and Momentum selectors.
- `src/core/backup.ts`: serialization, validation and CSV generation.
- `src/ui/FocoThemeContext.tsx`: appearance persistence and active tokens.
- `src/ui/themeTokens.ts`: semantic light/dark palettes and density/type tokens.
- `src/features/agenda/`: calendar, timeline and routines UI.
- `src/features/replan/`: daily recovery flow.
- `src/features/momentum/`: starter-mode UI.
- `src/features/settings/`: appearance, data and diagnostics.

Pure domain modules must remain testable without React Native. Side effects such as file sharing, clipboard and notifications stay behind platform adapters.

## Error handling

- Theme loading falls back to dark without blocking app startup.
- Font loading falls back to the platform font and still hides the splash screen.
- Backup sharing falls back to clipboard.
- Invalid imports report exact validation problems and never replace state.
- Calendar collisions are displayed as overlapping/stacked tasks rather than dropping data.
- Reminder reconciliation remains best-effort and never blocks task persistence.

## Testing and acceptance

Automated tests cover migration, theme resolution, demo determinism, capacity/gaps, replan actions, Momentum ranking, completion-based recurrence, backup round-trip, invalid import rejection, CSV escaping, calendar month generation and portable typography. Existing Block 2 tests remain green.

CI must pass unit tests, TypeScript, ESLint, Expo Doctor and Android export. Physical Samsung validation covers both themes, font loading, calendar/timeline scrolling, keyboard and sheets, theme persistence, demo loading, replan, Momentum, routines, backup sharing/import and restart persistence.

## Explicitly deferred

Widget Android, Wear OS, application blocking, remote account/sync, collaboration and AI-generated planning remain later native/infrastructure blocks. This block prepares clean interfaces but does not claim those capabilities.