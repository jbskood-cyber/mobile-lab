# FOCO B4.3F4 Navigation Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace FOCO's persistent five-item bottom tab bar and small top-left hamburger with one thumb-accessible floating section capsule that opens a premium navigation sheet, while preserving all existing Expo Router destinations and route transitions.

**Architecture:** Keep Expo Router `Tabs` and its five primary route definitions so URLs, deep links, back behavior, lazy loading, and crossfade transitions remain unchanged. Re-purpose the existing custom `FocoTabBar` into a single floating current-section capsule instead of a five-item bar, and reuse `FocoAppMenu` as the navigation sheet. `FocoScreen` stops owning navigation entry; the capsule is the global primary entry point. Existing UI context visibility gates continue to hide navigation for keyboard, overlays, the open menu, and immersive focus.

**Tech Stack:** React Native 0.81, Expo SDK 54, Expo Router 6, TypeScript 5.9, existing FocoPressable/FocoSheet/FocoIcon/FocoUIContext, Node test runner.

## Global Constraints

- Keep the five primary routes exactly: Hoy, Agenda, Enfoque, Proyectos, Progreso.
- No persistent multi-item bottom navigation bar.
- No small hamburger button in `FocoScreen`.
- Capsule must show the current primary section label and icon.
- Capsule remains haptic-free for routine navigation.
- Keyboard, overlays, open app menu, and immersive Enfoque hide the capsule.
- Reuse the existing app-menu sheet; do not add a new navigation dependency.
- Preserve route URLs/deep links and B4.3B crossfade timing.
- Preserve reduced-motion behavior on route transitions.
- Do not touch project/task persistence, notifications, or native permissions.
- No merge of #22→#25 and no work directly on `main`.

---

### Task 1: Lock the reviewed navigation contract with a failing test

**Files:**
- Create: `tests/navigation-shell.test.cjs`
- Modify later: `src/ui/FocoTabBar.tsx`, `src/ui/FocoShell.tsx`, `src/ui/FocoAppMenu.tsx`
- Test: `tests/navigation-shell.test.cjs`

**Interfaces:**
- Consumes existing `FocoTabBar`, `FocoScreen`, `FocoAppMenu`, and `app/(tabs)/_layout.tsx` source contracts.
- Produces a regression contract for one capsule, no hamburger, grouped sheet destinations, and haptic-free navigation.

- [ ] **Step 1: Write the failing test**

Create `tests/navigation-shell.test.cjs` with source-level behavioral contracts:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = (...parts) => fs.readFileSync(path.join(process.cwd(), ...parts), 'utf8');

test('primary routes remain stable while the tab bar becomes one current-section capsule', () => {
  const layout = read('app', '(tabs)', '_layout.tsx');
  const nav = read('src', 'ui', 'FocoTabBar.tsx');
  for (const route of ['index', 'agenda', 'focus', 'projects', 'stats']) assert.match(layout, new RegExp(`name=["']${route}["']`));
  assert.match(nav, /openAppMenu/);
  assert.match(nav, /currentRoute|currentMeta|state\.routes\[state\.index\]/);
  assert.match(nav, /capsule/);
  assert.doesNotMatch(nav, /state\.routes\.map/);
  assert.doesNotMatch(nav, /activeIndicator/);
});

