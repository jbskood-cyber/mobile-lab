# FOCO B4.3 Post-Review Closure — Design Specification

## Purpose

This specification closes the gap between the technically green B4.3 stack and the physical Samsung review. It does not replace the B4.3 architecture. It defines the smallest coherent closure layer needed before the stacked PR chain can be integrated.

Canonical technical ancestry at specification time:

- `main`: `ce3748a7eda1afde5e9f526912bc7e34fdaf17b0` — B4.3A merged.
- PR #22 / B4.3B: `6f1f3771c5420839b7e06e2889bf1958456fd5c1`.
- PR #23 / B4.3C: `8ee40f165dd664d6913e34973bc3c5624765fa59`.
- PR #24 / B4.3D: `7da186d45aea16682166dc9da40c97527fbbf65d`.
- PR #25 / B4.3E: `464122c3d46ae945e551b7efb3f99b2efda2a15f`.
- This design branch starts from PR #25 head. None of #22→#25 may be merged merely because this document exists.

The product remains Android-first, Expo SDK 54, React Native, Expo Router, offline-first, local-first, and Development Build based.

---

## 1. Product principles frozen by the physical review

### 1.1 Visual identity

FOCO’s base interface is monochrome:

- black;
- white;
- neutral grays.

Orange is no longer the global product accent. Color gradients are prohibited.

Color has one job: encode user-owned context. It identifies projects and allows recorded time to be recognized across task lists, Agenda, focus sessions, Progreso, charts, heatmaps, and recent-session history.

Large decorative color surfaces are out of scope. Project color should appear in restrained carriers such as an icon, dot, short rule, progress line, event edge, chart mark, or compact badge.

### 1.2 Project identity

Each project owns three independent user choices:

1. name;
2. icon;
3. color.

No semantic coupling is allowed. “Estudios” is not automatically blue; “Salud” is not automatically green. A project may combine any supported icon with any supported color.

The project icon catalog contains exactly 32 curated choices. System/navigation icons remain monochrome and are not part of the project identity catalog.

### 1.3 Work hierarchy

The maximum hierarchy is exactly:

`Proyecto → Tarea → Subtarea`

No fourth level and no recursive nesting.

A task is collapsible. When expanded it may expose metadata, first step, subtask progress, subtask rows, and an inline `+ Añadir subtarea` action.

Subtasks are individually completable and persistent.

### 1.4 Navigation

FOCO will not use:

- a persistent bottom tab bar;
- a small hamburger button in the upper-left as the primary global navigation mechanism.

The approved direction is a compact floating section control/capsule placed in a thumb-reachable area without obscuring primary actions. It displays the current section. Activating it opens a premium navigation sheet.

The sheet exposes primary sections first and secondary destinations second. Horizontal swipe between primary sections may be added as a shortcut, but never as the only discoverable navigation path.

The floating control must yield to keyboard, modal/sheet, focus-immersive, and other constrained states. It may collapse or move when scrolling if needed, but navigation must remain recoverable.

### 1.5 Agenda truthfulness

The configured workday is the user’s plan, not a visibility boundary.

Real recorded focus time before or after the configured window must remain visible. The existing dynamic range expansion is preserved, but the interface must make the plan-vs-reality relationship understandable.

The monthly calendar interaction contract is:

- single tap: select the date;
- double tap: select that exact date and open `Día` for that exact date.

The current manual 280 ms two-press detector failed on Samsung and must be replaced by a robust gesture implementation.

### 1.6 Enfoque

The visual direction of Enfoque is retained.

The three required modes are:

- Pomodoro;
- Temporizador;
- Cronómetro.

The source at B4.3E already contains the three-mode selector. The physical two-mode preview is therefore treated as a runtime/bundle/cache integrity problem until proven otherwise, not as a reason to rewrite Enfoque.

### 1.7 Scope discipline

Lists remain largely unchanged.

Rutinas receive only discoverability/copy improvements sufficient to communicate that a routine is a reusable recurring task template.

No mascot, confetti loop, 3D card language, excessive glow, decorative motion, unrelated B5 work, new backend, authentication, payments, or cloud synchronization is introduced here.

---

