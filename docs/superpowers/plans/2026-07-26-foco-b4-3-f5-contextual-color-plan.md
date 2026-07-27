# FOCO B4.3F5 Contextual Color & Visual Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish B4.3 with a neutral black/white/gray product shell while using each project's persisted solid color only where it explains identity or recorded time, remove remaining orange/gradient styling, and make Rutinas self-explanatory without redesigning it.

**Architecture:** Keep semantic status colors (`success`, `warning`, `danger`) separate from project identity. Neutralize the generic `accent/accentSoft` tokens so shared controls no longer inherit orange. Project-aware surfaces resolve `Project.color` through `resolveProjectColor(...)` at the UI boundary. Existing domain IDs and session/task shapes stay intact. Analytics may add optional dominant-project metadata only where needed to color aggregate time cells without changing persistence.

**Tech Stack:** React Native 0.81, Expo SDK 54, TypeScript 5.9, existing `projectColors.ts`, Foco theme tokens, current analytics/Agenda domain, Node test runner.

## Global Constraints

- FOCO chrome and primary interaction hierarchy remain black/white/grays.
- No global orange token and no color gradients.
- `success`, `warning`, and `danger` remain semantic status colors; do not repurpose project colors as status.
- Project color is a secondary mark only: icon, dot, thin line/border, progress bar, Agenda block identity, Progreso distribution/session/heatmap identity.
- Do not paint large page/card backgrounds with project colors.
- Do not add an arbitrary HEX picker or new dependency.
- Preserve `FocoState.version = 3`, IDs, backups, notifications, and native configuration.
- Lists remain structurally unchanged.
- Rutinas gets clearer copy/labels only; no new recurrence model.
- Final Samsung review occurs once after all F5 checks are green.

---

### Task 1: Freeze the neutral-shell and no-gradient contract

**Files:**
- Create: `tests/contextual-color.test.cjs`
- Modify later: `src/ui/themeTokens.ts`, `src/features/today/TodayScreen.tsx`, `src/features/stats/StatsScreen.tsx`
- Test: `tests/contextual-color.test.cjs`

- [ ] **Step 1: Write failing contract**

The test must assert:
- old orange literals `#E96712`, `#FF8A2A`, `#FFF0E5`, `#322012` are absent from `themeTokens.ts`;
- `accent`/`accentSoft` remain defined but resolve to neutral black/white/gray-family values;
- no `LinearGradient` or gradient dependency appears under `app/` or `src/`;
- Today recovery surface does not hard-code project color and uses neutral theme tokens;
- Stats project/task distributions accept contextual per-item color rather than one global accent.

- [ ] **Step 2: Run `npm test` → RED**

- [ ] **Step 3: Commit RED contract**

---

### Task 2: Neutralize generic accent tokens and Today chrome

**Files:**
- Modify: `src/ui/themeTokens.ts`
- Modify: `src/features/today/TodayScreen.tsx`
- Test: `tests/contextual-color.test.cjs`

**Interfaces:**
- `accent` stays as a compatibility token, but is neutral: dark theme uses light neutral foreground; light theme uses near-black.
- `accentSoft` becomes a neutral soft surface.
- semantic `danger/warning/success` unchanged.

- [ ] **Step 1: Implement neutral theme accent**

Use existing neutral values already present in each theme rather than inventing a new brand color. Example direction:
- light `accent` = same family as `inverse/text`, `accentSoft` = `panelSoft/panelStrong` neutral;
- dark `accent` = same family as `text/inverse`, `accentSoft` = `panelStrong` neutral.

- [ ] **Step 2: Clean Today recovery/impulse/capacity treatment**

Recovery remains a solid neutral surface/border. Capacity fill and Impulso link use neutral hierarchy unless overload/error semantics apply.

- [ ] **Step 3: Run tests/typecheck/lint → GREEN for Task 1 contract**

- [ ] **Step 4: Commit**

---

### Task 3: Propagate project color through reusable task and Agenda identity

**Files:**
- Modify: `src/features/tasks/TaskRow.tsx`
- Modify: `src/features/today/TodayScreen.tsx`
- Modify: `src/features/agenda/AgendaScreen.tsx`
- Modify: `src/features/projects/ProjectDetailScreen.tsx`
- Modify: `src/features/agenda/AgendaTaskBlock.tsx`
- Modify: `src/features/agenda/AgendaSessionBlock.tsx`
- Modify: `src/features/agenda/DayTimeline.tsx`
- Test: `tests/contextual-color.test.cjs`

**Interfaces:**
- `TaskRow` accepts optional `projectColor` string and uses it for a tiny project marker only.
- `AgendaTaskBlock` accepts `projectColor` and uses it on a thin identity border/time marker; priority remains readable independently.
- `AgendaSessionBlock` accepts `projectColor` and uses it for the existing left identity border.
- Parents resolve `Project.color` with `resolveProjectColor(token, theme.mode)`.

