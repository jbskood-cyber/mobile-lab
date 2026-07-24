# FOCO — B5.1 Android Home-Screen Widget — Design

Date: 2026-07-24
Status: design ready for product review; implementation not started
Base: `main` @ `ae3393549d4f38038e0228fe2337259fc52c7672`

## Objective

Add a useful Android home-screen widget for FOCO without coupling it to the mounted React tree, without introducing a backend, and without weakening the existing offline-first state model.

The first version should make FOCO useful before the app is opened: show the current focus state when a timer is active, otherwise show the best next task for today, and provide a direct path into the relevant FOCO screen.

## Constraints already established by the product

- Android first.
- Offline-first remains canonical.
- `expo-sqlite/kv-store` remains the persisted local state source.
- FOCO is now moving to a Development Build; Expo Go is no longer the canonical runtime.
- Existing persisted contracts must remain compatible:
  - `foco:state:v3`
  - `foco:timer:v2`
- No account, backend, cloud sync, or paid service is required for B5.1.
- No work directly on `main`.
- Physical behavior must not be declared validated until it is tested on the Samsung.

## Current architecture relevant to the widget

FOCO already persists the complete product state to `expo-sqlite/kv-store` under `foco:state:v3`. The focus runtime is independently persisted under `foco:timer:v2`.

The current product already has pure domain helpers suitable for reuse outside React, including `buildDayPlan` and `getMomentumTask` in `src/core/dayPlan.ts`. The widget should reuse pure logic where safe instead of reproducing task-ranking rules.

The React store provider is intentionally not a widget dependency. Android widget events can execute without a mounted application UI, so widget code must use a small storage/domain boundary rather than React context or hooks.

## Platform research

### Official Expo widgets

As of 2026-07-24, Expo's official `expo-widgets` package targets iOS home-screen widgets and Live Activities. It is not the Android solution for this block.

References:
- https://docs.expo.dev/versions/latest/sdk/widgets/
- https://docs.expo.dev/versions/v54.0.0/

### Android option compatible with Expo

`react-native-android-widget` provides:

- an Expo config plugin;
- support for Development Builds;
- Android widget rendering from React Native-style widget primitives;
- widget task handlers for add/update/resize/click events;
- explicit Expo setup documentation;
- support for the React Native new architecture.

Expo published a December 2025 tutorial demonstrating Android widgets in an Expo app using this library, including Expo Router, deep links, widget task handlers, state sharing and `expo-sqlite`.

References:
- https://saleksovski.github.io/react-native-android-widget/
- https://saleksovski.github.io/react-native-android-widget/docs/tutorial/register-widget-expo
- https://saleksovski.github.io/react-native-android-widget/docs/tutorial/register-task-handler
- Expo tutorial: https://www.youtube.com/watch?v=rCVWq4WkoDA

## Considered approaches

### A. `react-native-android-widget` through its Expo config plugin — recommended

Advantages:
- smallest native surface area;
- matches FOCO's Expo Development Build direction;
- can consume the same on-device persisted state;
- avoids maintaining custom Android provider/config-plugin code;
- supports click/deep-link behavior and resizing.

Risks:
- third-party native dependency;
- widget task handler has a different execution lifecycle than the mounted app;
- physical validation is mandatory on the target Samsung/launcher.

Mitigation:
- keep the widget boundary tiny and dependency-light;
- put all interpretation of persisted data behind pure functions;
- add runtime/config tests before wiring native registration;
- avoid headless mutations in V1.

### B. Custom Expo config plugin + native Android AppWidget implementation

Advantages:
- maximum native control;
- no third-party widget runtime dependency.

Disadvantages:
- substantially more Kotlin/Java/config-plugin maintenance;
- higher regression surface;
- duplicates integration work already provided by a focused library;
- slower route for an MVP widget.

Use only if approach A proves incompatible during a reproducible Development Build test.

### C. Notifications/shortcuts instead of a widget

Lower implementation risk, but it does not satisfy B5.1 because it does not provide persistent home-screen information. Rejected as the primary solution.

## Recommended V1 product design

### Widget name

`FOCO — Ahora`

### Primary state: active focus session

When `foco:timer:v2` represents a running session, show:

- phase: Enfoque / Descanso;
- associated task title when available;
- remaining time derived from the persisted timestamp runtime;
- compact progress treatment;
- tap action: deep-link to `/focus`.

The widget must derive remaining time from `anchorMs` and persisted runtime values. It must not depend on a JavaScript interval running continuously in the widget.

### Secondary state: no active session

When no timer is running, read `foco:state:v3` and select the next useful task using the existing domain rules rather than a new widget-only ranking algorithm.

Preferred selection order:
1. `getMomentumTask(state, now)` when available;
2. first scheduled incomplete task remaining today;
3. first flexible task today;
4. Inbox count/empty-state fallback.

Show:
- task title;
- project name when available;
- scheduled time or compact duration when relevant;
- CTA label: `Enfocar`;
- tap action: deep-link to the relevant task/focus flow.

