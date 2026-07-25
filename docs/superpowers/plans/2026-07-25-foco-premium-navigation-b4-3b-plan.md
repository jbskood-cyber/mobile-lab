# FOCO B4.3B — Premium Navigation Implementation Plan

> **For agentic workers:** execute task-by-task with TDD and independently reviewable commits.

**Goal:** Convert the B4.3A foundation into navigation that feels continuous, calm and premium on Android: no snap between tabs, one moving active indicator, restrained icon state transitions and consistent detail-screen motion.

**Architecture:** Keep Expo Router + React Navigation as the navigation source of truth. Use React Navigation's supported tab scene animation for screen crossfades and Reanimated only for the custom FOCO tab-bar indicator/icon micro-motion. Do not replace the navigator with a custom router. Central motion tokens remain authoritative and reduced-motion users receive immediate state changes without decorative movement.

**Tech Stack:** Expo SDK 54, Expo Router ~6.0.24, React Navigation bottom tabs, React Native Reanimated ~4.1.1, react-native-worklets 0.5.1, TypeScript, existing FocoPressable/FocoIcon/motion tokens.

## Global Constraints

- No changes to FocoStore, persisted schema, IDs, reminders or notification scheduling.
- No routine navigation haptic.
- No mascot, confetti, glow-heavy effects or decorative springing.
- Keep tab interaction immediate; animation must never delay navigation.
- Respect system reduced-motion preference.
- Preserve keyboard/overlay/focus-immersive rules that currently hide the bottom bar.
- Physical Samsung review occurs after B4.3B is integrated, so typography + iconography + navigation motion can be judged together.

---

### Task 1: Tab scene transition contract

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Test: `tests/premium-navigation.test.cjs`

**Produces:** tab switches use a restrained crossfade instead of `animation: 'none'`.

- [ ] RED: add a source-level regression test requiring a non-`none` tab animation and a short timing transition.
- [ ] GREEN: configure the existing Tabs navigator with supported React Navigation fade behavior and a short timing spec derived from FOCO's standard/fast motion duration.
- [ ] Verify test, typecheck and lint.
- [ ] Commit.

### Task 2: Moving active indicator

**Files:**
- Modify: `src/ui/FocoTabBar.tsx`
- Modify: `src/ui/motion.ts` only if a reusable helper is needed
- Test: `tests/premium-navigation.test.cjs`

**Produces:** one indicator moves horizontally between tabs instead of being destroyed/recreated per active item.

- [ ] RED: require a single animated indicator, Reanimated shared value and reduced-motion path.
- [ ] GREEN: measure the tab-bar content width, compute one tab slot width, animate indicator X with a restrained timing token when `state.index` changes, and assign the value immediately when reduced motion is enabled.
- [ ] Ensure indicator has no pointer events and cannot affect touch targets.
- [ ] Verify test, typecheck and lint.
- [ ] Commit.

### Task 3: Icon/label state micro-transition

**Files:**
- Modify: `src/ui/FocoTabBar.tsx` or create focused `src/ui/FocoTabItem.tsx` if the tab bar becomes hard to read
- Test: `tests/premium-navigation.test.cjs`

**Produces:** active regular/fill icon and label emphasis change without a hard visual pop.

- [ ] RED: require focused state to use Reanimated/timing and reduced-motion behavior rather than a raw conditional-only visual switch.
- [ ] GREEN: animate only opacity/scale in a restrained range while preserving the existing regular/fill semantic icon distinction; no bounce.
- [ ] Verify accessibility state, label and long-press remain intact.
- [ ] Commit.

### Task 4: Detail navigation motion policy

**Files:**
- Modify: `app/_layout.tsx`
- Add/modify route options only where a concrete route requires a different presentation
- Test: `tests/premium-navigation.test.cjs`

**Produces:** a consistent native detail transition policy instead of arbitrary/default motion.

- [ ] RED: codify the intended root stack animation contract and forbid `animation: 'none'` on normal detail navigation.
- [ ] GREEN: use a restrained native stack transition supported by Expo Router/React Native Screens; keep sheets/modals in their appropriate presentation path rather than faking them with tab animation.
- [ ] Keep status bar and focus immersive behavior unchanged.
- [ ] Commit.

### Task 5: Integrated regression validation

**Files:**
- No product code unless validation exposes a real regression.

- [ ] Run full `npm test`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm run lint`.
- [ ] Run Expo Doctor.
- [ ] Export Android bundle through CI.
- [ ] Confirm PR diff has no store/persistence/notification changes.
- [ ] Open/update PR to `main` and require green CI.
- [ ] Update Drive checkpoints.

## Acceptance Criteria

- Switching Hoy/Agenda/Enfoque/Proyectos/Progreso no uses routine haptics and no longer visually snaps.
- Tab scene transition uses a fast restrained crossfade.
- Exactly one active indicator moves between tab slots.
- Indicator/icon micro-motion respects reduced motion.
- Active/inactive icons retain regular/fill semantic distinction.
- Detail navigation follows one consistent native motion policy.
- Keyboard, overlays and immersive focus continue hiding the bottom bar correctly.
- Full automated validation, Expo Doctor and Android bundle export pass.
- No persistence, reminder or notification regression.

## Physical Review Gate

After CI-green merge/readiness, request one short Samsung review focused only on: tab smoothness, perceived speed, absence of annoying vibration, typography/icon rendering, and whether transitions feel premium rather than sluggish. Do not expand the review into B4.3C Agenda functionality yet.