## 2. Current code reality and reuse decisions

The closure must reuse what already exists rather than rebuild it.

### 2.1 Subtasks already exist in the core

`src/core/model.ts` already defines:

- `Subtask` with `id`, `title`, `completed`, timestamps;
- `Task.subtasks: Subtask[]`;
- task creation normalization for string/subtask inputs;
- `addSubtask`;
- `toggleSubtask`;
- `deleteSubtask`;
- recurrence/duplication logic that preserves subtask shape.

Therefore the requested Proyecto → Tarea → Subtarea hierarchy is primarily a UI/discoverability and integration task, not a new recursive data model.

No new subtask nesting field is permitted.

### 2.2 Focus modes already exist in the core

`FocusMode` already includes `pomodoro | timer | stopwatch` at B4.3E.

The closure must verify runtime identity before changing domain code.

### 2.3 Project identity is incomplete

At B4.3E:

- `ProjectIcon` contains only six choices;
- `Project` has `icon` but no project color field.

The closure extends project identity without changing project IDs or breaking existing persisted projects.

---

## 3. Persistence and compatibility contract

### 3.1 No destructive migration

Existing user data must survive unchanged:

- project IDs;
- task IDs;
- subtask IDs;
- routine IDs;
- session IDs;
- focus history;
- reminders/notification IDs;
- ordering;
- completion state.

The closure must not clear storage, reset `FocoState`, or regenerate seeded IDs.

### 3.2 Project icon compatibility

`ProjectIcon` expands from the existing six values to the approved 32-value catalog.

The six existing identifiers remain valid forever so persisted projects do not require icon remapping.

New icon values must be stable string identifiers, not library-internal component names. Rendering maps those stable identifiers to the current icon implementation.

### 3.3 Project color compatibility

Project color is stored as a stable semantic color identifier, not a raw arbitrary hex on each project.

The semantic IDs for the first palette version are frozen as:

```ts
export type ProjectColorId = 'green' | 'blue' | 'coral' | 'violet' | 'teal' | 'amber';
```

The exact green, blue, coral, violet, and teal token values are an external product input: they must be copied verbatim from the user-approved palette catalog before Slice C begins. The implementation must not invent or approximate them.

The amber family is already fixed in direction: `#D6A23A` is the base/light candidate. `#B98224` is the current darker companion candidate and may move only as much as required by measured dark-mode/contrast validation.

Existing persisted projects have no color. They must render through a deterministic fallback resolver until explicitly edited. The resolver must not mutate storage merely by reading it.

A project that is created or edited after this feature ships stores an explicit `ProjectColorId`.

This allows backward compatibility without renumbering IDs or forcing a whole-state destructive migration.

### 3.4 Subtask compatibility

No schema expansion is required for the three-level hierarchy. Existing `Task.subtasks` is the canonical storage location.

UI collapse/expand state is ephemeral presentation state and must not be persisted into `Task` unless later product evidence shows a real need.

---

## 4. 32-icon project catalog

The catalog is curated, finite, and stable. It covers broad user intent without pretending to understand what a project means.

The catalog contains exactly these 32 semantic slots, mapped to the closest coherent Phosphor-style glyph already compatible with FOCO’s icon language:

1. briefcase
2. book
3. heart
4. grid
5. bulb
6. archive
7. house
8. dumbbell
9. running
10. bicycle
11. wallet
12. coins
13. chart
14. target
15. flag
16. star
17. trophy
18. code
19. terminal
20. laptop
21. atom
22. flask
23. microscope
24. notebook
25. pencil
26. camera
27. music
28. palette
29. plane
30. leaf
31. mountain
32. folder

Existing identifiers occupy the same semantic meaning they have today. The catalog is presented as icon-only choices with accessible labels; icon selection and color selection are separate controls.

---

## 5. Project color behavior across FOCO

### 5.1 New/Edit Project

The project editor presents:

- name;
- optional description;
- color selector;
- icon selector.

Color and icon are visually and semantically independent.

The primary create/save action remains monochrome/black. Choosing a green project must not turn the global save button green.

### 5.2 Project lists/details

Project rows use the chosen color on the project icon and a restrained local indicator. Text remains neutral.

