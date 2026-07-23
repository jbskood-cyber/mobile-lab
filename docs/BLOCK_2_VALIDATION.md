# FOCO Block 2 — Validación técnica y física

## Gate automático obligatorio

- Pruebas de dominio v2: tareas, recurrencia, subtareas, proyectos, sesiones y preferencias.
- Migración v1 → v2 sin pérdida de datos.
- Agenda y búsqueda.
- Analítica día/semana/mes, planificación, racha y horas productivas.
- Motor Pomodoro: descanso corto/largo, auto-inicio, modo continuo y timestamps.
- Recordatorios y siguiente ocurrencia recurrente.
- Navegación principal de cinco destinos.
- Seguridad de Expo Go: sin llamadas imperativas a `expo-navigation-bar`.
- Pesos tipográficos portables.
- TypeScript sin errores.
- ESLint sin errores.
- Expo Doctor aprobado.
- Exportación Android aprobada.

## Recorrido físico en Samsung

### Arranque y persistencia

1. Abrir FOCO desde Expo Go con almacenamiento v1 previo.
2. Confirmar migración sin pantalla blanca ni pérdida de tareas/proyectos.
3. Cerrar y reabrir; confirmar persistencia v2.

### Tareas y Agenda

1. Crear una tarea completa con proyecto, fecha, recordatorio, repetición, prioridad, Pomodoros, notas y subtareas.
2. Editarla y confirmar que solo exista un recordatorio programado.
3. Buscarla por título, nota y subtarea.
4. Posponerla, duplicarla y completar la original.
5. Confirmar creación de la siguiente ocurrencia recurrente.
6. Deshacer la finalización.
7. Revisar Hoy, Próximas, Sin fecha y Completadas.
8. Confirmar teclado, fecha/hora y sheets sin controles cubiertos.

### Proyectos

1. Crear y editar un proyecto.
2. Crear tareas desde su detalle.
3. Abrir una tarea y regresar conservando contexto.
4. Iniciar enfoque desde el proyecto.
5. Archivar, deshacer y restaurar.
6. Confirmar métricas de progreso y tiempo.

### Enfoque

1. Seleccionar proyecto y tarea.
2. Configurar enfoque, descansos, descanso largo, ciclos y aviso previo.
3. Probar Pomodoro y cronómetro.
4. Minimizar la app, esperar y volver.
5. Confirmar continuidad exacta sin sesión duplicada.
6. Probar pausa, salto, detención y sesión parcial.
7. Verificar mantener pantalla activa.
8. Probar sonido y vibración activados/desactivados.
9. Confirmar notificaciones locales.

### Progreso

1. Cambiar entre Día, Semana y Mes.
2. Navegar periodos anteriores/siguientes.
3. Confirmar tendencia, plan frente a ejecución, distribuciones y horas productivas.
4. Confirmar actividad de 90 días y sesiones recientes.
5. Revisar periodos vacíos sin desbordes ni datos inventados.

### Accesibilidad y layout

1. Activar navegación por gestos de Android.
2. Probar Back en rutas, teclado y sheets.
3. Aumentar tamaño de fuente del sistema.
4. Activar Reducir movimiento.
5. Confirmar targets táctiles, safe areas, barra inferior y ausencia de overflow horizontal.

## Regla de cierre

El bloque puede fusionarse a `main` después del gate automático. La aprobación visual y funcional del producto permanece pendiente hasta completar este recorrido en el Samsung; cualquier regresión física se corrige en un hotfix antes de aumentar el porcentaje global.
