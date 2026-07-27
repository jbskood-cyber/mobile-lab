# FOCO B4.3 Closure — Post-Review Design

## Purpose

Close B4.3 after physical Samsung review without rewriting FOCO’s architecture. This closure fixes the two observed functional gaps, makes the existing task/subtask model visible and useful, replaces decorative orange with meaningful project identity, and replaces the inaccessible top-left hamburger plus persistent bottom navigation with a cleaner reach-friendly navigation surface.

The base product identity is monochrome: black, white, and neutral grays. Color exists only to identify user-defined projects and the time/work that belongs to them.

## Canonical Base and Scope

- Repository: `jbskood-cyber/mobile-lab`
- Closure branch starts from stacked B4.3E head `464122c3d46ae945e551b7efb3f99b2efda2a15f`.
- B4.3A is already merged in `main` at `ce3748a7eda1afde5e9f526912bc7e34fdaf17b0`.
- PRs #22, #23, #24, and #25 remain unmerged while closure work is developed and validated.
- Preserve Expo Router, React Native/Expo SDK 54, offline-first `FocoStore`, local persistence, current IDs, notifications, focus-session history, routines, and Android Development Build.
- Do not start B5.x work in this closure.

## Current-Code Findings

1. `Task.subtasks` and the `Subtask` model already exist and are persisted in `FocoState` v3. Domain functions already exist for `addSubtask`, `toggleSubtask`, and `deleteSubtask`. Therefore the requested hierarchy is primarily a UX/exposure problem, not a new data hierarchy.
2. `ProjectIcon` currently has only six values: `briefcase | book | heart | grid | bulb | archive`.
3. `Project` has no color field.
4. `normalizeState` currently accepts only version 3 and largely casts project/task arrays without field-level normalization.
5. `FocusModeSelector` at the B4.3E head explicitly contains `Pomodoro`, `Temporizador`, and `Cronómetro`; the two-mode Samsung capture is therefore a runtime/bundle mismatch until proven otherwise.
6. `MonthCalendar` implements double tap with two JS `onPress` events inside a 280 ms window. Physical review showed this is not reliable enough.
7. `FocoTabBar` is a persistent bottom tab bar. Product direction now requires routing to remain stable while the visible navigation control is replaced.

## Product Principles

### Monochrome foundation

- White/light neutral backgrounds, black/charcoal primary text and controls, gray secondary text/dividers.
- Global selected states and primary actions use black, not orange.
- No color gradients anywhere in product UI.
- No mascot, confetti loops, 3D cards, decorative glow, or motion without behavioral meaning.

### Color is data

Color does not represent app chrome, priority, success, or error by default. It identifies a project and follows that project’s work through the product:

`Project → Task → Subtask context → Focus Session → Agenda → Progress/Charts/Heatmaps`.

Color should appear in small, high-information surfaces: icon container/accent, dot, thin border, timeline event edge, progress line, graph mark, heatmap cell, and session marker. Large saturated backgrounds are prohibited except tiny icon tiles where contrast is verified.

## Project Color System

Each project independently chooses one `ProjectColorId`. No color is tied to a semantic category such as “Study” or “Health”.

Use this 12-color solid catalog for B4.3 closure:

| ID | Name | HEX |
|---|---|---|
| `emerald` | Esmeralda | `#16A66A` |
| `sage` | Salvia viva | `#66A884` |
| `teal` | Turquesa | `#159C95` |
| `cyan` | Cian | `#269DB5` |
| `cobalt` | Cobalto | `#2F6FE4` |
| `indigo` | Índigo | `#4B5BC5` |
| `red` | Carmesí | `#D94C45` |
| `coral` | Coral | `#E26C5A` |
| `amber` | Ámbar suave | `#D6A23A` |
| `violet` | Violeta | `#7A5AD8` |
| `plum` | Ciruela | `#A04C9E` |
| `magenta` | Frambuesa | `#C94D7C` |

Dark surfaces may use a token-specific darker foreground/edge generated in the palette module; `amber` uses `#B98224` as its explicit darker companion because the brighter yellow family was rejected during review.

The catalog is intentionally finite. Users choose from tokens; arbitrary HEX input is out of scope for B4.3.

## Project Identity

### Data contract

`Project` gains a required `color: ProjectColorId` field. `icon` remains required but expands to 32 curated values.

Do not bump `FocoState.version` solely for this additive field. Keep version 3 and make hydration explicitly normalize projects:

- existing valid icon → preserve;
- unknown/legacy icon → fallback `grid`;
- existing valid project color → preserve;
- missing/invalid color → assign a deterministic fallback from the project palette using `sortOrder` so existing projects receive stable colors across launches;
- preserve IDs, names, archive state, descriptions, sort order, and timestamps.