- [ ] **Step 1: Extend source contract test → RED**

Assert the three reusable rows/blocks accept `projectColor`, and callers resolve project tokens.

- [ ] **Step 2: Implement minimal contextual marks**

Keep titles/body neutral. Use project color in small markers only.

- [ ] **Step 3: Run full tests/typecheck/lint → GREEN**

- [ ] **Step 4: Commit**

---

### Task 4: Make Progreso answer “where did the time go?” with project color

**Files:**
- Modify: `src/core/analytics.ts` only if optional aggregate metadata is required
- Modify: `src/features/stats/StatsScreen.tsx`
- Test: `tests/contextual-color.test.cjs`
- Test: existing analytics tests

**Interfaces:**
- Project distribution bars resolve by `projectId`.
- Task distribution bars resolve by the task's `projectId`.
- Recent sessions show a small project-color marker.
- Aggregate trend and Plan-vs-Real remain neutral unless a single project identity is truthfully represented.
- 90-day activity may use the dominant recorded project for each active day; empty cells stay neutral. If analytics adds `dominantProjectId?: string`, it is derived output only, never persisted.

- [ ] **Step 1: Add RED contracts for project/task/session color linkage**

- [ ] **Step 2: Implement project maps and contextual `Distribution` color**

`Distribution` receives `{ id, label, value, color }` items. No global accent fill.

- [ ] **Step 3: Add recent-session markers and truthful heatmap coloring**

Derive dominant project per day from focus duration; ties use deterministic project ID ordering. Preserve accessible labels.

- [ ] **Step 4: Keep aggregate chart/plan neutral**

Trend = aggregate time, so use neutral black/white theme hierarchy rather than a misleading project color.

- [ ] **Step 5: Run full tests/typecheck/lint → GREEN**

- [ ] **Step 6: Commit**

---

### Task 5: Improve Rutinas discoverability without structural redesign

**Files:**
- Modify: `src/features/routines/RoutinesSheet.tsx`
- Test: `tests/contextual-color.test.cjs` or focused `tests/routines-ux.test.cjs`

**Interfaces:**
- Title remains `Rutinas`.
- Subtitle explains the mental model: reusable templates that create tasks on a schedule or on demand.
- The `+` action gets an explicit accessible label and a compact visible cue if space permits; do not add explanatory cards.
- Paused state remains obvious and reversible.

- [ ] **Step 1: Write RED copy/discoverability contract**

Require wording equivalent to “plantillas” + “tareas” and a clear generated-task action label.

- [ ] **Step 2: Implement concise copy**

Suggested direction: `Plantillas que crean tareas recurrentes o cuando las necesitas.` Empty copy: `Define duración, foco y frecuencia; FOCO crea la tarea por ti.`

- [ ] **Step 3: Run tests → GREEN**

- [ ] **Step 4: Commit**

---

### Task 6: Final no-orange/no-gradient audit and full B4.3 closeout gate

**Files:**
- Modify: tests only if a stale source-shape contract contradicts the reviewed product design
- Update: PR #27 body
- Update: Google Sheet ESTADO/REGISTRO/HALLAZGOS as warranted

- [ ] **Step 1: Scan targeted runtime sources**

Assert no old brand-orange literals or gradient usage remain. Project palette may contain warm project colors such as coral/amber; the audit forbids the old *global brand* orange tokens, not legitimate project colors.

- [ ] **Step 2: Full verification**

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor
npx expo export --platform android --output-dir /tmp/foco-b4-3-final-export
```

- [ ] **Step 3: Scope/ancestry audit**

Confirm F5 changes are limited to theme/contextual rendering/analytics derived output/routine copy/tests/plan. No B5, native permission, package, or unrelated architecture change.

- [ ] **Step 4: Mark #27 READY_FOR_REVIEW only after evidence**

Keep #22→#25 unmerged until safe integration order is prepared. Human gate becomes one integrated Samsung smoke pass covering runtime fingerprint, Calendar→Día, 3 Focus modes, subtasks, icon/color identity, capsule navigation, neutral shell, project color propagation, and Rutinas comprehension.

## F5 Completion Gate

- Generic FOCO chrome is neutral, with no old orange brand tokens.
- No color gradients in runtime source.
- Project color is visible but restrained across project/task/Agenda/Progreso/time evidence.
- Aggregate metrics do not misrepresent one project color as the whole.
- Rutinas explains itself in one glance without adding structure.
- Full CI pipeline passes.
- #27 is ready for one integrated Samsung review; no micro-review requested earlier.
