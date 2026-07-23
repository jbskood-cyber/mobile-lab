# FOCO Native Premium Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing four-screen FOCO product loop feel like a finished native Android application while preserving the approved visual direction and offline-first architecture.

**Architecture:** Keep Expo Router, React Native, SQLite persistence, and the existing domain model. Introduce focused UI infrastructure for hydration, overlay ownership, app menu, scroll control, native system UI, and reusable skeleton/field behavior; then apply targeted screen refinements without adding product scope.

**Tech Stack:** Expo SDK 54, Expo Router 6, React Native 0.81, React 19, TypeScript 5.9, expo-sqlite, expo-haptics, expo-navigation-bar, react-native-safe-area-context, react-native-svg.

## Global Constraints

- Preserve the approved four-screen graphite visual direction.
- No backend, authentication, analytics, payments, AI, notifications, onboarding, or new product routes.
- `main` remains the latest validated preview only after CI passes.
- Android physical Samsung with gesture navigation is the primary acceptance target.
- Edge-to-edge remains enabled; Predictive Back must be enabled.
- No visible control may remain dead.
- Bottom navigation must hide for keyboard and modal/sheet ownership.
- Body/action copy remains accessible; compact metrics may cap text scaling only to avoid destructive clipping.
- Haptics always accompany visible feedback and respect system settings.
- Avoid new dependencies except official Expo platform modules required for native system behavior.

---

### Task 1: FOCO identity and native system shell

**Files:**
- Modify: `app.json`
- Modify: `package.json`
- Modify: `app/_layout.tsx`
- Create: `src/ui/NativeSystemUI.tsx`
- Create: `scripts/validate-app-config.cjs`
- Test: `tests/app-config.test.cjs`

**Interfaces:**
- Produces: `NativeSystemUI(): JSX.Element`, mounted once by `RootLayout`.
- Produces: app-config regression script that reads `app.json` and exports no runtime API.

- [ ] **Step 1: Write failing app-config assertions**

```js
const assert = require('node:assert/strict');
const test = require('node:test');
const config = require('../app.json').expo;

test('FOCO native identity and Android integration remain configured', () => {
  assert.equal(config.name, 'FOCO');
  assert.equal(config.slug, 'foco');
  assert.equal(config.scheme, 'foco');
  assert.equal(config.android.edgeToEdgeEnabled, true);
  assert.equal(config.android.predictiveBackGestureEnabled, true);
  assert.equal(config.android.package, 'com.jbskoodcyber.foco');
  assert.equal(config.ios.bundleIdentifier, 'com.jbskoodcyber.foco');
  assert.ok(config.plugins.some((entry) => Array.isArray(entry) && entry[0] === 'expo-splash-screen'));
});
```

- [ ] **Step 2: Run tests and confirm identity assertions fail**

Run: `npm test`
Expected: FAIL because `app.json` still names Mobile Lab and disables Predictive Back.

- [ ] **Step 3: Apply FOCO config and official system UI module**

`app.json` must set FOCO name/slug/scheme/package identifiers, `predictiveBackGestureEnabled: true`, dark splash plugin, edge-to-edge, and adaptive icon metadata. Add `expo-navigation-bar: ~5.0.10` to `package.json`. `NativeSystemUI` must set Android navigation-bar icon style to light and keep failures non-blocking.

```tsx
export function NativeSystemUI() {
  useEffect(() => {
    if (Platform.OS === 'android') NavigationBar.setStyle('dark');
  }, []);
  return null;
}
```

