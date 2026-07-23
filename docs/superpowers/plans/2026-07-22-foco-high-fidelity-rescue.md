# FOCO High-Fidelity Visual Rescue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the four FOCO screens to closely match the approved mockups on the user’s Samsung through Expo Go.

**Architecture:** Keep Expo Router routes, replace the generic visual layer with a local SVG-backed design system, and isolate each screen in its own feature module. Reuse one custom tab bar, shell, surface system and progress-ring primitive.

**Tech Stack:** React Native 0.81, Expo SDK 54, Expo Router 6, TypeScript 5.9, react-native-svg 15.12.1.

## Global Constraints

- The four uploaded mockups are the visual source of truth.
- Android physical-device rendering is the acceptance target.
- No backend, authentication, paid service or remote data.
- Preserve existing task interactions and tests.
- Keep `main` stable until CI and Android export pass.

---

### Task 1: Visual primitives

**Files:**
- Create: `src/ui/focoTheme.ts`
- Create: `src/ui/FocoIcon.tsx`
- Create: `src/ui/FocoShell.tsx`
- Create: `src/ui/ProgressRing.tsx`
- Create: `src/ui/FocoTabBar.tsx`
- Modify: `package.json`

- [ ] Add the SVG dependency version recommended by Expo SDK 54.
- [ ] Implement monochrome tokens and shared surfaces.
- [ ] Implement local line icons and progress rings.
- [ ] Implement a custom tab bar matching the mockups.

### Task 2: Today screen

**Files:**
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `app/(tabs)/index.tsx`

- [ ] Match the mockup hierarchy and density.
- [ ] Preserve quick-add and completion behavior.
- [ ] Validate text scaling and scroll clearance above the tab bar.

### Task 3: Projects screen

**Files:**
- Create: `src/features/projects/model.ts`
- Create: `src/features/projects/ProjectsScreen.tsx`
- Modify: `app/(tabs)/projects.tsx`
- Create: `tests/projects-model.test.cjs`

- [ ] Write filtering tests first.
- [ ] Implement project groups, chips and progress rows.
- [ ] Verify filters and archived presentation.

### Task 4: Focus screen

**Files:**
- Create: `src/features/focus/model.ts`
- Create: `src/features/focus/FocusScreen.tsx`
- Modify: `app/(tabs)/focus.tsx`
- Create: `tests/focus-model.test.cjs`

- [ ] Write state-transition tests first.
- [ ] Implement segmented control, timer ring and controls.
- [ ] Verify pause/play and mode switching.

### Task 5: Statistics screen

**Files:**
- Create: `src/features/stats/StatsScreen.tsx`
- Modify: `app/(tabs)/stats.tsx`

- [ ] Implement summary metrics and week selector.
- [ ] Implement activity heatmap, bars and distribution donut.
- [ ] Verify responsiveness on narrow Android widths.

### Task 6: Routing and validation

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Modify: `.github/workflows/ci.yml`
- Modify: `package.json`
- Modify: `docs/PROJECT_STATUS.md`

- [ ] Wire the custom tab bar.
- [ ] Run unit tests, typecheck, lint, Expo Doctor and Android export.
- [ ] Open a draft PR and keep it unmerged until all checks pass.
- [ ] Merge to `main` only after successful validation, then request physical review.
