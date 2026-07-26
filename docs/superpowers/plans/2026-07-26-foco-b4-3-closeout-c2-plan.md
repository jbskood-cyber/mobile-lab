# FOCO B4.3 Closeout C2 — Project Hierarchy & Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make project identity durable and user-chosen (`name + icon + color`) while exposing the already-existing `Task.subtasks` domain as a clean three-level `Project → Task → Subtask` interaction.

**Architecture:** Reuse the current FocoState v3 model and migration pipeline. Add a named project-color token ID (never persisted raw hex), expand `ProjectIcon` to 32 curated values, and keep legacy project IDs intact through deterministic defaults. Subtasks remain embedded in `Task`; C2 adds disclosure UI and inline add/toggle/delete interactions rather than a second hierarchy.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript 5.9, Expo Router, `expo-sqlite/kv-store`, existing `FocoStore`, `FocoIcon`, `FocoSheet`, node:test core tests.

## Global Constraints

- Base ancestry is the CI-green B4.3 closeout C1 branch `feature/foco-b4-3-closeout` stacked on B4.3E.
- Do not merge PRs `#22 → #25` or PR #26 during C2.
- Preserve existing project/task/session/routine IDs and existing `foco:state:v3` data.
- Do not persist arbitrary hex strings. Persist a named `ProjectColor` token ID.
- Base FOCO UI remains black/white/grays; project color is contextual data only.
- Project icon and project color are independent choices.
- Exactly 32 curated project icons; no user-uploaded icon assets in C2.
- Maximum work hierarchy is exactly `Project → Task → Subtask`; no nested subtasks.
- Reuse existing `Subtask` fields and existing `addSubtask`, `toggleSubtask`, `deleteSubtask` store APIs.
- Expansion/collapse state is UI-only and must not be persisted.
- TDD: RED → minimal implementation → GREEN → typecheck → lint → Expo Doctor → Android bundle.

---

### Task 1: Add backward-compatible named project color identity

**Files:**
- Modify: `src/core/model.ts`
- Modify: `src/core/migration.ts`
- Modify: `src/core/FocoStore.tsx`
- Modify: `tests/product-model-v2.test.cjs`
- Modify: `tests/hydration.test.cjs`

**Interfaces:**
- Produces: `ProjectColor` union and `PROJECT_COLOR_IDS` readonly catalog.
- Extends: `Project` with `color: ProjectColor`.
- Extends: `addProject(name, icon?, color?)` and `updateProject(... color ...)`.
- Persists token IDs only; C4 maps IDs to Light/Dark hex tokens.

Use this stable token-ID catalog for storage:

```ts
export const PROJECT_COLOR_IDS = [
  'emerald', 'eucalyptus', 'lime', 'teal', 'cyan',
  'pacific', 'electricBlue', 'cobalt', 'indigo', 'navy',
  'crimson', 'coral', 'mandarin', 'terracotta', 'amber',
  'violet', 'iris', 'purple', 'orchid', 'raspberry', 'fuchsia',
] as const;
export type ProjectColor = typeof PROJECT_COLOR_IDS[number];
```

`amber` is the approved softer yellow family; C4 renders its Light value as `#D6A23A` and may use approximately `#B98224` where dark-mode contrast requires it.

- [ ] **Step 1: Write failing model/migration tests**

Add behavior tests that prove:

```js
const legacy = createInitialState(1_000);
delete legacy.projects[0].color;
const migrated = migrateState(legacy, 2_000);
assert.equal(typeof migrated.projects[0].color, 'string');
assert.ok(PROJECT_COLOR_IDS.includes(migrated.projects[0].color));
assert.equal(migrated.projects[0].id, legacy.projects[0].id);
```

Also prove an invalid persisted color normalizes to a valid deterministic default and a valid persisted color survives unchanged.

- [ ] **Step 2: Run RED**

Run: `npm test`
Expected: FAIL because `ProjectColor`/`color` do not exist.

- [ ] **Step 3: Implement minimal model and migration**