- [ ] **Step 4: Mount system UI once and rerun tests**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add app.json package.json app/_layout.tsx src/ui/NativeSystemUI.tsx tests/app-config.test.cjs scripts/validate-app-config.cjs
git commit -m "feat: establish FOCO native system shell"
```

### Task 2: Hydration without seeded-content flash

**Files:**
- Modify: `src/core/FocoStore.tsx`
- Create: `src/core/hydration.ts`
- Create: `src/ui/FocoSkeleton.tsx`
- Modify: `app/_layout.tsx`
- Modify: `tsconfig.core-test.json`
- Test: `tests/hydration.test.cjs`

**Interfaces:**
- Produces: `resolveHydratedState(stored: string | null, now?: number): FocoState`.
- Produces: `FocoSkeleton({ screen }: { screen: 'today' | 'projects' | 'focus' | 'stats' }): JSX.Element`.
- `useFocoStore()` continues exposing `ready`, but `state` is no longer seeded before hydration.

- [ ] **Step 1: Write failing hydration tests**

```js
test('hydration selects persisted state without exposing seed first', () => {
  const persisted = createInitialState(NOW);
  persisted.projects[0].name = 'Persistido';
  assert.equal(resolveHydratedState(JSON.stringify(persisted), NOW).projects[0].name, 'Persistido');
});

test('invalid storage falls back to a valid seed state', () => {
  assert.equal(resolveHydratedState('{bad json', NOW).version, 1);
});
```

- [ ] **Step 2: Verify tests fail before helper exists**

Run: `npm test`
Expected: FAIL with missing `hydration` module.

- [ ] **Step 3: Implement nullable pre-hydration state and screen skeletons**

`FocoStoreProvider` starts with `state: FocoState | null`; it resolves storage once and only persists after hydration. The provider exposes a valid state to consumers only after ready. `RootLayout` renders a graphite skeleton shell until hydration completes and then hides the native splash.

- [ ] **Step 4: Verify no seed flash and all tests pass**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/core/FocoStore.tsx src/core/hydration.ts src/ui/FocoSkeleton.tsx app/_layout.tsx tsconfig.core-test.json tests/hydration.test.cjs
git commit -m "feat: hydrate FOCO without visual state flash"
```

### Task 3: Overlay ownership, functional app menu, and native tab behavior

**Files:**
- Create: `src/ui/FocoUIContext.tsx`
- Create: `src/ui/FocoAppMenu.tsx`
- Modify: `src/ui/FocoSheet.tsx`
- Modify: `src/ui/FocoShell.tsx`
- Modify: `src/ui/FocoTabBar.tsx`
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `app/_layout.tsx`
- Test: `tests/ui-state.test.cjs`

**Interfaces:**
- Produces: `useFocoUI()` with `{ overlayCount, keyboardVisible, openAppMenu, closeAppMenu, registerOverlay, unregisterOverlay }`.
- `FocoScreen` accepts `screenKey`, `rightAccessibilityLabel`, and optional `onMenuPress` while preserving existing props.
- `FocoSheet` registers ownership while visible.

- [ ] **Step 1: Write failing pure UI-state reducer tests**

```js
test('overlay counter never becomes negative', () => {
  let state = reduceUIState({ overlays: 0 }, { type: 'close-overlay' });
  assert.equal(state.overlays, 0);
});

test('reset confirmation requires two explicit actions', () => {
  assert.equal(reduceUIState({ resetArmed: false }, { type: 'request-reset' }).resetArmed, true);
  assert.equal(reduceUIState({ resetArmed: true }, { type: 'cancel-reset' }).resetArmed, false);
});
```

- [ ] **Step 2: Verify reducer tests fail**

Run: `npm test`
Expected: FAIL with missing `uiState` module.

- [ ] **Step 3: Implement UI provider and app menu**

The menu contains only four quick destinations, local-data reset with a second explicit destructive action, and FOCO version copy. Every header menu button opens it; every right action receives a specific label.

- [ ] **Step 4: Hide tab bar while keyboard/overlay owns interaction and support reselect scroll-to-top**

Use keyboard show/hide events in the UI provider. `FocoTabBar` returns `null` while owned. Each `FocoScreen` registers a `ScrollView` ref by `screenKey`; reselecting an active tab calls `scrollTo({ y: 0, animated: true })`.

