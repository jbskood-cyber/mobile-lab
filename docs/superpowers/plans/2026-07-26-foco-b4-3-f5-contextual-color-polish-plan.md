# FOCO B4.3F5 Contextual Color & Final Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans task-by-task. Keep RED→GREEN evidence.

**Goal:** Finish the reviewed B4.3 visual direction: FOCO chrome becomes truly black/white/gray, project color is propagated only as information about project/time, orange/gradients disappear from global UI, and Rutinas becomes self-explanatory without changing its behavior.

**Architecture:** Keep semantic theme tokens but neutralize `accent`/`accentSoft` so existing generic accent consumers become monochrome. Propagate persisted `Project.color` explicitly only on project-derived data surfaces. Extend analytics points with dominant project identity where a time bucket needs one color. Agenda passes resolved project color into planned and real blocks. No new navigation, store version, package, or native dependency.

**Tech Stack:** React Native 0.81, Expo SDK 54, TypeScript 5.9, existing FocoStore/model/analytics/Agenda/Stats/theme tokens/projectColors, Node test runner.

## Constraints

- Base UI = black/white/grays in light and dark modes.
- No global orange accent and no color gradient.
- Project color is never the only carrier of meaning.
- `success`, `warning`, and `danger` remain semantic status colors and are not repurposed as project colors.
- No category-to-color mapping; always consume each project's persisted token.
- No new persistence fields in F5.
- Lists structure remains unchanged.
- Enfoque layout remains unchanged.
- Rutina semantics remain unchanged.
- No Samsung review until the integrated closeout is fully CI-green.

---

### Task 1: Make global accent monochrome and lock out orange/gradients

**Files:**
- Create/modify: `tests/contextual-color.test.cjs`
- Modify: `src/ui/themeTokens.ts`

- [ ] Write a RED source contract asserting the light/dark `accent` and `accentSoft` tokens are neutral, the old `#E96712/#FF8A2A/#FFF0E5/#322012` values are absent, and no app/src TS/TSX file imports or references `LinearGradient`.
- [ ] Run `npm test` and record expected RED.
- [ ] Change generic accent tokens to monochrome neutrals:
  - light `accent: '#17191D'`, `accentSoft: '#ECEFF3'`
  - dark `accent: '#F6F7F9'`, `accentSoft: '#20242B'`
- [ ] Keep `inverse`, `success`, `warning`, `danger` intact.
- [ ] Run tests/typecheck/lint and commit.

---

### Task 2: Propagate project color through Agenda planned and real time

**Files:**
- Modify: `src/features/agenda/DayTimeline.tsx`
- Modify: `src/features/agenda/AgendaTaskBlock.tsx`
- Modify: `src/features/agenda/AgendaSessionBlock.tsx`
- Modify: `tests/contextual-color.test.cjs`

**Contract:** DayTimeline resolves `Project.color` by project ID and passes a concrete `projectColor` to both task and session blocks. Planned task and real session remain readable in monochrome; color appears only as thin border/time/marker accent.

- [ ] RED test requires `resolveProjectColor`, `project.color`, and `projectColor` plumbing in all three files.
- [ ] Planned block: neutral panel/background, project-colored left border or time marker; priority still has textual/semantic meaning and may use danger status only where already explicit.
- [ ] Real block: neutral panel, project-colored left border; task/project/time text remains neutral.
- [ ] `Real` summary value itself becomes neutral; color belongs to actual session blocks, not a generic global accent.
- [ ] Run full validation and commit.

---

### Task 3: Make Progreso use color as data

**Files:**
- Modify: `src/core/analytics.ts`
- Modify: `src/features/stats/StatsScreen.tsx`
- Modify: `tests/contextual-color.test.cjs`

**Interfaces:**
- `PeriodSeriesPoint` gains optional `dominantProjectId`.
- Heatmap point gains optional `dominantProjectId`.
- `getProjectDistribution` returns `projectColor`.
- `getTaskDistribution` returns `projectId` + `projectColor` where available.
- `getRecentSessions` returns `projectColor`.

Dominance = project with the greatest focus seconds in that bucket; deterministic tie-break by project ID.

- [ ] RED domain test constructs two projects with different colors and overlapping sessions, then asserts dominant project for a period bucket/day and project identity on distributions/recent sessions.
- [ ] Implement pure aggregation in analytics.
- [ ] Stats screen:
  - period selector remains black/white;
  - trend bars use dominant project color, otherwise neutral `theme.colors.text`;
  - Plan frente a ejecución remains monochrome;
  - Por proyecto lines use each project color;
  - Por tarea lines use parent project color;
  - heatmap empty = neutral; active = dominant project color where known, otherwise neutral dark intensity;
  - recent sessions show a small project-colored marker;
  - productive-hours ranking remains monochrome.
- [ ] Run full validation and commit.

---

### Task 4: Neutralize Today recovery styling and clarify Rutinas

**Files:**
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `src/features/routines/RoutinesSheet.tsx`
- Modify: `tests/contextual-color.test.cjs`

- [ ] RED contract: Today recovery surface may not use generic accent fill/border; Rutinas subtitle must explain that a routine creates/reuses recurring tasks and generate-now action must have a visible semantic label or helper, not a mysterious plus alone.
- [ ] Today recovery block: neutral panel/strong border/black chevron; no project color because the queue can contain multiple projects.
- [ ] Rutinas copy: concise language such as `Plantillas que crean tareas repetidas sin volver a configurarlas.` Empty copy explains the same model. Keep pause/reactivate and generate behavior unchanged.
- [ ] Make the generate-now affordance discoverable with accessible visible text where space permits (`Crear hoy`) or a compact label adjacent to the icon. Do not expand the sheet into a tutorial.
- [ ] Run full validation and commit.

---

### Task 5: Integrated F5 gate and closeout audit

**Files:**
- Test: all repository tests
- Update: PR #27 body and Control Operativo only after validation

- [ ] `npm test`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npx expo-doctor`
- [ ] Android export/bundle through CI
- [ ] Compare F4 head→F5 head. Expected files limited to this plan/test, theme tokens, Agenda blocks/timeline, analytics/Stats, Today, Rutinas. No package/native/persistence/navigation changes.
- [ ] Search product sources for legacy orange HEX values and gradient APIs; expect none.
- [ ] Confirm #22→#25 remain unmerged.
- [ ] Mark closeout `READY_FOR_REVIEW`, not DONE, and prepare one Samsung gate covering runtime fingerprint, three focus modes, calendar double tap, out-of-hours real time, project icon/color, subtasks persistence, navigation capsule/sheet, no global orange/gradient, and contextual Progreso colors.

## Completion Gate

F5 is automated-complete when:
- generic UI is monochrome in light/dark;
- project colors appear only on project/time-derived surfaces;
- Agenda planned + real work carry project identity;
- Progreso attributes project colors to distributions/trend/heatmap/recent sessions;
- Today recovery is neutral;
- Rutinas explains itself without semantic changes;
- no legacy orange theme token or gradient API remains in app/src;
- full CI is green.

Only then request one physical Samsung smoke review.