# FOCO Functional Core Premium — Implementation Plan

## Goal

Convert the four approved visual screens into one coherent, offline-first product loop with persistent data, a real focus timer and statistics derived from user activity.

## Tasks

- [x] Define the premium interaction and persistence contract.
- [x] Add immutable task, project, session and statistics domain helpers.
- [x] Add timestamp-based Pomodoro and stopwatch helpers.
- [x] Add SQLite-backed local persistence.
- [x] Add semantic haptics, reduced-motion support, sheets and undo feedback.
- [x] Make Today create, complete, edit, filter and delete persistent tasks.
- [x] Make Projects searchable, creatable, archivable and metrics-driven.
- [x] Make Enfoque a real persistent timer that records sessions.
- [x] Make Estadísticas derive weekly charts and activity from local history.
- [ ] Run unit tests, TypeScript, ESLint, Expo Doctor and Android export.
- [ ] Fix all discovered regressions.
- [ ] Merge to main and validate on the physical Samsung.

## Acceptance

- User changes survive closing and reopening Expo Go.
- Task, project, focus and statistics screens share one source of truth.
- Timer controls are accurate after delayed JS updates and navigation.
- Destructive actions can be reversed where appropriate.
- Core controls meet Android touch-target expectations.
- No backend, account, remote API or paid dependency is introduced.
