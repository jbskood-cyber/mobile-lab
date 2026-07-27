# FOCO B4.3 F2 Project → Task → Subtask UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: use superpowers:test-driven-development for every behavior change and superpowers:verification-before-completion before declaring this slice complete.

**Goal:** Expose FOCO's already-persisted subtasks directly inside Project detail as a clean three-level hierarchy: Project → expandable Task → Subtask, with a one-step inline add flow and individual completion.

**Architecture:** Do not change the persisted subtask model. `Task.subtasks`, `addSubtask`, `toggleSubtask`, and `deleteSubtask` already exist in `FocoState v3` and `FocoStore`. Add a focused `ProjectTaskAccordion` presentation component and wire it from `ProjectDetailScreen`. Keep full task detail/edit navigation available as a secondary action. No nesting below subtasks.

**Tech Stack:** React Native, Expo Router, existing `FocoStore`, Instrument Sans, `FocoIcon`, current press/haptic primitives.

## Constraints

- No state-version bump or migration.
- No new package/native dependency.
- Preserve existing task IDs, subtask IDs, reminders and completion semantics.
- Parent task does not auto-complete just because every subtask becomes complete.
- Subtasks never contain children.
- Project detail remains compact when tasks are collapsed.
- Inline add requires non-empty trimmed text, clears after success, and keeps the parent task expanded.
- Full task detail remains reachable.

---

### Task 1: Lock the existing domain contract

**Files:**
- Create: `tests/project-hierarchy.test.cjs`

- [ ] RED/GREEN-proof the existing model behavior as an invariant: create a task, add two subtasks, toggle one, delete one, and assert the parent task ID/project ID remain unchanged and subtask IDs are distinct.
- [ ] Assert `Subtask` has no child/subtask field in the serialized object.
- [ ] Run `npm test`; these domain assertions should already pass. If they do, they are characterization tests, not a TDD RED. The production RED begins in Task 2.

### Task 2: Define the expandable project-task UI contract (RED)

**Files:**
- Modify: `tests/project-hierarchy.test.cjs`
- Create later: `src/features/projects/ProjectTaskAccordion.tsx`

- [ ] Add source-contract assertions that fail until the component exists:
  - component renders subtask progress `completed/total`;
  - has accessible disclosure state (`accessibilityState={{ expanded }}`);
  - has `+ Añadir subtarea` entry;
  - has a `TextInput` for inline add only in add mode;
  - calls `onToggleSubtask(task.id, subtask.id)`;
  - calls `onAddSubtask(task.id, draft.trim())`;
  - provides `Abrir detalles` as a separate secondary action;
  - uses no recursive `ProjectTaskAccordion` rendering.
- [ ] Verify CI RED because component is absent.

### Task 3: Implement `ProjectTaskAccordion` (GREEN)

**Files:**
- Create: `src/features/projects/ProjectTaskAccordion.tsx`

Component props:

```ts
{
  task: Task;
  projectName: string;
  completedPomodoros?: number;
  expanded: boolean;
  onToggleExpanded: () => void;
  onToggleTask: () => void;
  onOpenDetails: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
}
```

Collapsed row:
- task checkbox;
- title + metadata;
- subtask progress `n/m` when any subtasks exist;
- chevron reflecting expansion.

Expanded body:
- existing subtasks as simple checkbox rows, indented one visual level;
- `+ Añadir subtarea` quiet action;
- when add mode active, one compact `TextInput`, `Cancelar`, `Agregar`;
- `Abrir detalles` secondary action for the full task screen.

Use neutral FOCO surfaces only; project contextual color belongs to F3/F5, not this slice.

- [ ] Implement minimal UI.
- [ ] Verify `npm test` and `npm run typecheck` GREEN.

### Task 4: Wire Project detail to existing store actions (RED→GREEN)

**Files:**
- Modify: `tests/project-hierarchy.test.cjs`
- Modify: `src/features/projects/ProjectDetailScreen.tsx`

- [ ] RED assertions require `ProjectDetailScreen` to consume `addSubtask` and `toggleSubtask`, maintain an expanded-task ID set/state, and render `ProjectTaskAccordion` for pending tasks.
- [ ] Verify RED.
- [ ] Wire store actions already present in `useFocoStore`.
- [ ] Replace pending `TaskRow` mapping with `ProjectTaskAccordion`.
- [ ] Keep completed section conservative; it may use the accordion too if it does not add noise, otherwise preserve current TaskRow for completed tasks.
- [ ] Expansion state is UI-only and need not persist across app restarts.
- [ ] Verify GREEN.

### Task 5: Accessibility and interaction polish

**Files:**
- Modify: `src/features/projects/ProjectTaskAccordion.tsx`
- Modify: `tests/project-hierarchy.test.cjs`

- [ ] RED contract for accessible labels/state on disclosure, subtask checkboxes, add input/action.
- [ ] Ensure minimum comfortable touch targets and keyboard submit (`returnKeyType="done"`, `onSubmitEditing`).
- [ ] Do not add routine navigation haptics; use meaningful haptic success only after adding/completing if existing project screen policy supports it.
- [ ] Verify GREEN.

### Task 6: Full F2 validation

Run the repository gate through CI:

- `npm test`
- `npm run typecheck`
- `npm run lint`
- `npx expo-doctor`
- Android export/bundle

Compare against F1 head `1da67e7f014b9bcb397b615d1d3cee228d4abe3e`. Expected F2 scope: the plan, `ProjectTaskAccordion`, `ProjectDetailScreen`, and focused tests only. No model/store/migration/package/native changes.

Keep PR #27 draft. Do not request Samsung review yet; proceed to F3 if CI is green.
