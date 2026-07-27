# FOCO B4.3F3 Project Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every project an independently persisted solid color token and one of 32 curated icons without breaking FocoState v3 or existing user data.

**Architecture:** Keep project identity additive inside the existing `Project` record. `migration.ts` becomes the normalization boundary for legacy/malformed project identity; `FocoStore` exposes color alongside icon; `ProjectEditorSheet` owns independent color/icon selection; `FocoIcon` resolves the expanded curated icon set. F5 will propagate project color into Agenda/Progreso; F3 only establishes correct persisted identity and project-facing UI.

**Tech Stack:** React Native 0.81, Expo SDK 54, TypeScript 5.9, Expo Router, react-native-svg, Node test runner, existing FocoStore/FocoSheet/FocoIcon.

## Global Constraints

- Keep `FocoState.version = 3`; this is additive hydration normalization, not a destructive migration.
- Preserve all existing project/task/session/routine IDs and existing project icon choices.
- Project color persists as token ID, never arbitrary user HEX.
- Icon and color choices are independent.
- Exactly 32 curated project icon IDs.
- System/navigation icons remain monochrome.
- FOCO base UI remains black/white/gray; project color is contextual data.
- No new package/native dependency.
- No merge of #22→#25 and no work on `main`.

---

### Task 1: Characterize and extend the project identity domain

**Files:**
- Create: `tests/project-identity.test.cjs`
- Modify: `src/core/model.ts`
- Modify: `src/core/migration.ts`
- Test: `tests/project-identity.test.cjs`

**Interfaces:**
- Produces: `ProjectColor`, `PROJECT_COLOR_IDS`, `PROJECT_ICON_IDS`, `defaultProjectColor(index)`, `isProjectColor(value)`, `isProjectIcon(value)`.
- Changes `Project` to include `color: ProjectColor`.
- Changes `addProject` and `updateProject` to accept/preserve project color.

- [ ] **Step 1: Write the failing domain test**

Create `tests/project-identity.test.cjs` that imports the compiled model/migration modules and asserts:

```js
assert.equal(PROJECT_ICON_IDS.length, 32);
assert.equal(new Set(PROJECT_ICON_IDS).size, 32);
assert.equal(PROJECT_COLOR_IDS.length, 12);

const initial = createInitialState(now);
assert.ok(initial.projects.every((project) => PROJECT_COLOR_IDS.includes(project.color)));

const migrated = migrateState({
  version: 3,
  projects: [{ id: 'legacy', name: 'Legacy', icon: 'book', archived: false, sortOrder: 2, createdAt: now, updatedAt: now }],
  tasks: [], sessions: [], routines: [], preferences: initial.preferences, planning: initial.planning, appearance: 'light',
}, now);
assert.equal(migrated.projects[0].id, 'legacy');
assert.equal(migrated.projects[0].icon, 'book');
assert.equal(migrated.projects[0].color, defaultProjectColor(2));

const malformed = migrateState({
  ...migrated,
  projects: [{ ...migrated.projects[0], icon: 'not-real', color: 'not-real' }],
}, now);
assert.equal(malformed.projects[0].icon, 'grid');
assert.equal(malformed.projects[0].color, defaultProjectColor(2));
```

Also assert that `addProject` can create a project with independent `icon='atom'` and `color='cobalt'`, and `updateProject` can change only color without changing icon.

- [ ] **Step 2: Run the test and verify RED**

Run: `npm test`

Expected: FAIL because project-color exports, 32-icon catalog, and `Project.color` do not exist yet.

- [ ] **Step 3: Implement the minimal model contract**

In `src/core/model.ts`:

```ts
export const PROJECT_ICON_IDS = [
  'briefcase','book','heart','grid','bulb','archive','home','calendar',
  'target','star','note','checklist','flame','clock','folder','bars',
  'graduation-cap','atom','dumbbell','bicycle','code','laptop','coin','wallet',
  'camera','music-note','palette','airplane','leaf','mountain','trophy','users',
] as const;
export type ProjectIcon = (typeof PROJECT_ICON_IDS)[number];

export const PROJECT_COLOR_IDS = [
  'emerald','eucalyptus','lime','turquoise','pacific','electric-blue',
  'indigo','crimson','coral','amber-soft','violet','plum',
] as const;
export type ProjectColor = (typeof PROJECT_COLOR_IDS)[number];

export function defaultProjectColor(index: number): ProjectColor {
  return PROJECT_COLOR_IDS[Math.abs(Math.trunc(index)) % PROJECT_COLOR_IDS.length] ?? 'emerald';
}
```

