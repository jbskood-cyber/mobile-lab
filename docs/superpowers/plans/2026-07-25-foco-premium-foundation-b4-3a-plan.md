# FOCO B4.3A — Premium Foundation Implementation Plan

## Objective
Ship the reusable foundation that makes FOCO feel calmer, more intentional and less generic before changing feature screens. Preserve FocoStore, persisted state, IDs, notifications, Expo Router and Android Development Build behavior.

## Baseline
- Base product: `main` at the B4.2/B5.2 validated state.
- Product contract: `docs/superpowers/specs/2026-07-25-foco-premium-feel-b4-3-design.md`.
- Current typography: Manrope 400/500/600/700.
- Current icons: hand-authored SVG paths in `FocoIcon`.
- Current navigation calls `hapticSelection()` on every tab press.
- Current generic pressed state drops opacity to 0.72 and scales to 0.985.

## Dependency decisions
1. Evaluate Instrument Sans first. The Expo Google Fonts package `@expo-google-fonts/instrument-sans` provides static 400/500/600/700 assets and is compatible with the existing font-loading pattern. Keep the font behind centralized `fontFamilies` tokens so it can be replaced after Samsung review without screen rewrites.
2. Introduce `react-native-reanimated` + `react-native-worklets` using the Expo SDK 54 compatible install path for motion primitives.
3. Do not add Gesture Handler in B4.3A unless needed by the press primitive. Reserve it for B4.3C double-tap if the native Pressable solution is insufficient.
4. Keep `FocoIcon` as the app-facing API. Replace internals with one coherent professional source family in a later commit of this slice; do not mix families.

## TDD / delivery sequence

### A0 — Baseline and dependency lock
- Run clean `npm ci`.
- Run `npm test`, `npm run typecheck`, `npm run lint`, Expo Doctor.
- Install only SDK-compatible dependencies through Expo tooling so `package-lock.json` remains deterministic.
- Re-run baseline after dependency changes.
- Commit dependency-only changes separately.

### A1 — Typography system
- Add tests for semantic typography tokens: display, screen title, section, body, metadata, caption, metric, timer, control.
- RED: tests require centralized roles and tabular numeric variant for timer/metric roles.
- Implement Instrument Sans loading and replace Manrope family tokens centrally.
- Create a `typeScale`/semantic typography map; screens should consume tokens rather than inventing new font families.
- Do not mass-redesign every screen in this commit; migrate shared primitives and top-level headings first so regression surface stays bounded.
- Verify Light/Dark compile and font fallback behavior.
- Commit: typography foundation.

### A2 — Semantic haptics
- Add tests for navigation behavior where feasible at the pure/helper boundary.
- Remove `hapticSelection()` from routine bottom-tab navigation.
- Keep semantic helpers: selection, impact, success, warning.
- Audit only high-frequency shared controls in this slice; feature-specific haptic tuning remains with later slices.
- Commit: semantic haptic policy.

### A3 — Premium press primitive
- Introduce centralized press tokens (`quiet`, `control`, `primary`) instead of global opacity 0.72.
- Build a reusable `FocoPressable` or equivalent wrapper with subtle scale/surface feedback, release behavior and reduced-motion fallback.
- Migrate bottom navigation and shared high-frequency controls first.
- Preserve accessibility role/state/label and touch targets.
- Commit: press primitive.

### A4 — Motion tokens
- Add centralized durations/easing/spring configuration and reduced-motion behavior.
- Motion tokens: micro, fast, standard, softSpring, snappySpring, fade, crossfade, shortSlide.
- No decorative screen animation in B4.3A; this slice only creates primitives consumed by B4.3B–E.
- Add tests for exported token shape/pure reduced-motion resolution where practical.
- Commit: motion foundation.

### A5 — Icon system
- Select one professional family with license compatible with the repository.
- Preserve `IconName` and `FocoIcon` wrapper to avoid feature coupling.
- Replace navigation + primary shared-control glyphs first; remaining glyphs may be migrated in follow-up within B4.3A if visual consistency requires it.
- Active/inactive navigation must differ by optical weight/state, not color alone.
- No emoji, stock illustration set or mixed icon families.
- Commit: icon foundation.

### A6 — Integration validation
- `npm test`.
- `npm run typecheck`.
- `npm run lint`.
- Expo Doctor.
- `npx expo prebuild --clean --platform android` or the repository's established safe Android compatibility check when available.
- Inspect diff for store/persistence changes: expected none.
- Open draft PR to `main`; CI must pass before merge.
- Do not request Samsung review until B4.3B navigation consumes the motion foundation, unless a font/icon decision cannot be judged safely without physical rendering.

## Acceptance criteria
- Routine bottom-tab navigation no longer vibrates.
- Typography is centralized and no longer Manrope-based in migrated shared surfaces.
- Timer/metric typography supports tabular numerals.
- Press feedback is restrained and centralized; no universal 0.72 opacity treatment remains on migrated controls.
- Motion tokens exist and respect reduced motion.
- Navigation/shared iconography uses one coherent professional visual language.
- No changes to FocoStore schema, persisted IDs, reminders or notification scheduling.
- Automated suite, typecheck, lint, Expo Doctor and CI are green.

## Operational checkpoints for Drive REGISTRO
Create entries only after recognizable verified pieces:
1. typography integrated + validation;
2. haptics/press semantics integrated + validation;
3. motion/icon foundation integrated + validation;
4. PR/CI outcome.

## Next slice
After B4.3A is green, B4.3B consumes these primitives to rebuild bottom-tab and detail transitions. Physical Samsung review is most valuable after B4.3B because the user can then judge typography, iconography and smoothness together.