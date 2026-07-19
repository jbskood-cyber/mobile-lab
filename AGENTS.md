# AGENTS.md

## Autoridad y fuente de verdad

- ChatGPT guía el proyecto, define el alcance y controla el progreso.
- El constructor autorizado implementa el bloque aprobado.
- GitHub es la única fuente de verdad del código.
- `main` debe permanecer ejecutable.

## Reglas obligatorias

1. No inventar datos, requisitos ni resultados de pruebas.
2. No añadir dependencias sin una necesidad concreta y documentada.
3. Mantener compatibilidad con Android e iOS siempre que el alcance lo permita.
4. No romper compatibilidad con Expo Go mientras siga siendo el visor oficial.
5. No introducir backend, autenticación, pagos, APIs de IA o servicios externos sin aprobación explícita.
6. No incluir secretos, credenciales, certificados ni archivos `.env` reales.
7. No usar `force push` ni reescribir el historial compartido.
8. Usar ramas `feature/*` para los siguientes bloques de producto.
9. Ejecutar typecheck, lint y verificaciones Expo antes de afirmar que una intervención terminó.
10. Registrar el estado real en `docs/PROJECT_STATUS.md`.

## Convenciones técnicas

- TypeScript estricto.
- Expo Router para navegación.
- Componentes pequeños y con responsabilidad clara.
- Diseño mobile-first y respeto por safe areas.
- Evitar datos mock presentados como datos reales.
- No afirmar validación física hasta que el usuario confirme el resultado en su teléfono.