- [ ] **Step 5: Run checks and commit**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/ui/FocoUIContext.tsx src/ui/FocoAppMenu.tsx src/ui/FocoSheet.tsx src/ui/FocoShell.tsx src/ui/FocoTabBar.tsx app/_layout.tsx app/'(tabs)'/_layout.tsx tests/ui-state.test.cjs
git commit -m "feat: add native overlay and navigation behavior"
```

### Task 4: Native keyboard and form behavior

**Files:**
- Create: `src/ui/formModel.ts`
- Modify: `src/ui/FocoSheet.tsx`
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `src/features/projects/ProjectsScreen.tsx`
- Modify: `src/features/focus/FocusScreen.tsx`
- Test: `tests/form-model.test.cjs`

**Interfaces:**
- Produces: `parseOptionalInteger(value: string, min: number, max: number): number | null`.
- Produces: `normalizeIntegerDraft(value: string, fallback: number, min: number, max: number): string`.

- [ ] **Step 1: Write failing input-normalization tests**

```js
test('numeric drafts allow empty intermediate state', () => {
  assert.equal(parseOptionalInteger('', 1, 90), null);
  assert.equal(parseOptionalInteger('25', 1, 90), 25);
});

test('numeric values normalize only at commit boundaries', () => {
  assert.equal(normalizeIntegerDraft('', 25, 1, 90), '25');
  assert.equal(normalizeIntegerDraft('120', 25, 1, 90), '90');
});
```

- [ ] **Step 2: Verify tests fail, then implement helpers**

Run: `npm test`
Expected: FAIL before helper; PASS after helper.

- [ ] **Step 3: Refine sheets and screen forms**

Use explicit `KeyboardAvoidingView` behavior (`padding` iOS, `height` Android), dismiss keyboard on backdrop, retain one vertical scroll surface, keep footer visible, reserve quick-add trailing-action width, and use correct input metadata (`inputMode`, `autoCapitalize`, `returnKeyType`). Timer settings become editable text fields or steppers whose empty drafts remain valid while editing.

- [ ] **Step 4: Run checks and commit**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/ui/formModel.ts src/ui/FocoSheet.tsx src/features/today/TodayScreen.tsx src/features/projects/ProjectsScreen.tsx src/features/focus/FocusScreen.tsx tests/form-model.test.cjs
git commit -m "fix: make FOCO forms behave natively"
```

### Task 5: Timer foreground accuracy and focused-session presentation

**Files:**
- Modify: `src/core/focusTimer.ts`
- Modify: `src/core/useFocusTimer.ts`
- Modify: `src/features/focus/FocusScreen.tsx`
- Modify: `src/ui/NativeSystemUI.tsx`
- Test: `tests/core-model.test.cjs`

**Interfaces:**
- Produces: `recomputeRuntime(runtime: FocusRuntime, now: number): FocusRuntime` for deterministic foreground restoration.
- `useFocusTimer` returns `message: string | null` for visible short-session/save feedback.

- [ ] **Step 1: Add failing delayed/background timer tests**

```js
test('foreground recomputation completes elapsed Pomodoro exactly once', () => {
  const runtime = startTimer(configureTimer(createFocusRuntime(), { focusSeconds: 60 }), NOW);
  const restored = recomputeRuntime(runtime, NOW + 65_000);
  assert.equal(restored.running, false);
  assert.equal(restored.baseSeconds, 0);
});
```

- [ ] **Step 2: Implement AppState reconciliation**

Subscribe to `AppState.change`; on `active`, set `now` immediately and allow one completion path. Avoid duplicate session records with a completion marker derived from the current anchor.

- [ ] **Step 3: Refine active-focus UI**

Use stable-width tabular timer digits, hide unnecessary system/nav distraction only during a running focus session without breaking gesture navigation, and show a compact message when a stopped session is too short to record.