Add `color` to `Project`; add `normalizeProjectColor(value, fallbackIndex)` that returns valid IDs from `PROJECT_COLOR_IDS`, using deterministic modulo fallback. Seed projects get deterministic distinct IDs. `migrateProject` must preserve valid colors and assign fallback only when missing/invalid.

Do **not** bump `FocoState.version`: `migrateState` already normalizes every stored state on hydration and can enrich v3 records in place.

- [ ] **Step 4: Extend store API**

Change signatures to:

```ts
addProject: (name: string, icon?: ProjectIcon, color?: ProjectColor) => Project | null;
updateProject: (
  projectId: string,
  patch: Partial<Pick<Project, 'name' | 'icon' | 'color' | 'description' | 'archived' | 'sortOrder'>>,
) => void;
```

and mirror them in `model.addProject` / `model.updateProject`.

- [ ] **Step 5: Run GREEN**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: persist independent project color identity`

---

### Task 2: Expand the project icon catalog to exactly 32 curated symbols

**Files:**
- Modify: `src/core/model.ts`
- Modify: `src/core/migration.ts`
- Modify: `src/ui/FocoIcon.tsx`
- Modify: `src/features/projects/ProjectEditorSheet.tsx`
- Modify: `tests/project-v2.test.cjs`

**Interfaces:**
- Produces: `PROJECT_ICON_IDS` readonly 32-value catalog.
- `ProjectIcon` derives from the catalog.
- Existing six values remain valid to preserve all stored projects.

Use this catalog:

```ts
export const PROJECT_ICON_IDS = [
  'briefcase', 'book', 'heart', 'grid', 'bulb', 'archive',
  'folder', 'home', 'target', 'star', 'calendar', 'clock',
  'bars', 'checklist', 'note', 'flame',
  'dumbbell', 'bicycle', 'leaf', 'graduationCap',
  'microscope', 'atom', 'code', 'laptop',
  'camera', 'music', 'palette', 'airplane',
  'wallet', 'coin', 'users', 'trophy',
] as const;
```

- [ ] **Step 1: Write failing catalog test**

Assert exact count 32, uniqueness, presence of all six legacy values, and that every project icon ID is accepted by `FocoIcon`.

- [ ] **Step 2: Run RED**

Run: `npm test`
Expected: FAIL because catalog/new icon renderers are absent.

- [ ] **Step 3: Implement catalog and icon renderers**

Keep the existing professional Phosphor-backed system icons. Add only the missing project symbols behind the existing `FocoIcon` API; do not expose a third-party component API to feature code.

- [ ] **Step 4: Replace local six-item editor list**

`ProjectEditorSheet` must import `PROJECT_ICON_IDS` rather than declaring its own catalog. Render a compact wrapping grid rather than an unbounded horizontal six-item strip.

- [ ] **Step 5: Run GREEN**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: expand project icon choices`

---

### Task 3: Add independent color selection to ProjectEditorSheet

**Files:**
- Create: `src/ui/projectColors.ts`
- Modify: `src/features/projects/ProjectEditorSheet.tsx`
- Modify: `tests/project-v2.test.cjs`

**Interfaces:**
- Produces: `getProjectColorPreview(id, appearance?)` for editor-only preview.
- C2 preview values are temporary renderer tokens; C4 owns final application across the product.
- `amber` Light preview is exactly `#D6A23A`.

- [ ] **Step 1: Write failing editor contract**

Require `ProjectEditorSheet` to maintain separate `icon` and `color` state, initialize both from an edited project, and save both independently. Test that changing icon does not mutate color and changing color does not mutate icon.

- [ ] **Step 2: Run RED**

Run: `npm test`
Expected: FAIL because editor has no color control.

- [ ] **Step 3: Implement minimal selector**

Layout order:

1. `NOMBRE`
2. `DESCRIPCIÓN`
3. `COLOR`
4. `ICONO`

Color selector is a horizontal/wrapping set of solid circular or rounded swatches with accessibility labels; selected state uses border/check, never a gradient. Icon selector remains monochrome inside the editor except selected preview may use the chosen project color.

- [ ] **Step 4: Run GREEN**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit: `feat: choose project color independently`

---

### Task 4: Turn project task rows into UI-only disclosures

