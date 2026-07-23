# FOCO High-Fidelity Visual Rescue Design

## Goal

Replace the rejected generic visual foundation with a faithful Android implementation of the four approved FOCO mockups: Hoy, Proyectos, Enfoque and Estadísticas.

## Visual contract

The four user-supplied images are the visual source of truth. The implementation must preserve their hierarchy, density, proportions and monochrome graphite language rather than merely borrowing their concepts.

### Shared shell

- Near-black background with subtle tonal variation, never flat medium gray.
- Large white page titles and quiet gray secondary copy.
- Thin cool-gray borders, translucent graphite surfaces and restrained white glow only around primary focus controls.
- Four-item bottom navigation fixed above the Android safe area.
- Outline icons with consistent stroke weight.
- Content widths, card radii and vertical rhythm matched across all four screens.
- Touch targets remain at least 44 logical pixels even when the visible control is smaller.

### Hoy

- Compact top toolbar, title and localized date.
- Four-column metric strip.
- Full-width quick-add row.
- Focus card with timer and luminous play control.
- Compact task list matching the five-row mockup.

### Proyectos

- Search field, three filter chips and grouped project rows.
- Project rows contain an icon tile, name, task/time metadata, circular progress and disclosure chevron.
- Archived section remains visually secondary.

### Enfoque

- Pomodoro/stopwatch segmented control.
- Large circular progress timer with restrained glow.
- Previous, pause/play and stop controls.
- Session configuration and today summary cards.

### Estadísticas

- Three-mode segmented header.
- Week selector and three summary metric cards.
- GitHub-style activity heatmap.
- Weekly concentration bar chart.
- Focus distribution donut and legend.

## Technical approach

Use Expo Router JavaScript tabs with a custom tab bar so the Android build can match the supplied design exactly. Use `react-native-svg` for circular progress, charts and the local icon system. Avoid Android BlurView because Expo SDK 54 marks it experimental and warns about performance; use layered translucent surfaces and restrained shadows instead.

## Architecture

- `src/ui/focoTheme.ts`: visual tokens.
- `src/ui/FocoIcon.tsx`: local SVG icon system.
- `src/ui/FocoShell.tsx`: shared screen shell, headers and surfaces.
- `src/ui/FocoTabBar.tsx`: exact custom bottom navigation.
- `src/ui/ProgressRing.tsx`: reusable SVG progress component.
- `src/features/today/TodayScreen.tsx`: rebuilt Hoy.
- `src/features/projects/ProjectsScreen.tsx`: project list.
- `src/features/focus/FocusScreen.tsx`: timer screen.
- `src/features/stats/StatsScreen.tsx`: analytics screen.

## Behavior

- Tabs navigate immediately and preserve route state.
- Quick add inserts a trimmed task at the top.
- Task completion toggles in memory.
- Project filters change the visible grouping.
- Focus segmented control switches labels; the primary control toggles pause/play state.
- Statistics tabs and week arrows update selected state without external services.

## Accessibility and performance

- Every pressable has an accessibility label and role.
- Critical values do not clip at Android font scaling up to 1.15.
- ScrollView is used for the small fixed datasets shown in this prototype; no nested scrolling.
- Decorative SVGs are hidden from accessibility.
- No network calls, backend or paid service.

## Validation

- Existing task-model tests continue passing.
- Add pure tests for project filtering and focus-state helpers.
- Run `npm test`, TypeScript, ESLint, Expo Doctor and Android export.
- Final acceptance requires side-by-side review on the user’s Samsung against all four mockups.
