# FOCO Native Premium Polish — Design Contract

## Objective

Make FOCO feel like a finished native mobile product on the user's Samsung without redesigning the approved four screens or adding product scope. This is a surgical quality block: improve behavior, density, platform integration, feedback, accessibility, startup, and perceived performance while protecting the current offline-first architecture.

## Scope decision

Three approaches were considered:

1. **Cosmetic-only cleanup** — fastest, but would leave dead controls, startup flashes, weak system integration, and inconsistent keyboard/back behavior.
2. **Surgical native polish on the current Expo architecture** — selected. It fixes the real experience while preserving the four approved mockups and the current data model.
3. **Immediate custom development build and navigation rewrite** — potentially more native, but too disruptive for this block and unnecessary before the current loop is physically validated.

The selected approach keeps Expo Router, React Native, SQLite persistence, and the existing four-tab product loop.

## User's recurring product standards

The following rules are binding because they recur across the user's previous mobile-first products:

- Mobile-first real, not desktop UI compressed into a phone.
- More intuitive and demonstrative; less explanatory copy.
- Dense but readable layouts; no oversized cards or card soup.
- Navigation must feel immediate and preserve context.
- Bottom navigation disappears when the keyboard or an overlay owns the interaction.
- Sheets must have one scroll surface, visible actions, safe-area spacing, and no keyboard obstruction.
- Headers expose no more than two useful actions; decorative or dead controls are forbidden.
- Screen changes begin at the top unless returning to preserved context.
- Inputs must allow natural editing, stable cursor behavior, and correct Android keyboard modes.
- Loading, empty, offline/storage-error, success, and undo states must be visible and contextual.
- Haptics are subtle and semantic, never the only feedback.
- Motion is restrained and respects Reduce Motion.
- Typography is premium, compact, consistent, and uses tabular figures for timers and metrics.
- Performance must feel immediate; avoid unnecessary rerenders, delayed navigation, blocking initialization, and visual jumps.
- Safe areas, Android gesture navigation, and system bars are first-class layout constraints.
- Accent colors remain semantic. Orange is not structural and no unrelated color may leak into the graphite system.

## Visual and interaction contract

### 1. Native system shell

- Rename the product from **Mobile Lab** to **FOCO** in app configuration.
- Use the `foco` URL scheme and FOCO package/bundle identifiers for future standalone builds.
- Enable Android Predictive Back instead of opting out.
- Keep edge-to-edge enabled and render transparent system bars.
- Scrollable backgrounds may extend behind system bars, but interactive content must respect insets.
- Status and navigation-bar icon appearance remains light in graphite mode.
- Add a coherent FOCO app icon and native splash configuration. Expo Go is not the acceptance environment for final splash fidelity; release-build verification is documented separately.

### 2. Header discipline

- Preserve the approved title hierarchy and compact toolbar.
- Every visible header icon must perform a useful action and have a specific accessibility label.
- The current generic/dead menu button must not remain inert.
- Selected solution: the menu opens one compact app sheet containing only secondary product controls that already exist or are necessary for local operation:
  - quick navigation to the four primary destinations;
  - local data reset with explicit destructive confirmation inside the sheet;
  - app identity/version information.
- No new full-screen Settings route, onboarding, account, theme system, or remote service is introduced.
- Screen-specific right actions remain contextual: create project, timer settings, date/statistics context, and day context.

### 3. Navigation behavior

- Bottom navigation remains fixed, safe-area aware, compact, and visually subordinate to content.
- It hides while the keyboard is visible and while a modal/sheet is open.
- Re-selecting the current tab scrolls that tab to the top.
- Switching to another tab begins at the top for that destination unless the user is returning through native back navigation to a preserved screen state.
- Android Back closes, in order: keyboard → active sheet/modal → nested context → app/home transition.
- Predictive Back remains enabled and is not intercepted by custom back hacks.
- Press feedback uses opacity/ripple or a very small scale change; no decorative bounce.

### 4. Keyboard and forms

- `KeyboardAvoidingView` uses an explicit behavior on Android and iOS where forms require it.
- Sheets use a single scroll container and keep footer actions above the keyboard.
- Bottom navigation hides during text entry.
- Inputs use appropriate `returnKeyType`, `inputMode`, auto-capitalization, and submit behavior.
- Numeric timer settings allow empty intermediate values and normalize only on blur/submit.
- Autofocus is applied only when entering a creation flow, not when reopening read-only context.
- Tapping outside a form dismisses the keyboard without losing data.

### 5. Loading and hydration

- Do not render seeded state and then replace it with persisted state.
- App hydration has an explicit ready state.
- Each primary screen receives a compact screen-specific skeleton matching its real geometry.
- Skeletons avoid shimmer when Reduce Motion is enabled.
- Storage failures show one compact contextual banner; they do not block the entire app.
- Empty states are concise and action-oriented, not explanatory paragraphs.

### 6. Density and component refinement

- Reduce unnecessary vertical padding while maintaining Android touch targets of at least 48 dp.
- Visible controls may look smaller than their hit area.
- Lists use compact rows and grouping rather than adding another card around every element.
- Surface hierarchy is limited to background, raised section, and active/primary control.
- Shadows/glow are reserved for the main focus control and transient elevated feedback.
- Borders use one consistent cool-gray scale.
- Rounded corners are standardized by component role.
- Long supporting text is shortened; primary data and action labels remain visible at a glance.

### 7. Typography and numbers