test('main screens no longer expose a top-left hamburger', () => {
  const shell = read('src', 'ui', 'FocoShell.tsx');
  assert.doesNotMatch(shell, /Abrir menú de FOCO/);
  assert.doesNotMatch(shell, /name=["']menu["']/);
  assert.doesNotMatch(shell, /openAppMenu/);
});

test('navigation capsule hides around keyboard overlays menu and immersive focus', () => {
  const nav = read('src', 'ui', 'FocoTabBar.tsx');
  for (const token of ['keyboardVisible', 'overlayCount', 'appMenuVisible', 'focusImmersive']) assert.match(nav, new RegExp(token));
});

test('navigation sheet separates primary and secondary destinations without routine haptics', () => {
  const menu = read('src', 'ui', 'FocoAppMenu.tsx');
  assert.match(menu, /primaryDestinations/);
  assert.match(menu, /secondaryDestinations/);
  assert.doesNotMatch(menu, /hapticSelection\s*\(\)/);
});
```

- [ ] **Step 2: Run `npm test` and verify RED**

Expected: FAIL because the current tab bar maps five visible tab items, `FocoScreen` still owns the hamburger trigger, and the menu is not grouped.

- [ ] **Step 3: Commit the RED contract**

```bash
git add tests/navigation-shell.test.cjs
git commit -m "test: define reviewed navigation shell contract"
```

---

### Task 2: Replace the five-item tab bar with one floating current-section capsule

**Files:**
- Modify: `src/ui/FocoTabBar.tsx`
- Test: `tests/navigation-shell.test.cjs`

**Interfaces:**
- Consumes `BottomTabBarProps`, `useFocoUI().openAppMenu`, `FocoPressable`, `FocoIcon`, `useSafeAreaInsets`, `useFocoTheme`.
- Produces a single `FocoTabBar` capsule showing the current route's icon and label.

- [ ] **Step 1: Implement the minimal capsule**

Keep `routeMeta` for the five primary routes. Resolve:

```ts
const currentRoute = state.routes[state.index];
const currentMeta = routeMeta[currentRoute?.name ?? 'index'] ?? routeMeta.index;
```

Read `openAppMenu` from `useFocoUI`. Preserve the existing visibility guard:

```ts
if (keyboardVisible || overlayCount > 0 || appMenuVisible || focusImmersive) return null;
```

Render one transparent navigation zone with a right-aligned pill:

```tsx
<View style={[styles.zone, { paddingBottom: Math.max(insets.bottom, 8) }]} pointerEvents="box-none">
  <FocoPressable
    feedback="quiet"
    accessibilityRole="button"
    accessibilityLabel={`Abrir navegación. Sección actual: ${currentMeta.label}`}
    onPress={openAppMenu}
    style={[styles.capsule, { backgroundColor: theme.colors.inverse, borderColor: theme.colors.border }]}
  >
    <FocoIcon name={currentMeta.icon} size={18} color={theme.colors.inverseText} weight="fill" />
    <Text style={[styles.capsuleLabel, { color: theme.colors.inverseText }]}>{currentMeta.label}</Text>
    <FocoIcon name="chevron-up" size={15} color={theme.colors.inverseText} />
  </FocoPressable>
</View>
```

If `chevron-up` is not in `FocoIcon`, use an existing neutral navigation glyph rather than adding a dependency; adding `chevron-up` as the mirror of the existing chevron family is acceptable.

Do not map every route into persistent buttons. Remove moving-indicator Reanimated code from `FocoTabBar`; B4.3B crossfade remains in the Tabs layout.

- [ ] **Step 2: Run `npm test && npm run typecheck && npm run lint`**

Expected: the new F4 contract passes except hamburger/menu grouping tasks still pending; no TypeScript regression.

- [ ] **Step 3: Commit**

```bash
git add src/ui/FocoTabBar.tsx
 git commit -m "feat: replace bottom tabs with navigation capsule"
```

---

### Task 3: Remove the top-left hamburger and refine the existing navigation sheet

**Files:**
- Modify: `src/ui/FocoShell.tsx`
- Modify: `src/ui/FocoAppMenu.tsx`
- Test: `tests/navigation-shell.test.cjs`

**Interfaces:**
- `FocoScreen` retains right-side contextual actions only.
- `FocoAppMenu` retains the current reset and runtime-fingerprint behavior.
- Primary destinations: Hoy, Agenda, Enfoque, Proyectos, Progreso.
- Secondary destinations: Impulso, Preferencias. Existing Listas/Rutinas access stays where product architecture already exposes it; do not invent unsupported routes.

- [ ] **Step 1: Remove hamburger ownership from `FocoScreen`**

Delete `openAppMenu` usage and the left menu `Pressable`. Keep a compact toolbar only when a right-side contextual action exists; align that action to the right. The screen title/subtitle remain unchanged.

- [ ] **Step 2: Group the sheet and remove navigation haptics**

Replace one `destinations` array with:

```ts
const primaryDestinations = [Hoy, Agenda, Enfoque, Proyectos, Progreso];
const secondaryDestinations = [Impulso, Preferencias];
```

Render `NAVEGACIÓN` for primary and `MÁS` for secondary. `navigate()` closes the sheet and calls `router.navigate(href)` without `hapticSelection()`; keep warning/success haptics only for destructive reset confirmation.

- [ ] **Step 3: Run `npm test && npm run typecheck && npm run lint`**

Expected: GREEN for navigation-shell contract.

- [ ] **Step 4: Commit**

```bash
git add src/ui/FocoShell.tsx src/ui/FocoAppMenu.tsx tests/navigation-shell.test.cjs
git commit -m "feat: move global navigation into premium sheet"
```

---

### Task 4: Retire obsolete bottom-indicator assertions and run the full F4 gate

**Files:**
- Modify: `tests/premium-navigation.test.cjs`
- Test: `tests/navigation-shell.test.cjs`
- Test: `tests/premium-navigation.test.cjs`

**Interfaces:**
- Preserve B4.3A typography/icon/press foundations.
- Preserve Tabs crossfade assertion.
- Replace B4.3B's now-obsolete `activeIndicator`/five-item-bar assertion with a capsule contract; no removal of route-transition coverage.

- [ ] **Step 1: Update the obsolete test only after the new contract is implemented**

Delete assertions requiring `useSharedValue`, `useAnimatedStyle`, `withTiming`, `activeIndicator`, and `FocoTabItem` inside `FocoTabBar`. Replace them with assertions that the current-section capsule uses `FocoPressable feedback="quiet"`, does not map all routes, and remains haptic-free. Keep the professional icon-family test against `FocoIcon`; `FocoTabItem` may remain in the codebase unused until a later cleanup, but is no longer a navigation requirement.

- [ ] **Step 2: Run full repository validation**

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android --output-dir /tmp/foco-f4-navigation-export
```

Expected: all PASS.

- [ ] **Step 3: Scope audit**

Compare F3 head to F4 head. Expected product changes are limited to the F4 plan/test plus `FocoTabBar`, `FocoShell`, `FocoAppMenu`, and at most a tiny `FocoIcon` chevron addition. No model/store/migration/package/native changes.

- [ ] **Step 4: Commit**

```bash
git add tests/premium-navigation.test.cjs
 git commit -m "test: align premium navigation with reviewed shell"
```

## F4 Completion Gate

- All five primary routes remain defined and reachable.
- No persistent five-item bottom bar.
- No top-left hamburger on standard `FocoScreen` surfaces.
- One current-section capsule opens the existing premium navigation sheet.
- Capsule hides for keyboard, overlays, open sheet, and immersive Enfoque.
- Routine navigation is haptic-free.
- Crossfade route transitions remain.
- Full automated pipeline passes.
- No Samsung review is requested yet; continue directly to F5 when green.