- [ ] **Step 4: Run checks and commit**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/core/focusTimer.ts src/core/useFocusTimer.ts src/features/focus/FocusScreen.tsx src/ui/NativeSystemUI.tsx tests/core-model.test.cjs
git commit -m "fix: harden focus sessions across app state changes"
```

### Task 6: Screen density, memoization, and accessibility polish

**Files:**
- Create: `src/ui/typeScale.ts`
- Modify: `src/ui/focoTheme.ts`
- Modify: `src/ui/FocoShell.tsx`
- Modify: `src/ui/FocoTabBar.tsx`
- Modify: `src/ui/UndoBar.tsx`
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `src/features/projects/ProjectsScreen.tsx`
- Modify: `src/features/focus/FocusScreen.tsx`
- Modify: `src/features/stats/StatsScreen.tsx`

**Interfaces:**
- Produces shared `typeScale` tokens for display/title/section/body/meta/caption/metric.
- Stable rows are wrapped in `memo`; screen-derived maps and callbacks are memoized by relevant state only.

- [ ] **Step 1: Apply shared native typography tokens and contrast corrections**

Replace ad hoc display/body styles with shared tokens; keep system fonts, supported weights, and tabular figures. Raise weak secondary contrast and standardize cool-gray borders/radii.

- [ ] **Step 2: Remove unnecessary visual weight**

Compact vertical spacing, reserve glow for the main focus control/transient feedback, reduce nested surfaces, and shorten verbose empty/error copy while preserving 48 dp hit areas.

- [ ] **Step 3: Stabilize rows and chart layouts**

Memoize task/project row components, avoid recreating static chart arrays on timer ticks, enforce `minWidth: 0` where text can shrink, and keep heatmap/bar content inside narrow phone widths.

- [ ] **Step 4: Audit labels and text scaling**

Every control receives a specific label/state. Body/action text remains scalable. Compact metrics use bounded `maxFontSizeMultiplier` and `adjustsFontSizeToFit` only where required.

- [ ] **Step 5: Run checks and commit**

Run: `npm test && npm run typecheck && npm run lint`
Expected: PASS.

```bash
git add src/ui/typeScale.ts src/ui/focoTheme.ts src/ui/FocoShell.tsx src/ui/FocoTabBar.tsx src/ui/UndoBar.tsx src/features/today/TodayScreen.tsx src/features/projects/ProjectsScreen.tsx src/features/focus/FocusScreen.tsx src/features/stats/StatsScreen.tsx
git commit -m "refactor: polish FOCO density and accessibility"
```

### Task 7: Final regression suite, documentation, CI, and preview merge

**Files:**
- Modify: `docs/PROJECT_STATUS.md`
- Modify: `docs/VALIDATION.md`
- Modify: `docs/superpowers/plans/2026-07-23-foco-native-premium-polish.md`
- Test: all `tests/*.test.cjs`

**Interfaces:**
- No new runtime interfaces.

- [ ] **Step 1: Run the complete local/CI-equivalent suite**

Run:

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor@latest
npx expo export --platform android --output-dir dist-android
```

Expected: all commands exit 0.

- [ ] **Step 2: Review the branch diff against the approved design contract**

Confirm no backend/new route/product scope, no dead controls, no seeded flash, Predictive Back enabled, FOCO identity, and no unapproved dependency.

- [ ] **Step 3: Update project status and physical Samsung checklist**

Record exact SHA, changed files, automated results, known limitations of Expo Go splash rendering, and the ten-step physical acceptance sequence.

- [ ] **Step 4: Open draft PR and wait for successful GitHub Actions**

CI must pass unit tests, TypeScript, ESLint, Expo Doctor, and Android export.

- [ ] **Step 5: Squash merge to `main` only after CI success**

Commit title:

```text
feat: deliver FOCO native premium polish
```

- [ ] **Step 6: Keep final approval pending physical Samsung validation**

The block may be merged as the latest preview after technical validation, but product approval remains pending until the physical checklist passes.