### Empty state

If the persisted state is unavailable, invalid or has no actionable tasks:

- show `FOCO`;
- copy: `Tu día está despejado`;
- action: open Hoy.

The widget must never crash the launcher because product state is missing or from an older schema.

## Interaction scope for V1

V1 is intentionally conservative:

- widget is informative outside the app;
- taps deep-link into FOCO;
- no direct completion of tasks from the widget;
- no direct start/stop/pause timer mutation in the headless widget process;
- no notification scheduling from the widget task handler.

Reason: direct state mutation would require atomic reconciliation with reminders, recurring task generation, focus session logging and the mounted store. That is valuable later, but it is unnecessary risk for the first native widget.

A later B5.1.x enhancement can add direct actions after the read-only/deep-link widget is physically proven stable.

## Architecture

### 1. Widget data adapter

Add a dependency-light adapter responsible for:

- reading `foco:state:v3`;
- reading `foco:timer:v2`;
- safe JSON parsing;
- hydration compatibility fallback;
- resolving current project/task labels;
- producing a small serializable `FocoWidgetModel`.

The adapter must not import React, React Native UI components, `FocoStore`, notification modules or mounted-provider state.

### 2. Pure widget model

Suggested model:

```ts
type FocoWidgetModel =
  | {
      kind: 'focus';
      phase: 'focus' | 'shortBreak' | 'longBreak';
      taskTitle?: string;
      remainingSeconds: number;
      progress: number;
      deepLink: string;
    }
  | {
      kind: 'task';
      taskId: string;
      title: string;
      projectName?: string;
      meta?: string;
      deepLink: string;
    }
  | {
      kind: 'empty';
      title: string;
      subtitle: string;
      deepLink: string;
    };
```

### 3. Widget renderer

Use only widget primitives supported by `react-native-android-widget`.

Visual requirements:
- compatible with FOCO light/dark identity;
- compact hierarchy;
- readable at Android launcher scale;
- no fragile decorative effects;
- no dependency on Manrope in V1 unless font packaging is proven in the native build;
- resize-safe minimum layout.

### 4. Widget task handler

Handle at minimum:
- widget added;
- widget update;
- widget resized;
- widget click/open action.

Every render must reconstruct its model from persisted storage. Do not assume module singletons retain valid state across invocations.

### 5. App → widget refresh bridge

When FOCO persists meaningful state changes while the app is open, request a widget refresh on a debounced/bounded basis.

Do not refresh on every React render.

Initial refresh triggers should be limited to changes that materially affect the widget:
- task create/update/complete/reopen/replan;
- focus timer start/pause/stop/phase transition;
- local data restore/reset.

Periodic Android widget refresh remains a fallback, not the primary consistency mechanism.

## Deep linking

Reuse the existing `foco` scheme from `app.json`.

V1 should target existing routes where possible rather than adding a parallel navigation architecture. Candidate destinations:
- focus widget → `/focus`;
- task widget → `/task/<id>` or `/focus` with task context if route semantics require it;
- empty widget → root/Hoy.

Exact URI construction must be covered by tests before native registration.

## Error handling

- Invalid persisted JSON → render safe empty widget.
- Missing task/project referenced by timer → render focus state without label.
- Old state version → use existing hydration/migration boundary where it can be reused without UI dependencies; otherwise fail soft to empty state.
- Unsupported native module during non-Android/unit-test execution → isolate import/registration so TypeScript/tests can run without Android runtime.

## Testing strategy

Before implementation is considered complete, add automated coverage for:

1. widget model from active running focus runtime;
2. remaining-time derivation after background elapsed time;
3. active timer referencing a deleted task;
4. no active timer → momentum task;
5. no momentum task → scheduled/flexible fallback;
6. empty state;
7. malformed persisted state;
8. old persisted state compatibility;
9. deep-link construction;
10. runtime-safety: widget native package must not execute on unsupported paths during regular JS tests.

Required technical gate:
- `npm test`;
- `npm run typecheck`;
- `npm run lint`;
- Expo Doctor;
- Android export/prebuild validation as appropriate;
- GitHub Actions green.

Required native gate:
- Development Build contains the widget provider;
- widget appears in Samsung launcher picker;
- add/remove/resize works;
- light/dark launcher conditions remain readable;
- task state refreshes after app changes;
- active timer display remains coherent after app background/kill;
- widget tap opens the expected FOCO route.

Native gate is `VALIDADO FÍSICAMENTE EN SAMSUNG`, never inferred from CI.

## Scope explicitly deferred

- direct task completion from widget;
- direct Pomodoro start/pause/stop from widget;
- interactive checklist controls;
- widget configuration UI;
- multiple widget types;
- Wear OS;
- iOS widget parity;
- cloud sync.

## Decision

Recommended implementation path: Approach A, beginning with a single `FOCO — Ahora` read-only/deep-link widget backed by existing persisted state and pure day/focus domain logic.

This design deliberately minimizes native mutation until Development Build and launcher behavior are physically validated on the Samsung.
