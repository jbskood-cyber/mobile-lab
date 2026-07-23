import { UndoBar } from './UndoBar';
import { useFocoUI } from './FocoUIContext';

export function FocoUndoHost() {
  const { undo, runUndo } = useFocoUI();
  if (!undo) return null;
  return <UndoBar message={undo.message} actionLabel={undo.actionLabel} onAction={runUndo} />;
}