Project detail may use the project color for the project icon, progress accent, and small hierarchy markers, not for large background fills.

### 5.3 Tasks and subtasks

A task inherits its project identity for display only; task storage continues to reference `projectId`.

Subtasks inherit the parent task/project context. They do not choose separate project colors or icons.

### 5.4 Agenda

Planned task events and real session events use project color as an identifying accent.

Real work remains visually distinguishable from planned work through structure/label/stroke/fill treatment, not by inventing separate semantic colors that conflict with project identity.

### 5.5 Progreso

Project-linked charts resolve colors from `projectId`.

Empty/neutral chart states remain gray. The interface chrome remains monochrome.

Heatmaps must encode intensity in a way that remains readable when multiple project colors occur on the same time range; do not imply a false project if a cell aggregates multiple projects. When aggregation cannot truthfully map to one project, use a neutral/intensity treatment and expose project breakdown elsewhere.

---

## 6. Task expansion and subtask UX

Task rows gain one consistent disclosure control.

Collapsed task:

- completion control;
- title;
- essential metadata;
- subtask progress when non-empty, e.g. `2/3`;
- disclosure affordance.

Expanded task adds:

- existing optional details/first step where relevant;
- `Subtareas` heading with `completed/total`;
- subtask rows;
- inline `+ Añadir subtarea`;
- delete/edit affordances only where they do not overload the row.

Adding a subtask should require title entry and one confirm action, with sensible keyboard handling. No full-screen editor is required for a simple subtask.

Completing a subtask updates only that subtask. Completing all subtasks must not automatically complete the parent task unless product policy explicitly changes in a future block.

Completing the parent task keeps the existing completion semantics; subtask state is preserved in history/duplication according to current core behavior.

---

## 7. Navigation interaction design

### 7.1 Primary destinations

The global navigation sheet exposes these primary product areas:

- Hoy
- Agenda
- Enfoque
- Proyectos
- Progreso

Secondary destinations are exposed in a separate visual group:

- Listas
- Rutinas
- Preferencias/Ajustes and other existing secondary routes as applicable.

The sheet must derive destinations from the real route set; it must not create duplicate parallel screens.

### 7.2 Floating section control

The floating control:

- shows current section icon + label;
- has a thumb-friendly hit target;
- uses black/white/gray chrome;
- does not adopt the current project color;
- opens the navigation sheet;
- hides during modal sheets, keyboard-constrained editing, and focus-immersive states;
- avoids covering floating create actions or essential bottom content;
- respects safe areas.

### 7.3 Transition policy

Primary section changes use the restrained motion foundation already introduced in B4.3A/B.

No routine navigation haptic is reintroduced.

Reduced motion converts movement to an immediate or minimal fade state.

---

## 8. Agenda closure details

### 8.1 Double tap

The manual `Date.now()` / `useRef` threshold implementation is removed.

Use a gesture recognizer capable of distinguishing one tap from two taps and resolving them exclusively so the first tap of a double-tap does not prematurely trigger an incompatible navigation state.

The behavior must be unit/contract tested and later physically verified on Samsung.

### 8.2 Plan vs Real

The day view should explicitly label planned vs recorded time where ambiguity exists.

Existing dynamic start/end-hour expansion remains the source of truth for visible real sessions outside the configured day.

When work exists outside the planned range, the user must be able to see that the timeline extended because real work occurred. This should be communicated with concise copy/markers, not a permanent explanatory paragraph.

---

## 9. Runtime integrity gate for Enfoque

Before changing focus-mode UI, establish a runtime identity check that can answer: “Is the Samsung showing the JS bundle produced by this HEAD?”

The check should be development-only and must not leak into release product UI.

Acceptable evidence can be a development build fingerprint derived from the current source/commit or another deterministic dev-only marker visible in logs/diagnostics.

Only after runtime identity is confirmed may a remaining two-mode UI be treated as a real source bug.

The three-mode source contract stays covered by automated tests.

---

## 10. Rutinas clarity

Rutinas remains a recurring-template system.

The closure improves clarity through concise copy and labels only:

