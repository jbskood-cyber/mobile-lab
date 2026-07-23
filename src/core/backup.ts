import { migrateState } from './migration';
import type { FocoState } from './model';

export type BackupEnvelope = {
  format: 'foco-backup';
  formatVersion: 1;
  exportedAt: number;
  state: FocoState;
};

export type BackupSummary = {
  projects: number;
  tasks: number;
  completedTasks: number;
  sessions: number;
  routines: number;
  exportedAt: number;
};

export function serializeBackup(state: FocoState, exportedAt = Date.now()) {
  const envelope: BackupEnvelope = { format: 'foco-backup', formatVersion: 1, exportedAt, state };
  return JSON.stringify(envelope, null, 2);
}

export function parseBackup(source: string, now = Date.now()): BackupEnvelope {
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    throw new Error('El archivo no contiene JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object') throw new Error('La copia no tiene una estructura válida.');
  const candidate = parsed as Partial<BackupEnvelope>;
  if (candidate.format !== 'foco-backup' || candidate.formatVersion !== 1 || !candidate.state) throw new Error('La copia no pertenece a FOCO o usa un formato incompatible.');
  const state = migrateState(candidate.state, now);
  if (state.projects.length === 0) throw new Error('La copia no contiene proyectos utilizables.');
  return { format: 'foco-backup', formatVersion: 1, exportedAt: typeof candidate.exportedAt === 'number' ? candidate.exportedAt : now, state };
}

export function summarizeBackup(backup: BackupEnvelope): BackupSummary {
  return {
    projects: backup.state.projects.length,
    tasks: backup.state.tasks.length,
    completedTasks: backup.state.tasks.filter((task) => task.completed).length,
    sessions: backup.state.sessions.length,
    routines: backup.state.routines.length,
    exportedAt: backup.exportedAt,
  };
}

export function tasksToCsv(state: FocoState) {
  const rows = [
    ['id', 'title', 'project', 'priority', 'status', 'plannedStartAt', 'dueAt', 'durationMinutes', 'estimatedPomodoros', 'recurrence', 'notes'],
    ...state.tasks.map((task) => [
      task.id,
      task.title,
      state.projects.find((project) => project.id === task.projectId)?.name ?? 'Sin proyecto',
      task.priority,
      task.completed ? 'completed' : task.captured ? 'inbox' : 'open',
      task.plannedStartAt ? new Date(task.plannedStartAt).toISOString() : '',
      task.dueAt ? new Date(task.dueAt).toISOString() : '',
      String(task.durationMinutes),
      String(task.estimatedPomodoros),
      task.recurrence.kind,
      task.notes,
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

export function sessionsToCsv(state: FocoState) {
  const rows = [
    ['id', 'project', 'task', 'mode', 'phase', 'startedAt', 'endedAt', 'durationSeconds', 'completed', 'interrupted'],
    ...state.sessions.map((session) => [
      session.id,
      state.projects.find((project) => project.id === session.projectId)?.name ?? 'Sin proyecto',
      state.tasks.find((task) => task.id === session.taskId)?.title ?? '',
      session.mode,
      session.phase,
      new Date(session.startedAt).toISOString(),
      new Date(session.endedAt).toISOString(),
      String(session.durationSec),
      String(session.completed),
      String(session.interrupted),
    ]),
  ];
  return rows.map((row) => row.map(csvCell).join(',')).join('\n');
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