This is a backward-compatible hydration migration, not a destructive reset.

### 32-icon catalog

The project icon library is fixed at 32 curated icons grouped only for browsing; groups do not imply project semantics:

`briefcase`, `book`, `heart`, `grid`, `bulb`, `archive`, `house`, `dumbbell`, `notebook`, `chart`, `star`, `code`, `camera`, `music`, `leaf`, `airplane`, `target`, `graduation`, `microscope`, `atom`, `wallet`, `coins`, `cart`, `utensils`, `people`, `user`, `palette`, `pencil`, `flag`, `mountain`, `trophy`, `laptop`.

System/navigation icons remain monochrome. Only project identity icons consume the selected project color.

### Create/edit project UX

Project creation/editing shows name and description first, then two clearly independent controls:

1. `Color del proyecto` — compact solid swatches from the 12-token catalog.
2. `Icono del proyecto` — 32-icon grid/picker.

The selected color never changes the selected icon and vice versa. The user can freely combine any icon with any color.

## Proyecto → Tarea → Subtarea

The hierarchy has exactly three levels:

1. Project
2. Task
3. Subtask

No subtask may own another subtask.

### Task rows

Project detail renders tasks as compact rows/cards that can expand inline. A collapsed task shows its existing summary. An expanded task adds:

- existing task detail/first step where relevant;
- `Subtareas n/m`;
- each subtask with its own completion control;
- inline `+ Añadir subtarea` action;
- optional delete action inside subtask affordance, not exposed as a noisy primary button.

Expansion state is UI-only and must not be persisted globally.

### Subtask behavior

- Add: trim title; ignore empty input; preserve task and project IDs.
- Complete/reopen: use existing `toggleSubtask` domain behavior and completion timestamp.
- Delete: use existing `deleteSubtask` behavior.
- Progress: `completed subtasks / total subtasks`; task completion does not automatically require all subtasks unless the user explicitly completes the task.
- Existing task-creation sheet may continue accepting initial subtasks, but project detail becomes the fastest way to add them after creation.

## Agenda Closure

### Reliable double tap

Keep the existing interaction contract:

- single tap: select date;
- double tap on the same date: select it and open `Día` for that exact date.

Replace the current 280 ms ad-hoc threshold with a testable tap interpreter using a 420 ms same-day window. The first tap may select immediately; the second matching tap opens the day and clears pending tap state. A second tap on a different date starts a new sequence. This avoids adding a new native dependency solely for this behavior.

The interpreter must be a pure unit-testable helper; `MonthCalendar` becomes a thin adapter.

### “Todo cuenta” / Plan vs Real

The existing dynamic day-window behavior stays: real focus sessions before/after configured work hours expand the visible timeline. Improve comprehension without adding a second hidden history surface:

- summary copy distinguishes `Plan` from `Real`;
- timeline visually labels real session events as real work;
- when the visible window extends beyond configured planning hours, show a quiet `Fuera de horario` marker at the boundary, not a warning color;
- never omit valid focus sessions because they fall outside planning hours.

## Enfoque Closure

Do not redesign Enfoque visually. Keep the three explicit modes already present in source:

`Pomodoro | Temporizador | Cronómetro`.

Add/retain regression tests that assert all three modes exist and that timer presets/custom duration remain wired. The physical two-mode mismatch is treated as a local runtime/bundle gate, not as evidence that source must be reimplemented.

Before final Samsung review, the local agent must:

- run from the final closure head;
- clear Metro cache;
- verify the bundle URL points to LAN, not localhost;
- verify the visible selector contains all three labels.

No production-only diagnostic UI is added for this mismatch.

## Navigation Redesign

Preserve Expo Router’s tab routes and navigation state. Replace only the visible persistent tab-bar surface.

### Floating section capsule

When no keyboard, overlay, immersive focus state, or conflicting sheet is active, show one compact floating capsule near the lower safe area. It displays:

- current section icon;
- current section label;
- subtle disclosure affordance.

It is not a row of tabs and does not permanently consume full-width bottom space.

### Navigation sheet

Tapping the capsule opens a premium navigation sheet using the existing shared sheet infrastructure. Primary destinations:

- Hoy
- Agenda
- Enfoque
- Proyectos
- Progreso

Secondary destinations appear below a divider when they exist in the current architecture, including Listas/Rutinas/Preferencias through their real routes or existing entry points. Do not invent duplicate routes.

Selecting a destination closes the sheet and navigates through the existing router/tab navigator. Selecting the current destination closes the sheet and triggers the existing scroll-to-top behavior where supported.

