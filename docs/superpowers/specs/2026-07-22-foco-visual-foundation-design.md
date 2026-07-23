# FOCO Visual Foundation — Design Specification

## Goal

Replace the temporary Mobile Lab screen with the first usable FOCO experience: a premium graphite visual system, working bottom navigation, and an interactive **Hoy** screen that can be reviewed directly in Expo Go on Android.

## Approved visual direction

The approved mockup uses a monochrome, high-contrast dark interface:

- Background: near-black graphite.
- Surfaces: layered charcoal with thin cool-gray borders.
- Typography: large white headings, muted gray supporting copy, compact metadata.
- Shape language: rounded cards, circular controls, restrained glow only on the active focus action.
- Navigation: four persistent destinations — Hoy, Proyectos, Enfoque and Estadísticas.
- No decorative bright colors. Priority is conveyed with white/gray intensity and small neutral markers.

## Scope

### Included

1. Shared design tokens for colors, spacing, radii and typography sizes.
2. Reusable primitives for screen headers, cards, section headings and the bottom navigation.
3. Expo Router tab structure for:
   - Hoy
   - Proyectos
   - Enfoque
   - Estadísticas
4. A complete Hoy screen containing:
   - date and daily summary;
   - focus-time, pending, active and completed metrics;
   - quick task creation;
   - current focus card;
   - task list;
   - task completion toggles.
5. Polished placeholder screens for the remaining three tabs so navigation can be validated.
6. Keyboard-safe and safe-area-aware layout on Android.
7. Unit-tested task model using Node's built-in test runner.

### Excluded

- Persistent storage.
- Notifications.
- Background timers.
- Authentication, backend or cloud sync.
- Final Proyectos, Enfoque and Estadísticas implementations.
- Light theme.

## Architecture

- `app/(tabs)/` owns route-level screens.
- `src/ui/` owns reusable visual primitives and design tokens.
- `src/features/today/` owns the task model and Hoy-specific components.
- Route screens compose focused components and do not contain domain algorithms.
- The task model remains framework-independent so it can be tested without React Native test dependencies.

## Interaction rules

- Tapping **Añadir tarea** reveals a single-line input and save action.
- Empty or whitespace-only tasks are rejected.
- A newly created task appears at the top of the pending list.
- Tapping a task checkbox toggles completion and updates summary counts immediately.
- Tapping any tab changes routes without leaving Expo Go.
- The focus card is visually actionable but does not start a real timer in this block.

## Accessibility

- Touch targets are at least 44 logical pixels.
- Text and controls maintain strong contrast.
- Interactive elements have accessibility roles and labels.
- The task list remains usable with increased font scaling.
- Bottom navigation respects the device bottom inset.

## Acceptance criteria

- Expo Router opens directly on Hoy.
- All four tabs navigate successfully.
- Hoy visually follows the approved graphite mockup.
- Quick-add and completion toggles work in memory.
- Summary metrics update from the task model.
- `npm test`, `npm run typecheck`, `npm run lint`, and Expo Doctor pass in CI.
- No services, secrets or paid dependencies are introduced.
- The branch remains separate from `main` until phone review.