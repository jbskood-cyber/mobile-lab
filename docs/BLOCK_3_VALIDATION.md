# FOCO Block 3 — Validación técnica y física

## Alcance

Este bloque combina FOCO Adaptive Day con la maduración visual solicitada:

- apariencia Claro / Oscuro / Sistema;
- Manrope y compactación global;
- Agenda mensual y línea temporal por horas;
- duración, hora de inicio, vencimiento, recordatorio, recurrencia y progreso visibles;
- Inbox, Replan e Impulso;
- capacidad diaria, huecos y sobrecarga;
- rutinas reutilizables;
- datos de demostración ricos;
- copia JSON, restauración validada y CSV;
- diagnóstico local.

## Gate automático obligatorio

- Migración v1/v2 → v3 sin pérdida de proyectos, tareas ni sesiones.
- Recurrencia fija y recurrencia desde completar.
- Replanificación que traslada inicio, vencimiento y recordatorio.
- Inbox, Agenda, calendario, línea temporal, capacidad y huecos.
- Priorización de Impulso.
- Rutinas y prevención de duplicados diarios.
- Copia completa, importación segura y CSV.
- Resolución de tema Claro / Oscuro / Sistema.
- Ausencia de la llamada imperativa a `expo-navigation-bar` que falló en Expo Go.
- Pesos tipográficos portables.
- TypeScript sin errores.
- ESLint sin errores.
- Expo Doctor aprobado.
- Exportación Android aprobada.

## Recorrido físico en Samsung

### Apariencia

1. Cambiar Sistema → Claro → Oscuro.
2. Cerrar y reabrir FOCO; confirmar persistencia.
3. Revisar Hoy, Agenda, Enfoque, Proyectos, Progreso, menús, sheets y detalles en ambos temas.
4. Confirmar contraste, estado activo y ausencia de superficies oscuras residuales en modo Claro.

### Agenda

1. Abrir Calendario, cambiar de mes y seleccionar días con/sin actividad.
2. Confirmar tareas, Pomodoros y actividad en los indicadores diarios.
3. Abrir Día, desplazarse por horas y tocar una hora para crear una tarea.
4. Revisar inicio, duración, vencimiento, proyecto, progreso, recordatorio y repetición.
5. Cambiar a Listas y probar Hoy, Próximas, Inbox, Completadas y Todas.
6. Buscar por título, nota, proyecto, primer paso y subtarea.

### Adaptive Day

1. Confirmar capacidad, minutos libres o sobrecarga en Hoy.
2. Abrir Replan y aplicar cada acción: Hecha, Hoy, Mañana, Fecha, Inbox y Borrar.
3. Verificar que vencimiento y recordatorio acompañen el nuevo bloque.
4. Abrir Impulso, alternar recomendación y probar inicios de 2, 5 y 10 minutos.
5. Minimizar y regresar durante Impulso; confirmar continuidad exacta.

### Inbox y rutinas

1. Capturar varios pendientes sin proyecto ni fecha obligatorios.
2. Planificar una captura para hoy.
3. Crear y editar una rutina.
4. Pausar/reactivar la rutina.
5. Generarla para hoy y confirmar que no se duplique en el mismo día.
6. Completar una rutina configurada “desde completar” y validar la siguiente ocurrencia.

### Datos y diagnóstico

1. Exportar copia JSON y ambos CSV.
2. Restaurar una copia válida.
3. Pegar JSON inválido y confirmar que el estado actual no se reemplace.
4. Revisar número de tareas, sesiones, recordatorios y tamaño local.
5. Cargar demostración y después empezar vacío, usando confirmaciones.

### Densidad y accesibilidad

1. Confirmar más contenido visible que en el Bloque 2 sin targets menores de 44 dp.
2. Probar tamaño de fuente del sistema aumentado.
3. Probar navegación por gestos, Back, teclado y sheets.
4. Confirmar ausencia de desbordamiento horizontal y acciones tapadas.

## Regla de cierre

El bloque puede integrarse a `main` únicamente después del gate automático completo. La aprobación final de experiencia permanece pendiente hasta completar este recorrido en el Samsung. Cualquier regresión física debe corregirse mediante hotfix antes de declarar el producto listo para publicación.
