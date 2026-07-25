# FOCO B4.3E Product Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish B4.3 with a coherent, non-generic polish layer: proprietary abstract empty states, quiet loading behavior, reliable keyboard handling, and a reusable pre-permission education pattern.

**Architecture:** Keep the current Expo/React Native and offline-first boundaries unchanged. Add small reusable UI primitives under `src/ui`, integrate them only where the current code has a concrete UX gap, and validate behavior with source contracts plus existing regression suites. This branch is stacked on B4.3D and remains draft until the B4.3B Samsung gate and predecessor chain are integrated.

**Tech Stack:** Expo SDK 54, React Native 0.81, Expo Router 6, React Native Reanimated 4.1, React Native SVG, TypeScript, Node test runner, GitHub Actions.

## Global Constraints

- Do not add a mascot, stock illustration, confetti, 3D cards, excessive glow, or decorative motion.
- Preserve `FocoState` v3, store/persistence/migrations, task/project/session IDs, reminder APIs and local notifications.
- Do not wire Android Usage Access or AccessibilityService in B4.3E; only build reusable in-app permission education.
- Do not add a keyboard dependency unless a demonstrated gap cannot be solved with existing React Native primitives.
- All new motion must respect reduced-motion preferences.
- Keep touch targets, contrast and screen-reader semantics first-class.
- No direct work on `main`; PR stays stacked/draft until predecessor review gates are satisfied.

---

### Task 1: Proprietary abstract empty-state system

**Files:**
- Create: `src/ui/FocoEmptyState.tsx`
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `src/features/inbox/InboxSheet.tsx`
- Test: `tests/product-polish.test.cjs`

**Interfaces:**
- Produces: `FocoEmptyState({ title, copy, compact?, state? })` where `state` is a small semantic variant such as `clear`, `inbox`, `search`, `sessions`, or `complete`.
- Uses only local geometry (`react-native-svg`) and FOCO theme/motion primitives; no image assets or external illustration package.

- [ ] **Step 1: Add failing source-contract tests** requiring a single `FocoEmptyState` primitive, no mascot/stock-art terminology, abstract point/orbit/ring geometry, accessibility labels, and reuse in Today + Inbox.
- [ ] **Step 2: Push the RED test checkpoint** and confirm CI fails for the intended missing primitive/integration.
- [ ] **Step 3: Implement `FocoEmptyState`** with restrained SVG geometry derived from focus-point/orbit/ring/trajectory concepts. Keep `compact` suitable for inline Today sections and normal mode suitable for sheets/search results.
- [ ] **Step 4: Replace duplicated Today/Inbox empty-state markup** without changing existing copy or data behavior except where copy needs a minor clarity fix.
- [ ] **Step 5: Run full CI** (`npm test`, typecheck, lint, Expo Doctor, Android export) and keep the slice only if all checks pass.

### Task 2: Quiet loading system

**Files:**
- Modify: `src/ui/FocoSkeleton.tsx`
- Create if needed: `src/ui/FocoSkeletonPulse.tsx`
- Test: `tests/product-polish.test.cjs`

**Interfaces:**
- Produces a quiet, reduced-motion-aware skeleton pulse/fade shared by existing screen skeleton shapes.

- [ ] **Step 1: Add failing contracts** for no spinner, reduced-motion support, and centralized loading animation.
- [ ] **Step 2: Implement a low-amplitude opacity pulse/fade** using existing Reanimated dependency; retain current content-shaped skeleton geometry.
- [ ] **Step 3: Verify the loading path does not add layout shift or new dependencies.**
- [ ] **Step 4: Run full CI and record the checkpoint.**

### Task 3: Keyboard behavior audit and targeted fixes

**Files to inspect first:**
- `src/ui/FocoSheet.tsx`
- `src/features/tasks/TaskEditorSheet.tsx`
- `src/features/projects/ProjectEditorSheet.tsx` or actual project editor path
- routine editor path
- search inputs in Agenda/Projects

**Files modified:** only surfaces with a demonstrated code-level gap.

**Interfaces:**
- Existing `FocoSheet` remains the common sheet boundary and continues hiding/restoring bottom navigation through `FocoUIContext` overlay registration.

- [ ] **Step 1: Audit current primitives** for `KeyboardAvoidingView`, `keyboardDismissMode`, `keyboardShouldPersistTaps`, footer visibility, multiline bounds and explicit keyboard dismissal.
- [ ] **Step 2: Add regression contracts only for confirmed gaps.** Do not invent a new abstraction when the shared sheet already solves the behavior.
- [ ] **Step 3: Fix the smallest shared boundary possible** (prefer `FocoSheet` over duplicated per-screen hacks).
- [ ] **Step 4: Confirm no new keyboard dependency is required and run full CI.**

### Task 4: Permission education primitive

**Files:**
- Create: `src/ui/FocoPermissionEducation.tsx`
- Test: `tests/product-polish.test.cjs`

**Interfaces:**
- Produces a presentational primitive that accepts `title`, `benefit`, `privacy`, `actionLabel`, `onContinue`, and optional icon/visual variant.
- It never requests platform permission itself; caller controls the platform action later in B5.2/B5.3.

- [ ] **Step 1: Add failing contracts** requiring benefit-before-permission, explicit privacy copy, a deliberate continue action, and no Android permission API imports.
- [ ] **Step 2: Implement the reusable FOCO-styled education surface** using existing sheet/button/geometry primitives.
- [ ] **Step 3: Add an example contract or lightweight integration point only if it does not activate a sensitive permission.**
- [ ] **Step 4: Run full CI.**

### Task 5: Integrated B4.3E audit and stacked PR closure

**Files:**
- Test: `tests/product-polish.test.cjs`
- Update PR description and operational docs only; no unrelated refactor.

- [ ] **Step 1: Run the complete automated validation**: unit tests, typecheck, lint, Expo Doctor and Android export.
- [ ] **Step 2: Review the diff for scope**: no FocoState bump, no permission wiring, no mascot/stock illustration, no new keyboard package, no unrelated B5 work.
- [ ] **Step 3: Update the draft stacked PR** with delivered scope, CI evidence and predecessor gate.
- [ ] **Step 4: Update `FOCO — Control Operativo`** with 3–6 meaningful B4.3E checkpoints, not microlog entries.
- [ ] **Step 5: Leave the chain unmerged** until the existing B4.3B Samsung sensory review is accepted; after predecessor integration, perform the final integrated Samsung B4.3 smoke test required by the design contract.
