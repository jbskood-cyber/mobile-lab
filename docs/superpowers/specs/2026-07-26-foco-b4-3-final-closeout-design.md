# FOCO B4.3 Final Closeout — Design Specification

## Purpose

Close B4.3 after physical Samsung review without rewriting FOCO or merging the existing stacked PRs prematurely. The closeout must fix the physical interaction regressions first, then finish the approved project hierarchy/identity and navigation direction, and finally apply contextual color cleanup.

Canonical technical base for this work is `feature/foco-product-polish-b4-3e` at `464122c3d46ae945e551b7efb3f99b2efda2a15f`. PRs #22→#25 remain unmerged until closeout validation is complete.

## Product principles frozen by review

1. FOCO identity is black, white, and neutral grays. Orange is no longer a global brand/interaction color.
2. No color gradients. Solid color only.
3. Color is contextual data: project identity and recorded time. It is not decoration.
4. Every project chooses `name + icon + color` independently. FOCO never assumes that a semantic category must use a particular color or icon.
5. Project identity propagates through project rows, tasks, focus sessions, Agenda, Progreso charts/heatmaps, and recent-session markers in restrained doses.
6. Hierarchy is exactly `Proyecto → Tarea → Subtarea`. No deeper nesting.
7. Navigation has no persistent bottom bar and no small top-left hamburger. The primary entry point is a compact floating section capsule that opens a premium navigation sheet; horizontal swipe may be an optional shortcut only.
8. Enfoque keeps its successful visual direction. It must expose Pomodoro, Temporizador, and Cronómetro.
9. Listas remains substantially unchanged. Rutinas gets clearer copy/discoverability, not a structural redesign.
10. No mascot, constant confetti, 3D cards, excessive glow, or decorative gimmicks.

## Current-source findings

The current model already contains first-class `Subtask` records and `Task.subtasks`, including add/toggle/delete operations. The closeout therefore does **not** create a new nesting architecture; it exposes and refines an existing persisted capability in the project/task UI.

`Project` currently persists `icon` but no color. The current icon union has six project choices. Project color therefore requires a backward-compatible model addition; subtasks do not require a state-version bump solely for storage because they already exist in `FocoState.version = 3`.

The current monthly calendar uses a same-day `onPress` timestamp comparison with a hard-coded 280 ms window. This passed source-contract tests but failed on the Samsung. The closeout must replace that source-shape test with behavior tests for a reusable tap recognizer and make the Android interaction tolerant enough for real touch timing without a new native dependency.

The current `FocusModeSelector` at the canonical head explicitly contains Pomodoro, Temporizador, and Cronómetro. The two-mode physical screenshot therefore cannot be explained by the canonical source tree and is treated as a runtime/bundle identity problem, not a reason to rewrite Enfoque.

## Delivery decomposition

### Slice F1 — Physical correctness and runtime confidence

Goal: remove blockers that invalidate physical review.

- Calendar single tap selects immediately.
- A second touch on the same date within a tolerant 450 ms recognition window opens that exact date in Día.
- Taps on different dates do not trigger double-tap behavior.
- Recognition logic is a pure unit-tested helper; `MonthCalendar` consumes it. No new native dependency or Development Build rebuild is introduced.
- Agenda Día continues to expand its time window around real sessions outside configured work hours.
- UI copy makes the relationship explicit: configured work hours describe the plan; real sessions outside them remain visible.
- Canonical source remains three-mode Enfoque. Add a development-only runtime marker in existing diagnostic/preferences output (not the normal Enfoque UI) that identifies the three-mode closeout bundle. This marker must not appear in production UI and exists only to let a local agent prove which JS bundle the Samsung loaded.

Success: automated tests prove date behavior and source has three modes; local Samsung later proves the exact bundle and double-tap behavior.

### Slice F2 — Project hierarchy UX

Goal: make existing subtasks discoverable and fast from a project.

- Project detail task rows become collapsible accordions.
- Collapsed row shows task title, compact metadata, completion affordance, subtask progress `n/m` when subtasks exist, and disclosure state.
- Expanded row reveals task context plus its subtasks.
- Each subtask has its own completion control.
- Inline `+ Añadir subtarea` opens a minimal inline input or compact sheet and returns to the expanded task.
- Task completion remains independent from individual subtask completion unless current domain rules already say otherwise; no implicit auto-completion is introduced.
- Existing task editor subtasks remain compatible.

Success: a user can create, reveal, complete, and add subtasks without leaving the project-detail task context.

### Slice F3 — Project identity model

Goal: make icon and color independent, persisted project properties.

#### Data contract

Extend `Project` with:

```ts
color: ProjectColor;
```

`ProjectColor` is a stable token ID, not a raw arbitrary hex string. Persist token IDs so Light/Dark rendering can evolve without data migration.

