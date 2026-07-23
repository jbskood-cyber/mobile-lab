export type TaskPriority = 'Alta' | 'Media' | 'Baja';

export type Task = {
  id: string;
  title: string;
  project: string;
  priority: TaskPriority;
  completed: boolean;
  inProgress?: boolean;
};

export type TodayMetrics = {
  pending: number;
  active: number;
  completed: number;
};

const initialTasks: Task[] = [
  {
    id: 'task-objectives-q2',
    title: 'Definir objetivos Q2',
    project: 'Plan maestro',
    priority: 'Alta',
    completed: false,
  },
  {
    id: 'task-review-metrics',
    title: 'Revisar métricas',
    project: 'Plan maestro',
    priority: 'Media',
    completed: false,
    inProgress: true,
  },
  {
    id: 'task-user-research',
    title: 'Investigación de usuarios',
    project: 'Estudios',
    priority: 'Media',
    completed: false,
  },
  {
    id: 'task-onboarding',
    title: 'Diseñar flujo de onboarding',
    project: 'Producto',
    priority: 'Alta',
    completed: false,
  },
  {
    id: 'task-document-api',
    title: 'Documentar API',
    project: 'Personal',
    priority: 'Baja',
    completed: false,
  },
  {
    id: 'task-close-notes',
    title: 'Cerrar notas de ayer',
    project: 'Personal',
    priority: 'Baja',
    completed: true,
  },
];

export function createInitialTasks(): Task[] {
  return initialTasks.map((task) => ({ ...task }));
}

export function getTodayMetrics(tasks: Task[]): TodayMetrics {
  return tasks.reduce<TodayMetrics>(
    (metrics, task) => {
      if (task.completed) {
        metrics.completed += 1;
      } else if (task.inProgress) {
        metrics.active += 1;
      } else {
        metrics.pending += 1;
      }

      return metrics;
    },
    { pending: 0, active: 0, completed: 0 },
  );
}

export function addTask(tasks: Task[], title: string): Task[] {
  const normalizedTitle = title.trim();

  if (!normalizedTitle) {
    return tasks;
  }

  const task: Task = {
    id: `task-${Date.now().toString(36)}-${normalizedTitle.length}`,
    title: normalizedTitle,
    project: 'Personal',
    priority: 'Media',
    completed: false,
  };

  return [task, ...tasks];
}

export function toggleTask(tasks: Task[], id: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) {
      return task;
    }

    const completed = !task.completed;

    return {
      ...task,
      completed,
      inProgress: completed ? false : task.inProgress,
    };
  });
}