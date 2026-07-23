# FOCO Native Premium Polish Implementation Plan

**Goal:** Make the approved four-screen FOCO loop feel like a finished native Android product while preserving Expo Router, SQLite persistence and the existing domain model.

**Branch:** `feature/foco-native-premium-polish`  
**Pull request:** `#5 — feat: deliver FOCO native premium polish`

## Execution status

### 1. FOCO identity and native shell

- [x] Add failing identity/config regression tests.
- [x] Rename Mobile Lab to FOCO.
- [x] Configure `foco` scheme and native package identifiers.
- [x] Keep edge-to-edge enabled.
- [x] Enable Android Predictive Back.
- [x] Add official Expo navigation-bar integration.
- [x] Configure a valid graphite splash background.

### 2. Hydration without seeded-content flash

- [x] Add hydration selection and invalid-storage tests.
- [x] Start the store without exposing seeded state.
- [x] Hydrate SQLite once before rendering domain content.
- [x] Add screen-shaped skeletons for all four tabs.
- [x] Hide the native splash after hydration is ready.

### 3. Overlay, menu and navigation ownership

- [x] Add overlay-count and destructive-confirmation tests.
- [x] Replace the dead header menu with a functional FOCO menu.
- [x] Add quick navigation and local-data reset.
- [x] Hide bottom navigation during keyboard and sheets.
- [x] Support tab reselection scroll-to-top.
- [x] Keep Android Back and navigation history behavior native.

### 4. Keyboard and form behavior

- [x] Add numeric draft parsing and normalization tests.
- [x] Use explicit keyboard avoidance on Android and iOS.
- [x] Keep sheet actions visible above the keyboard.
- [x] Use one vertical sheet scroll surface.
- [x] Prevent quick-add layout shifts.
- [x] Allow empty numeric drafts and normalize at commit boundaries.

### 5. Timer resilience and focused presentation

- [x] Add timestamp and foreground-recomputation tests.
- [x] Reconcile the timer when the app becomes active.
- [x] Prevent duplicate completed-session records.
- [x] Stabilize timer digit width with tabular figures.
- [x] Hide status and tab chrome during active focus.
- [x] Show visible feedback for saved and discarded short sessions.
- [x] Reset persisted timer state during a complete local reset.

### 6. Density, accessibility and performance polish

- [x] Add shared platform-native typography tokens.
- [x] Strengthen graphite contrast and standardize radii/borders.
- [x] Compact Today, Projects, Focus and Statistics.
- [x] Remove duplicate task edit affordances.
- [x] Memoize project rows and stable derived statistics.
- [x] Prevent heatmap/chart overflow on narrow phones.
- [x] Add safe-area-aware global undo feedback.
- [x] Keep touch targets Android-friendly while reducing visible weight.
- [x] Preserve reduced-motion behavior and semantic haptics.

### 7. Validation and integration

- [x] Confirm the intended TDD red state in GitHub Actions.
- [x] Pass 19 unit tests.
- [x] Pass TypeScript with zero errors.
- [x] Pass ESLint with zero errors.
- [x] Pass Expo Doctor.
- [x] Pass Android export.
- [x] Update project status and validation evidence.
- [ ] Pass the final CI run on the documentation-complete HEAD.
- [ ] Squash merge PR #5 into `main`.
- [ ] Complete the physical Samsung acceptance checklist.

## Scope intentionally excluded

- Backend, authentication, accounts, analytics, payments and remote APIs.
- Onboarding and local notifications.
- Development/release build distribution.
- Final binary app icon and splash-image validation, which require the standalone build block.

## Acceptance gate

The technical block may be merged to `main` after final CI success. Product approval remains pending until the physical Samsung checklist in `docs/VALIDATION.md` passes.
