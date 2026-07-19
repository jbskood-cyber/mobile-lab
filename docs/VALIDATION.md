# Evidencia de validación

## Entorno de construcción

- Scaffold oficial: `create-expo-app` con plantilla `default@sdk-54`.
- Node usado para la validación: v22.16.0.
- npm usado para la validación: 10.9.2.

## Resultados

- `npm install`: dependencias resueltas e instaladas.
- `npm run typecheck`: aprobado, 0 errores.
- `npm run lint`: aprobado, 0 errores.
- `npx expo config --type public`: configuración resuelta correctamente.
- `npx expo install --check`: dependencias declaradas alineadas con SDK 54 usando el mapa local de Expo.
- `npx expo export --platform android --no-minify --no-bytecode --max-workers 2`: aprobado; 962 módulos y bundle Android generado.
- `npx expo start --lan --port 8088`: Metro inició y quedó esperando conexiones en `http://localhost:8088`.

## Expo Doctor

Expo Doctor aprobó 16 de 18 comprobaciones localmente. Las dos comprobaciones restantes requerían acceso a servicios remotos de Expo y no pudieron resolver `exp.host` desde el entorno de construcción. GitHub Actions repite Expo Doctor con conectividad independiente.

## Límite de validación

La ejecución física en Expo Go permanece pendiente hasta que el usuario clone el repositorio, inicie Metro y confirme la pantalla en su Samsung.
