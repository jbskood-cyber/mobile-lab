type ReminderTask = {
  id: string;
  title: string;
  notes?: string;
  reminderAt?: number;
  dueAt?: number;
};

export type ReminderRequest = {
  taskId: string;
  title: string;
  body: string;
  date: number;
};

function relativeDueLabel(reminderAt: number, dueAt?: number) {
  if (dueAt === undefined || dueAt <= reminderAt) return 'Es momento de empezar.';
  const minutes = Math.round((dueAt - reminderAt) / 60000);
  if (minutes < 60) return `Vence en ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Vence en ${hours} h`;
  const days = Math.round(hours / 24);
  return `Vence en ${days} d`;
}

export function buildReminderRequest(task: ReminderTask, now = Date.now()): ReminderRequest | null {
  if (task.reminderAt === undefined || !Number.isFinite(task.reminderAt) || task.reminderAt <= now) return null;
  return {
    taskId: task.id,
    title: task.title.trim() || 'Tarea pendiente',
    body: relativeDueLabel(task.reminderAt, task.dueAt),
    date: task.reminderAt,
  };
}
