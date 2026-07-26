# FOCO B4.3 — Post-review closeout contract

## Goal

Close B4.3 from the Samsung review without rewriting FOCO's offline-first architecture, while turning the accepted product direction into testable, backward-compatible slices.

## Source of truth

- Technical base: `feature/foco-product-polish-b4-3e` at `464122c3d46ae945e551b7efb3f99b2efda2a15f`.
- Existing stacked PRs `#22 → #23 → #24 → #25` stay unmerged until this closeout is validated and integrated safely.
- `FocoState` data, IDs, local persistence, routines, sessions, reminders, Expo Router and Android Development Build must be preserved.

## Product direction frozen from physical review

### 1. Visual identity

- FOCO's base UI is black, white and neutral grays.
- Orange is no longer a global brand/accent color.
- No color gradients.
- Project colors are contextual information, not decoration.
- System controls/icons remain monochrome unless a project identity is being communicated.

### 2. Project identity

Each project owns two independent choices:

- `icon`: one of 32 curated project symbols;
- `color`: one solid project color token.

No semantic coupling is allowed. A project called “Estudios” is not forced to blue, green or any other color.

Project identity propagates visually through:

`Project → Task → Subtask → Focus session → Agenda → Progress`

Color should appear in small, informative doses: icon, dot, line, progress bar, calendar event, chart mark and heatmap cell. Main text and controls remain neutral.

### 3. Secondary color system

The project palette is multicolor and solid: green, blue, teal, red/coral, violet/plum and amber/yellow families. Colors must be vivid enough to differentiate data without becoming neon, pastel or decorative.

The yellow family must avoid alert-like brightness. Current preferred direction:

- Amber soft: `#D6A23A`
- Dark/contrast companion: approximately `#B98224`

Final tokens should be normalized as named project-color IDs rather than arbitrary persisted hex strings so Light/Dark rendering can evolve without rewriting stored projects.

### 4. Work hierarchy

Maximum hierarchy is exactly three levels:

`Project → Task → Subtask`

No subtask nesting.

Subtasks:

- have stable IDs;
- can be added inline from an expanded task;
- can be completed independently;
- show progress `completed/total`;
- persist offline;
- remain compatible with recurring/duplicated tasks.

The core model already stores `Task.subtasks`; the closeout should extend the existing domain rather than introduce a second hierarchy.

### 5. Task disclosure

Project task rows become collapsible disclosures.

Collapsed task: title + useful metadata + subtask progress.

Expanded task: relevant detail + subtask list + inline `+ Añadir subtarea`.

Expansion state is UI state, not persisted business data.

### 6. Navigation

Remove the small top-left hamburger as the main navigation affordance and remove the persistent bottom navigation bar.

Approved direction:

- a discreet, thumb-accessible floating/current-section capsule;
- tapping it opens a premium navigation sheet;
- main destinations remain immediately understandable;
- secondary destinations live in the sheet without cluttering every screen;
- horizontal swipe may be an optional shortcut, never the only navigation path;
- the control must contract/move/hide when it conflicts with keyboard, sheets, immersive focus or critical content;
- Expo Router remains the routing source of truth.

### 7. Agenda correctness

#### Calendar → Day

Physical Samsung review proves the current manual two-`onPress` detector is not reliable enough.

Required behavior:

- one tap selects a date;
- same-date double tap opens Day for that exact date;
- different-date taps cannot accidentally open Day;
- reduced motion is respected;
- behavior must have a testable timing/state contract rather than only source-regex assertions.

Do not add a new native dependency solely for double tap unless strictly necessary.

#### “Todo cuenta”

The configured workday is the plan, not a limit on history.

Real focus sessions before/after configured hours remain visible. The existing dynamic timeline expansion is preserved, but the Day UI must make Plan vs Real and out-of-hours activity understandable without adding noisy explanatory text.

### 8. Focus correctness

The intended tools are:

- Pomodoro;
- Temporizador;
- Cronómetro.

The remote B4.3E source already contains all three, but the Samsung preview showed only two. Before merge, closeout must eliminate the ambiguity between source and runtime. Add a lightweight dev/runtime fingerprint or equivalent diagnostic that makes stale bundle/runtime mismatches observable without turning the user into a terminal operator.

Do not redesign the successful visual composition of Enfoque beyond what is necessary for correctness and consistency.

### 9. Lists and routines

- Lists stay structurally almost unchanged.
- Routines keep their current recurrence model.
- Improve routine discoverability/copy only enough to make “template that creates recurring task occurrences” understandable.

### 10. Interaction guardrails

- No routine navigation haptics.
- Haptics only for meaningful actions.
- Restrained motion, no bounce/gimmicks.
- Respect reduced motion.
- Preserve keyboard-safe sheets and Android safe areas.
- No mascot, confetti, 3D cards, excessive glow or decorative animation.

## Delivery slices

### C1 — Physical correctness

1. Replace fragile Calendar double-tap behavior with a testable interaction state machine and reliable Samsung-friendly timing.
2. Add runtime/bundle observability and prove the Focus route exposes all three modes from the current bundle.
3. Clarify Plan vs Real/out-of-hours in Agenda without changing session persistence.

### C2 — Project hierarchy and identity data

1. Reuse existing `Subtask` domain and expose missing inline task/subtask interactions.
2. Expand `ProjectIcon` to the curated 32-icon set.
3. Add a named `ProjectColor` token to `Project` through backward-compatible hydration/migration.
4. Preserve existing project IDs and assign deterministic defaults to legacy projects.

### C3 — Navigation replacement

1. Build current-section capsule.
2. Build navigation sheet.
3. Move primary navigation off the persistent bottom bar without breaking routing, keyboard, sheets or immersive focus.
4. Keep optional swipe as enhancement only if it remains predictable and accessible.

### C4 — Contextual color and visual cleanup

1. Remove remaining orange/global gradient usage.
2. Apply project color selectively to project identity, task context, sessions, Agenda and Progress.
3. Keep overall surfaces/text/control hierarchy monochrome.
4. Preserve Lists and successful Focus composition.

## Validation policy

Every slice follows:

`RED reproducible → minimal implementation → GREEN → typecheck → lint → Expo Doctor → Android bundle`

Physical Samsung review is deferred to meaningful integrated checkpoints, not every commit.

## Merge policy

- Do not merge stacked PRs `#22 → #25` during closeout development.
- Closeout work starts from B4.3E head so it sees the complete accumulated product.
- Final integration order must be chosen only after CI-green closeout and a faithful Samsung runtime are available.