Add `color: ProjectColor` to `Project`. Seed existing demo projects deterministically by index. Extend `addProject` with an optional color argument while keeping existing callers source-compatible, and allow `updateProject` to patch `color`.

- [ ] **Step 4: Normalize legacy project identity in migration**

In `src/core/migration.ts`, treat incoming icon/color as unknown strings and validate with `isProjectIcon` / `isProjectColor`. `migrateProject` must preserve valid legacy icon/color and fall back to `grid` plus `defaultProjectColor(sortOrder)` for missing/invalid values.

- [ ] **Step 5: Run full validation and verify GREEN**

Run: `npm test && npm run typecheck && npm run lint && npx expo-doctor && npx expo export --platform android --output-dir /tmp/foco-f3-domain-export`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/core/model.ts src/core/migration.ts tests/project-identity.test.cjs
git commit -m "feat: persist project identity tokens"
```

---

### Task 2: Resolve all 32 project icons through FocoIcon

**Files:**
- Modify: `src/ui/FocoIcon.tsx`
- Modify: `tests/project-identity.test.cjs`

**Interfaces:**
- Consumes: `PROJECT_ICON_IDS` from `src/core/model.ts` only in tests; product code continues to pass typed icon names.
- Produces: every `ProjectIcon` value is accepted by `FocoIcon` and renders a non-empty SVG shape.

- [ ] **Step 1: Extend the failing UI-source contract test**

Add a test that reads `src/ui/FocoIcon.tsx` and verifies all 32 project icon literals are represented in `IconName` or project-icon rendering logic. Explicitly require the 16 new IDs that are not already present in the current icon API:

```js
for (const icon of ['graduation-cap','atom','dumbbell','bicycle','code','laptop','coin','wallet','camera','music-note','palette','airplane','leaf','mountain','trophy','users']) {
  assert.ok(source.includes(`'${icon}'`) || source.includes(`name === '${icon}'`), `${icon} must resolve`);
}
```

- [ ] **Step 2: Run `npm test` and verify RED**

Expected: FAIL on missing project icon resolutions.

- [ ] **Step 3: Implement the missing icon shapes**

Extend `IconName` with all 32 project IDs. Reuse existing icons where IDs already exist. Add restrained 24×24 outline SVG shapes for the new project-only IDs using the same `common` stroke contract. Do not add a package and do not change navigation/control icon semantics.

- [ ] **Step 4: Run validation and verify GREEN**

Run: `npm test && npm run typecheck && npm run lint`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/ui/FocoIcon.tsx tests/project-identity.test.cjs
git commit -m "feat: expand project icon catalog"
```

---

### Task 3: Expose independent color and icon selection in the project editor

**Files:**
- Create: `src/ui/projectColors.ts`
- Modify: `src/core/FocoStore.tsx`
- Modify: `src/features/projects/ProjectEditorSheet.tsx`
- Modify: `tests/project-identity.test.cjs`

**Interfaces:**
- Produces `PROJECT_COLORS: Record<ProjectColor, { light: string; dark: string; label: string }>` and `resolveProjectColor(color, appearance)`.
- Store signature becomes `addProject(name, icon?, color?)` and `updateProject` accepts `color`.

Use these approved solid light-surface colors transcribed from the reviewed catalog, with the rejected bright yellow replaced by the approved softer amber:

```ts
emerald: '#049E6A'
eucalyptus: '#649680'
lime: '#8FC241'
turquoise: '#3DC4C7'
pacific: '#3177B5'
electric-blue: '#2175DF'
indigo: '#433F9E'
crimson: '#DB3D32'
coral: '#DB604E'
amber-soft: '#D6A23A'
violet: '#793BD7'
plum: '#913A64'
```