### Reach and interference rules

- minimum 44 pt touch target;
- respect bottom safe area;
- hide while keyboard is visible;
- hide while another overlay/sheet is open;
- hide during immersive focus sessions;
- contract or fade when content scroll makes it obstructive, then restore when scrolling settles/upward;
- swipe between principal sections is optional enhancement only and may not be the sole discoverable navigation method.

The old top-left hamburger entry point is removed from primary screens once the capsule/sheet covers those destinations. Contextual back buttons and screen-specific actions remain.

## Progress and Contextual Color

The Progreso screen remains predominantly monochrome.

- `Tendencia`: marks/bars inherit the project color of the underlying session when the data can be attributed; unattributed aggregate marks use charcoal/gray.
- `Por proyecto`: small color dot + thin progress line in project color.
- `Por tarea`: thin line uses the task’s project color.
- `Actividad de 90 días`: empty cells are neutral gray; activity cells use project colors where one project dominates that bucket, otherwise a neutral dark intensity.
- `Sesiones recientes`: small project-colored marker; text remains black/gray.
- `Plan frente a ejecución`: monochrome unless a project-specific breakdown is explicitly shown.

No orange fallback is allowed.

## Today, Lists, Routines, and Existing Polish

### Today

Remove orange/degraded recovery styling. The recovery surface becomes a neutral solid surface with black hierarchy; project colors may appear only inside project-specific content.

### Lists

Preserve structure and behavior. Only migrate global orange accents to monochrome/contextual tokens.

### Routines

Do not change routine semantics. Improve discoverability through concise copy and labels so users can understand that a routine is a reusable recurring task template. Pause, generate-now, and create-new behavior stays intact.

### Enfoque

Preserve current visual composition except changes needed to keep navigation out of immersive mode and to guarantee the three-mode selector.

## Accessibility and Motion

- Project color is never the only carrier of meaning; always pair with text/icon/position.
- Selected states must remain legible in grayscale.
- All touch targets at least 44 pt where feasible.
- Maintain reduced-motion behavior from B4.3A.
- Navigation capsule/sheet transitions use existing FOCO motion tokens; no bounce.
- No routine navigation haptics. Haptics remain semantic only.

## Test Strategy

### Domain/unit

- project color token validation and deterministic legacy fallback;
- 32 project icon validation/fallback;
- `normalizeState` preserves all existing v3 data while filling missing project identity fields;
- current subtask add/toggle/delete behavior remains stable;
- task/subtask progress helper covers 0/0, 0/n, n/n;
- tap interpreter covers single, same-day double, slow second tap, and different-day second tap;
- three focus modes remain present.

### UI contract tests

- project editor exposes independent color and icon selectors;
- project detail exposes expandable tasks and inline subtask creation;
- new navigation exposes one current-section capsule, not five persistent tabs;
- navigation sheet lists principal destinations and preserves current-section scroll-to-top behavior;
- global orange/degradient tokens are absent from product surfaces covered by closure;
- Agenda displays out-of-hours marker when real sessions extend the timeline.

### Full validation per slice

- unit tests;
- TypeScript typecheck;
- lint;
- Expo Doctor;
- Android bundle/export.

### Final physical gate

One integrated Samsung review only after CI-green closure head:

1. open FOCO from the correct Development Build;
2. confirm three Enfoque modes;
3. double tap a calendar day and land on that exact Day;
4. observe a real out-of-hours session in Day timeline;
5. create/edit a project with independent icon + color;
6. expand a task, add/complete a subtask, close/reopen app and confirm persistence;
7. navigate all principal sections using the floating capsule/sheet;
8. verify no persistent bottom bar, no primary hamburger, no orange global theme, and no gradients;
9. verify Progreso uses project colors as data while remaining visually monochrome.

## Delivery Order

The closure is executed in slices so each can be independently rejected or accepted:

1. Agenda interaction reliability + source/runtime regression contracts.
2. Project identity persistence + 32-icon/color domain.
3. Task/subtask expandable UX using the already-existing domain.
4. Floating navigation capsule + navigation sheet, preserving router architecture.
5. Contextual color propagation + orange/gradient cleanup + routines copy.
6. Integrated validation and one Samsung physical gate.

## Explicit Non-Goals

- No arbitrary custom HEX picker.
- No sub-subtasks or infinite nesting.
- No project templates/categories that force icons/colors.
- No B5 widget, Usage Access, blocking, audio, cloud sync, auth, backend, or payments.
- No navigation architecture rewrite if the existing Expo Router tab state can be reused.
- No new mascot, gamification layer, or visual gimmick.
