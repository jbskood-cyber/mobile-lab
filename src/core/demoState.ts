import {
  addRoutine,
  addSession,
  atLocalTime,
  completeTask,
  createInitialState,
  createTask,
  DAY_MS,
  startOfLocalDay,
  type FocoState,
  type TaskDraft,
} from './model';

function addDemoTask(state: FocoState, draft: TaskDraft, timestamp: number) {
  return createTask(state, draft, timestamp);
}

export function createDemoState(now = Date.now()): FocoState {
  const today = startOfLocalDay(now);
  let state = createInitialState(now - 45 * DAY_MS);
  state = {
    ...state,
    projects: state.projects.map((project) => ({
      ...project,
      description: ({
        personal: 'Administración personal y pendientes cotidianos.',
        trabajo: 'Entregas, revisión y mejora del producto.',
        estudios: 'Aprendizaje profundo y práctica deliberada.',
        salud: 'Movimiento, recuperación y energía.',
        ideas: 'Capturas que todavía necesitan estructura.',
      } as Record<string, string>)[project.id] ?? '',
    })),
  };

  const tasks: Array<{ draft: TaskDraft; createdOffset: number; completedOffset?: number }> = [
    {
      draft: { title: 'Revisión semanal y prioridades', projectId: 'personal', priority: 'Alta', plannedStartAt: atLocalTime(today, 7, 30), dueAt: atLocalTime(today, 8, 10), reminderAt: atLocalTime(today, 7, 20), durationMinutes: 40, estimatedPomodoros: 1, firstStep: 'Abrir la lista de pendientes de la semana', notes: 'Elegir máximo tres resultados importantes.', subtasks: ['Vaciar Inbox', 'Revisar atrasadas', 'Elegir tres resultados'], captured: false },
      createdOffset: -6,
    },
    {
      draft: { title: 'Diseñar flujo de onboarding', projectId: 'trabajo', priority: 'Alta', plannedStartAt: atLocalTime(today, 9, 0), dueAt: atLocalTime(today, 11, 0), reminderAt: atLocalTime(today, 8, 50), durationMinutes: 110, estimatedPomodoros: 2, firstStep: 'Dibujar el primer estado vacío', notes: 'Reducir el flujo a activación, primer valor y siguiente acción.', subtasks: ['Mapa del flujo', 'Pantalla inicial', 'Prueba de copy'], inProgress: true, captured: false },
      createdOffset: -8,
    },
    {
      draft: { title: 'Caminar y movilidad de tobillo', projectId: 'salud', priority: 'Media', plannedStartAt: atLocalTime(today, 12, 20), dueAt: atLocalTime(today, 13, 0), durationMinutes: 35, estimatedPomodoros: 1, firstStep: 'Preparar tenis y agua', recurrence: { kind: 'weekdays', interval: 1, fromCompletion: true }, subtasks: ['Movilidad 8 min', 'Caminata 20 min', 'Registrar molestia'], captured: false },
      createdOffset: -12,
    },
    {
      draft: { title: 'Analizar métricas de retención', projectId: 'trabajo', priority: 'Media', plannedStartAt: atLocalTime(today, 15, 0), dueAt: atLocalTime(today, 16, 20), durationMinutes: 70, estimatedPomodoros: 2, firstStep: 'Abrir el embudo de la última semana', notes: 'Comparar activación D0 y retorno D7.', captured: false },
      createdOffset: -5,
    },
    {
      draft: { title: 'Repasar óptica física', projectId: 'estudios', priority: 'Media', dueAt: atLocalTime(today, 20, 30), durationMinutes: 50, estimatedPomodoros: 1, firstStep: 'Resolver el primer problema sin apuntes', subtasks: ['Recuperación activa', 'Dos problemas', 'Anotar dudas'], captured: false },
      createdOffset: -3,
    },
    {
      draft: { title: 'Responder mensajes importantes', projectId: 'personal', priority: 'Baja', durationMinutes: 20, estimatedPomodoros: 1, firstStep: 'Responder el mensaje más antiguo', captured: false, dueAt: atLocalTime(today, 18, 0) },
      createdOffset: -1,
    },
    {
      draft: { title: 'Idea: resumen automático del día', projectId: 'ideas', priority: 'Baja', durationMinutes: 25, estimatedPomodoros: 1, firstStep: 'Escribir por qué sería útil', captured: true, notes: 'Explorar sin convertirlo todavía en funcionalidad.' },
      createdOffset: -1,
    },
    {
      draft: { title: 'Comprar repuesto para cargador', projectId: 'personal', priority: 'Media', durationMinutes: 15, estimatedPomodoros: 1, captured: true },
      createdOffset: -1,
    },
    {
      draft: { title: 'Enviar informe semanal', projectId: 'trabajo', priority: 'Alta', plannedStartAt: atLocalTime(today - DAY_MS, 16, 0), dueAt: atLocalTime(today - DAY_MS, 17, 0), reminderAt: atLocalTime(today - DAY_MS, 15, 50), durationMinutes: 45, estimatedPomodoros: 1, firstStep: 'Reunir avances y bloqueos', captured: false },
      createdOffset: -10,
    },
    {
      draft: { title: 'Preparar presentación de biomateriales', projectId: 'estudios', priority: 'Alta', plannedStartAt: atLocalTime(today + DAY_MS, 10, 0), dueAt: atLocalTime(today + DAY_MS, 12, 0), reminderAt: atLocalTime(today + DAY_MS, 9, 45), durationMinutes: 100, estimatedPomodoros: 2, firstStep: 'Definir la historia de cinco diapositivas', subtasks: ['Estructura', 'Figuras', 'Ensayo'], captured: false },
      createdOffset: -4,
    },
    {
      draft: { title: 'Revisión mensual de finanzas', projectId: 'personal', priority: 'Media', plannedStartAt: atLocalTime(today + 3 * DAY_MS, 18, 0), dueAt: atLocalTime(today + 3 * DAY_MS, 19, 0), reminderAt: atLocalTime(today + 3 * DAY_MS, 17, 45), durationMinutes: 50, estimatedPomodoros: 1, recurrence: { kind: 'monthly', interval: 1, fromCompletion: false }, firstStep: 'Abrir movimientos bancarios', captured: false },
      createdOffset: -20,
    },
    {
      draft: { title: 'Organizar escritorio', projectId: 'personal', priority: 'Baja', plannedStartAt: atLocalTime(today - 2 * DAY_MS, 19, 0), dueAt: atLocalTime(today - 2 * DAY_MS, 19, 30), durationMinutes: 25, estimatedPomodoros: 1, firstStep: 'Retirar objetos que no pertenecen', captured: false },
      createdOffset: -9,
      completedOffset: -2,
    },
    {
      draft: { title: 'Lectura de investigación', projectId: 'estudios', priority: 'Media', plannedStartAt: atLocalTime(today - DAY_MS, 9, 0), dueAt: atLocalTime(today - DAY_MS, 10, 0), durationMinutes: 50, estimatedPomodoros: 1, firstStep: 'Leer resumen y figuras', captured: false },
      createdOffset: -7,
      completedOffset: -1,
    },
  ];

  const createdIds: string[] = [];
  tasks.forEach(({ draft, createdOffset, completedOffset }, index) => {
    const before = new Set(state.tasks.map((task) => task.id));
    state = addDemoTask(state, draft, today + createdOffset * DAY_MS + index * 1000);
    const task = state.tasks.find((item) => !before.has(item.id));
    if (!task) return;
    createdIds.push(task.id);
    if (completedOffset !== undefined) state = completeTask(state, task.id, today + completedOffset * DAY_MS + 18 * 60 * 60 * 1000).state;
  });

  state = addRoutine(state, {
    name: 'Inicio de día consciente',
    projectId: 'personal',
    priority: 'Media',
    notes: 'Rutina breve para empezar sin abrir redes.',
    firstStep: 'Beber agua y abrir FOCO',
    durationMinutes: 20,
    estimatedPomodoros: 1,
    recurrence: { kind: 'weekdays', interval: 1, fromCompletion: true },
    subtasks: ['Agua', 'Revisar agenda', 'Elegir primer bloque'],
    paused: false,
  }, now - 30 * DAY_MS);
  state = addRoutine(state, {
    name: 'Cierre del día',
    projectId: 'personal',
    priority: 'Baja',
    notes: 'Dejar mañana preparado sin planificar en exceso.',
    firstStep: 'Cerrar pestañas y capturar pendientes',
    durationMinutes: 15,
    estimatedPomodoros: 1,
    recurrence: { kind: 'daily', interval: 1, fromCompletion: true },
    subtasks: ['Capturar pendientes', 'Replanificar', 'Elegir primera tarea'],
    paused: false,
  }, now - 25 * DAY_MS);

  const sessionProjects = ['trabajo', 'estudios', 'salud', 'personal'];
  for (let day = 20; day >= 0; day -= 1) {
    if (day % 5 === 0) continue;
    const projectId = sessionProjects[day % sessionProjects.length] ?? 'personal';
    const endedAt = atLocalTime(today - day * DAY_MS, 10 + (day % 5), 20);
    const durationSec = (25 + (day % 3) * 10) * 60;
    state = addSession(state, { projectId, taskId: createdIds[day % Math.max(1, createdIds.length)], mode: 'pomodoro', phase: 'focus', startedAt: endedAt - durationSec * 1000, endedAt, durationSec, plannedSec: durationSec, completed: true, interrupted: false, cycleNumber: 1 + (day % 3) }, endedAt + day);
    if (day % 3 === 0) {
      state = addSession(state, { projectId, mode: 'pomodoro', phase: 'shortBreak', startedAt: endedAt, endedAt: endedAt + 8 * 60 * 1000, durationSec: 8 * 60, plannedSec: 10 * 60, completed: false, interrupted: true, cycleNumber: 1 }, endedAt + day + 1);
    }
  }

  return state;
}