- explain once that a routine creates/reuses recurring task structure;
- rename ambiguous controls if necessary;
- preserve pause and manual-generate behavior;
- do not create a second task engine.

---

## 11. Implementation slices and gates

Implementation is split into independently reviewable slices:

### Slice A — Physical correctness

- robust Calendar double-tap;
- dev-only runtime identity/fingerprint;
- verify three focus modes against the correct bundle;
- clarify out-of-hours Plan vs Real without redesigning Agenda.

Gate: automated green. Physical Samsung review is deferred until an integrated checkpoint, unless runtime identity itself cannot be established without the device.

### Slice B — Task/subtask discoverability

- collapsible task rows;
- inline subtask addition;
- individual completion;
- progress count;
- reuse existing core subtask functions.

Gate: automated green; no state-version change.

### Slice C — Project identity domain

- 32 stable icon identifiers;
- semantic project color identifier;
- backward-compatible fallback resolver;
- create/edit support;
- no arbitrary hex storage.

Gate: exact final green/blue/coral/violet/teal values must already be recorded from the user-approved palette catalog before this slice is implemented. Do not invent missing color values.

### Slice D — Navigation replacement

- floating current-section control;
- premium navigation sheet;
- remove persistent bottom navigation and hamburger-primary dependency;
- preserve route architecture, overlays, keyboard behavior, safe areas, focus immersion, reduced motion.

Gate: automated green plus integrated physical review later.

### Slice E — Contextual color propagation and visual cleanup

- remove remaining orange-as-brand usages and color gradients;
- apply project color to project/task/session/Agenda/Progreso carriers;
- preserve neutral global chrome;
- Lists receives only consistency changes;
- Rutinas receives concise discoverability improvements.

Gate: automated green followed by one integrated Samsung product review.

---

## 12. Testing contract

Every implementation slice follows RED → minimal implementation → GREEN.

Required final automated validation for each product-changing checkpoint:

- unit/contract tests;
- `npm run typecheck`;
- `npm run lint`;
- Expo Doctor;
- Android bundle/export validation used by the existing CI.

Regression tests must cover at minimum:

- single tap selects month date;
- double tap opens exact day;
- out-of-hours real sessions affect timeline range;
- Focus selector still contains three modes;
- legacy six project icon identifiers remain valid;
- all 32 icon IDs resolve to renderable icons;
- legacy project without explicit color resolves deterministically;
- new project stores icon and color independently;
- task subtask progress is derived correctly;
- add/toggle/delete subtask preserves parent/project IDs;
- global navigation remains reachable when bottom tabs are absent;
- global navigation hides/restores correctly around sheets, keyboard, and focus immersion;
- no routine tab-navigation haptic returns;
- no prohibited color gradient or global orange brand token remains in migrated product surfaces.

Physical review is one integrated checkpoint, not a sequence of micro-reviews.

---

## 13. Integration strategy

Do not merge #22→#25 yet.

The closure work is stacked from `464122c3d46ae945e551b7efb3f99b2efda2a15f` so it can validate against the complete B4.3 behavior.

After all closure slices are green and the integrated Samsung review passes, choose the safest Git history strategy to land the complete chain in order without dropping ancestry. Re-check diffs against `main` before every merge/retarget operation.

No force push.

---

## 14. Definition of done

B4.3 can close only when all of the following are true:

- Samsung is confirmed to be running the intended integrated HEAD;
- Calendario double tap opens the exact Día reliably;
- real out-of-hours focus is visibly accounted for;
- Enfoque shows Pomodoro, Temporizador, Cronómetro;
- task rows support a clear Proyecto → Tarea → Subtarea experience using the existing subtask core;
- projects can independently choose from 32 icons and the approved color registry;
- project identity propagates truthfully into recorded-time surfaces;
- global chrome is black/white/gray with no orange as primary identity and no color gradients;
- the persistent bottom tab bar and primary hamburger navigation are replaced by the approved floating section control + navigation sheet;
- Lists remains stable;
- Rutinas is understandable without becoming more complex;
- tests, typecheck, lint, Expo Doctor, Android bundle/export are green;
- one integrated physical Samsung review passes;
- the stacked PR chain is integrated safely only after that evidence exists.