For F3, dark companions may initially equal the light value except `amber-soft`, whose explicit dark companion is `#B98224`; F5 may tune contextual dark renderings without changing persisted token IDs.

- [ ] **Step 1: Add the failing editor/store contract tests**

Assert source contracts for:

```js
assert.match(editorSource, /COLOR DEL PROYECTO|COLOR/);
assert.match(editorSource, /PROJECT_COLOR_IDS/);
assert.match(editorSource, /PROJECT_ICON_IDS/);
assert.match(editorSource, /setColor/);
assert.match(editorSource, /setIcon/);
assert.match(editorSource, /addProject\(name, icon, color\)/);
assert.match(editorSource, /updateProject\(project\.id, \{ name, description, icon, color \}\)/);
```

Also assert the palette module contains all 12 exact token IDs and `#D6A23A`.

- [ ] **Step 2: Run `npm test` and verify RED**

Expected: FAIL because palette module and independent color UI do not exist.

- [ ] **Step 3: Implement palette tokens and store plumbing**

Create `src/ui/projectColors.ts` with the exact token map above. Update `FocoStore` type/callbacks so add/update project pass `color` without affecting other store actions.

- [ ] **Step 4: Implement the editor selectors**

In `ProjectEditorSheet`:

- state: `icon` and `color` are independent;
- reset both from existing project or deterministic defaults when sheet opens;
- show `COLOR DEL PROYECTO` solid swatches before `ICONO`;
- render 12 swatches with accessibility labels and selected state;
- render all 32 icons in a wrapped grid (not one endless horizontal row);
- selected icon uses the currently selected project color as its contextual accent while global sheet CTA remains monochrome;
- save uses `addProject(name, icon, color)` or `updateProject(...{ name, description, icon, color })`.

- [ ] **Step 5: Run full validation and verify GREEN**

Run: `npm test && npm run typecheck && npm run lint && npx expo-doctor && npx expo export --platform android --output-dir /tmp/foco-f3-editor-export`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/ui/projectColors.ts src/core/FocoStore.tsx src/features/projects/ProjectEditorSheet.tsx tests/project-identity.test.cjs
git commit -m "feat: add independent project color and icon picker"
```

---

### Task 4: Render project identity on project-facing surfaces

**Files:**
- Modify: `src/features/projects/ProjectsScreen.tsx`
- Modify: `src/features/projects/ProjectDetailScreen.tsx`
- Modify: `tests/project-identity.test.cjs`

**Interfaces:**
- Consumes `resolveProjectColor(project.color, theme.mode)` and project icon.
- Does not yet recolor Agenda/Progreso; that belongs to F5.

- [ ] **Step 1: Add failing surface contract tests**

Require both project list and detail source to resolve `project.color` and apply it to the project identity icon/marker while progress text/background remains otherwise neutral.

- [ ] **Step 2: Run `npm test` and verify RED**

Expected: FAIL because surfaces still use global `theme.colors.accent`/monochrome icon tiles.

- [ ] **Step 3: Implement restrained project identity rendering**

Projects list: colored icon/marker and project progress fill; body text remains theme neutral.

Project detail header: project icon uses its selected color; action buttons and general chrome remain monochrome.

- [ ] **Step 4: Run full validation and verify GREEN**

Run: `npm test && npm run typecheck && npm run lint && npx expo-doctor && npx expo export --platform android --output-dir /tmp/foco-f3-final-export`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/projects/ProjectsScreen.tsx src/features/projects/ProjectDetailScreen.tsx tests/project-identity.test.cjs
git commit -m "feat: render project identity consistently"
```

## F3 Completion Gate

- `Project.color` persists as token ID through store serialization/restore.
- Legacy v3 data hydrates without reset and receives deterministic color.
- All 32 project icons resolve.
- Project editor exposes independent color + icon choices.
- Project list/detail show project identity without turning global UI colorful.
- `npm test`, typecheck, lint, Expo Doctor, and Android export all pass.
- No physical Samsung review is requested at F3; continue directly to F4 when green.
