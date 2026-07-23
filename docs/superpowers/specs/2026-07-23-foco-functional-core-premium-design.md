# FOCO Premium Functional Core

## Goal

Turn the approved four-screen visual prototype into a genuinely usable offline-first mobile app while preserving the approved mockups as the visual contract.

## Product loop

1. Create and organize projects.
2. Add, complete, edit and remove tasks.
3. Start a Pomodoro or stopwatch focus session.
4. Persist all data locally across app restarts.
5. Derive Today and Statistics from the same real data.

## Premium interaction contract

- Every important action produces immediate visual feedback.
- Haptics are short, semantic and optional at the OS level; they complement rather than replace visible feedback.
- Touch targets remain at least 48 logical pixels on Android.
- Motion is restrained and disabled when the system requests reduced motion.
- Destructive actions support reversal through an undo affordance instead of unnecessary confirmation alerts.
- Empty, loading and storage-error states preserve context and never present a blank screen.
- The four approved mockups remain visually authoritative; functionality must fit the design instead of replacing it.

## Architecture

- `src/core/model.ts`: domain types, seed data and pure state transitions.
- `src/core/FocoStore.tsx`: global store, local persistence and app actions.
- `src/core/focusTimer.ts`: timestamp-based Pomodoro/stopwatch calculations that remain accurate while the JS interval is delayed.
- `src/ui/FocoSheet.tsx`: reusable accessible bottom sheet for creation, editing and settings.
- `src/ui/PremiumPressable.tsx`: consistent press state and optional haptics.
- Existing screen modules consume the shared store and derive their UI from real data.

## Persistence

Use `expo-sqlite/kv-store`, backed by SQLite and supported in Expo Go. Persist domain state under a versioned key. Hydrate once at app start, migrate defensively and seed only when no valid state exists.

## Functional scope

### Today

- Real metrics from tasks and sessions.
- Quick add persists tasks.
- Complete tasks with undo.
- Edit or delete a task from its trailing action.
- Focus card opens the functional timer.

### Projects

- Real project list derived from the store.
- Search and active/archive filters.
- Create projects.
- Archive and restore projects.
- Progress and focused time derive from project tasks and sessions.

### Focus

- Real countdown and stopwatch modes.
- Start, pause, continue and stop.
- Timestamp-based calculations for accuracy after tab changes or temporary backgrounding.
- Adjustable session length, break length and cycle goal.
- Completed focus time records a session and immediately updates Today and Statistics.

### Statistics

- Week navigation based on actual dates.
- Summary metrics derived from recorded sessions and completed tasks.
- Activity heatmap and daily bars generated from local history.
- Distribution derived from session durations.

## Quality constraints

- No backend, authentication, paid service, analytics SDK or remote API.
- Android physical device through Expo Go remains the primary acceptance target.
- Keep iOS compatibility.
- Tests cover state transitions, timer calculations and statistics aggregation.
- CI must pass unit tests, TypeScript, ESLint, Expo Doctor and Android export before merge to `main`.