Existing projects without a color hydrate to a deterministic neutral-safe default token. No project ID, task ID, session ID, recurrence, reminder, or focus-session shape changes.

#### 32 project icons

The curated project-icon IDs are:

`briefcase`, `book`, `heart`, `grid`, `bulb`, `archive`, `home`, `calendar`, `target`, `star`, `note`, `checklist`, `flame`, `clock`, `folder`, `bars`, `graduation-cap`, `atom`, `dumbbell`, `bicycle`, `code`, `laptop`, `coin`, `wallet`, `camera`, `music-note`, `palette`, `airplane`, `leaf`, `mountain`, `trophy`, `users`.

System/navigation icons remain monochrome. Project icons render using the selected project color where contextual identity is useful.

#### Color catalog

The project palette is multicolor, solid, vivid-but-controlled, and categorical. It includes green, blue, red/coral, turquoise/cyan, violet/plum, and amber families from the approved catalog. The yellow/amber family overrides the catalog's aggressive yellow with:

- `amber-soft`: `#D6A23A` for light surfaces.
- dark-context companion: approximately `#B98224` when contrast requires a darker rendering.

All non-yellow project tokens must be transcribed from the approved color catalog before the color-application slice is merged; do not invent replacement HEX values when the source catalog is unavailable. Functional slices are not blocked by that transcription.

### Slice F4 — Navigation shell

Goal: remove inaccessible/dirty global navigation while preserving Expo Router routes.

- Keep the existing five primary routes: Hoy, Agenda, Enfoque, Proyectos, Progreso.
- Remove the visually persistent bottom tab bar.
- Remove the small hamburger entry from `FocoScreen`.
- Add one compact floating section capsule in the thumb-accessible lower side area. It shows current section label/icon, stays out of system gesture space, and can contract while scrolling or when content/keyboard requires space.
- Tapping the capsule opens the existing app-menu concept as a premium navigation sheet containing primary destinations and secondary destinations such as Rutinas/Preferencias where appropriate.
- Navigation remains explicit and accessible without swipe. Optional horizontal swipe between primary sections may be added only if it does not conflict with horizontal controls/calendars.
- Sheets, keyboard, and immersive Enfoque hide or relocate the capsule rather than overlap controls.
- Existing route URLs/deep links remain valid.

### Slice F5 — Contextual color and visual cleanup

Goal: apply the approved visual system after behavior/data foundations are stable.

- Global active controls, tabs, primary buttons, and main hierarchy use black/white/gray instead of orange.
- Remove color gradients, including the recovery surface on Hoy.
- Project color appears in small, meaningful marks: project icon, project dot/line, task/project progress, Agenda event identity, Progreso project/task bars, session markers, and activity heatmap cells.
- Do not paint large background regions with project colors.
- Progreso stays predominantly monochrome; its color answers “where did the time go?”.
- Agenda distinguishes Plan vs Real without relying on color alone.
- Dark mode derives accessible contextual renderings from the same persisted token IDs.

## Persistence and migration

Preserve the offline-first store and current IDs. The model extension is backward compatible:

- old serialized projects missing `color` receive a deterministic project-color token during hydration;
- existing `icon` values remain valid;
- existing subtasks remain untouched;
- no nested subtask shape is introduced;
- project colors are token IDs, not user-authored raw values;
- backup/restore must preserve the new project color token.

A state-version bump is required only if the existing hydration layer cannot safely default missing project fields. Prefer additive normalization in the current v3 hydration path if repository conventions permit it; do not bump version merely because TypeScript gained a property.

## Testing strategy

Every slice follows RED → GREEN and full repository validation.

Required behavior coverage:

- same-day double tap opens exact Día; different-day taps never do;
- single tap still selects;
- Agenda window includes early/late real sessions and communicates Plan vs Real;
- source and runtime diagnostic identify three focus modes;
- old project payload hydrates with a valid color token;
- icon/color selection are independent;
- all 32 project icon IDs resolve through `FocoIcon`;
- subtasks add/toggle/delete without changing parent IDs;
- project detail accordion exposes correct `completed/total` progress;
- navigation has no persistent bottom bar and no hamburger trigger while all five routes remain reachable;
- contextual color uses project tokens and global orange/gradients are absent from the targeted B4.3 surfaces.

Final automated gate: `npm test`, `npm run typecheck`, `npm run lint`, Expo Doctor, Android bundle/export. Final human gate is one integrated Samsung smoke pass, not repeated micro-reviews.

## Merge strategy

Keep #22→#25 open while closeout work is stacked from `464122c`. The final closeout PR remains draft during implementation. After all closeout slices and CI are green, verify ancestry/diff, integrate predecessors in safe order, rebase/retarget closeout as required without force-push, and perform one final Samsung smoke test before declaring B4.3 DONE.