- Use platform-native system typography; do not download a web font for this block.
- Define shared display, title, section, body, metadata, and caption tokens.
- Android uses the system sans family and real supported weights.
- Timers, durations, percentages, and chart axes use tabular figures.
- Limit text scaling only where clipping would destroy a compact metric; all body and action copy remains accessible.
- Secondary text is slightly brighter than the current weakest gray where contrast is insufficient.

### 8. Feedback, haptics, and undo

- Selection haptic: filters, tabs, project/icon choices.
- Light impact: primary focus start/pause and direct manipulation.
- Success: task/project creation, save, completed session.
- Warning: destructive request or discarded short session.
- Every haptic has visible state feedback.
- Reversible destructive actions use an undo bar where technically safe.
- Toasts/undo bars appear above the bottom navigation and never at the very top of the screen.
- No full-screen success overlays or blocking confirmations for ordinary actions.

### 9. Screen-specific polish

#### Hoy

- Preserve the approved metric strip, quick add, focus card, and task rows.
- Prevent quick-add layout shift when the save action appears.
- Completed-task feedback is immediate and reversible.
- Task row options open one compact sheet; no duplicate edit affordances.
- Filter state is visible without recoloring the whole theme.
- The focus card navigates immediately and reflects the active timer state when available.

#### Proyectos

- Search remains stable when switching filters.
- Project creation sheet uses a compact native form with sticky actions.
- Project rows do not rerender unnecessarily when unrelated task state changes.
- Archive/restore is contextual and reversible where possible.
- Empty active/archive/search states have distinct concise actions.

#### Enfoque

- Timer digits never jump horizontally.
- Timer remains timestamp-driven when JS execution is delayed.
- Background/foreground transitions recompute from timestamps instead of trusting interval ticks.
- Starting a session provides immediate visible and haptic feedback.
- Settings edits allow natural numeric input and apply atomically.
- Navigation and system bars do not distract during an active session.
- The screen prevents accidental loss of a meaningful running session while preserving standard Android Back behavior.

#### Estadísticas

- Charts use real local data only.
- Week changes update without layout jumps.
- Empty weeks show a compact state while preserving chart context.
- Heatmap cells, bars, and legends maintain readable contrast and semantic labels.
- Horizontal overflow is forbidden on supported phone widths.

### 10. Performance and architecture protection

- Do not replace SQLite, Expo Router, or the current domain model.
- Avoid new dependencies unless a platform capability cannot be implemented safely with installed Expo modules.
- Split state and action contexts or use focused selectors where it materially reduces unrelated rerenders.
- Memoize derived statistics and stable row components.
- Avoid recreating maps, arrays, handlers, and SVG geometry on timer ticks where possible.
- App startup must not block on noncritical work.
- No remote requests, analytics, account, backend, payments, AI, or notification work is included.

## Error handling

- Persistence read failure: load a safe in-memory state and show one contextual banner.
- Persistence write failure: retain the in-memory action, show a retry-oriented banner, and do not silently claim success.
- Invalid numeric settings: preserve the user's editable draft, show an inline error, and disable Apply until valid.
- Destructive data reset: require an explicit second action in the same sheet and provide no ambiguous wording.
- Timer shorter than the minimum recordable duration: explain inline/transiently that it was not added to statistics.

## Testing strategy

### Automated

- Domain and timer tests remain green.
- Add tests for input normalization, hydration-state selection, week/date formatting, menu reset behavior, and timer foreground recomputation.
- TypeScript and ESLint must pass with zero errors.
- Expo Doctor and Android export remain mandatory.
- Add regression assertions for FOCO identity, Predictive Back enabled, edge-to-edge configuration, and required dependency versions.

### Physical Samsung acceptance

Test on the user's Samsung with Android gesture navigation:

1. Cold open and reopen with persisted data.
2. Switch and reselect all four tabs.
3. Open/close every sheet using tap outside, close control, and Android Back.
4. Create/edit/delete/undo tasks with keyboard open.
5. Create/archive/restore projects.
6. Start, background, resume, pause, stop, and save a timer session.
7. Navigate weeks and statistics tabs.
8. Increase system font size and enable Reduce Motion.
9. Verify status/navigation bars, safe areas, and no covered controls.
10. Inspect narrow and tall phone layouts for clipping and horizontal overflow.

## Acceptance criteria

The block is approved only when:

- no visible control is dead;
- the user never needs to understand implementation details to complete a task;
- keyboard, sheets, back navigation, and safe areas behave consistently;
- the four screens preserve the approved visual direction while feeling denser and more native;
- persisted data appears without a seeded-content flash;
- navigation and primary actions respond immediately;
- all automated checks pass;
- the complete product loop passes on the physical Samsung;
- `main` remains the latest validated preview build.

## Official implementation references

- Android Core app quality: https://developer.android.com/docs/quality-guidelines/core-app-quality
- Android edge-to-edge design: https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge
- Android Predictive Back AEP guidance: https://developer.android.com/distribute/aep/aep-req-predictive-background
- React Native KeyboardAvoidingView: https://reactnative.dev/docs/keyboardavoidingview
- Expo splash and icon guide: https://docs.expo.dev/develop/user-interface/splash-screen-and-app-icon/
- Expo SDK 54 Haptics: https://docs.expo.dev/versions/v54.0.0/sdk/haptics/
- Expo SDK 54 SQLite: https://docs.expo.dev/versions/v54.0.0/sdk/sqlite/
- Apple Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility
- Apple Motion: https://developer.apple.com/design/human-interface-guidelines/motion