**Files:**
- Create: `src/features/projects/ProjectTaskDisclosure.tsx`
- Modify: `src/features/projects/ProjectDetailScreen.tsx`
- Test: `tests/project-v2.test.cjs`

**Interfaces:**
- Consumes: existing `Task`, `addSubtask`, `toggleSubtask`, `deleteSubtask`.
- Produces UI prop contract:

```ts
type ProjectTaskDisclosureProps = {
  task: Task;
  projectName: string;
  completedPomodoros: number;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  onOpenTask: () => void;
  onToggleTask: () => void;
  onAddSubtask: (title: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
};
```

- [ ] **Step 1: Write failing disclosure contract**

Test source behavior/invariants:
- collapsed row shows subtask progress when `total > 0`;
- disclosure toggle is distinct from opening task detail;
- expanded content renders existing subtasks;
- expanded content includes inline `+ Añadir subtarea`;
- no recursive `ProjectTaskDisclosure` rendering.

- [ ] **Step 2: Run RED**

Run: `npm test`
Expected: FAIL because disclosure component is absent.

- [ ] **Step 3: Implement minimal disclosure**

Collapsed state remains visually close to current `TaskRow`. Expanded state adds one indented subtask region below the row, not a nested card stack. Keep main task checkbox independent from disclosure arrow.

- [ ] **Step 4: Wire ProjectDetailScreen**

Maintain expansion as:

```ts
const [expandedTaskIds, setExpandedTaskIds] = useState<Set<string>>(() => new Set());
```

Do not write expansion state to `FocoState`.

- [ ] **Step 5: Run GREEN**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: expand project tasks inline`

---

### Task 5: Add fast inline subtask creation and completion

**Files:**
- Modify: `src/features/projects/ProjectTaskDisclosure.tsx`
- Modify: `src/features/projects/ProjectDetailScreen.tsx`
- Test: `tests/project-v2.test.cjs`

**Interfaces:**
- Reuses store APIs already present in `FocoStore`: `addSubtask`, `toggleSubtask`, `deleteSubtask`.
- No new persisted schema.

- [ ] **Step 1: Write failing interaction contract**

Require:
- tapping `+ Añadir subtarea` reveals one compact inline text input;
- empty/whitespace submit does nothing;
- valid submit calls `onAddSubtask(trimmedTitle)` and clears/closes input;
- each subtask has an independent checkbox;
- delete is accessible but visually secondary;
- `completed/total` updates from task data, not local counters.

- [ ] **Step 2: Run RED**

Run: `npm test`
Expected: FAIL on inline interaction contract.

- [ ] **Step 3: Implement minimal interaction**

Use one text input inside the expanded disclosure. `submitEditing` and a compact plus/check action both submit. Do not open a sheet just to add a subtask.

- [ ] **Step 4: Wire store callbacks**

`ProjectDetailScreen` reads `addSubtask`, `toggleSubtask`, `deleteSubtask` from `useFocoStore` and passes stable task/subtask IDs.

- [ ] **Step 5: Run GREEN**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 6: Commit**

Commit: `feat: manage subtasks inside project tasks`

---

### Task 6: Verify recurrence/duplication compatibility and full C2 gate

**Files:**
- Modify only tests if coverage gaps are found: `tests/product-model-v2.test.cjs`, `tests/project-v2.test.cjs`, `tests/hydration.test.cjs`

- [ ] **Step 1: Prove subtask identity rules**

Behavior tests must confirm:
- duplicate task receives new subtask IDs and resets subtask completion;
- generated recurring occurrence receives new subtask IDs and resets completion;
- legacy hydrated subtasks preserve existing IDs when present;
- project color/icon changes do not mutate task/session IDs or historical session records.

- [ ] **Step 2: Run full gate**

```bash
npm ci
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android
```

Expected: all PASS.

- [ ] **Step 3: Diff scope audit**

C2 may touch only model/migration/store, icon/color identity primitives, project editor/detail task disclosure, targeted tests and this plan. No navigation replacement and no broad contextual-color rollout yet.

- [ ] **Step 4: Keep PR #26 draft**

Do not merge. C3 navigation starts only from a CI-green C2 head.
