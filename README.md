# Mobile Lab — FOCO

Aplicación móvil de productividad y concentración construida con React Native y Expo para Android y, posteriormente, iOS.

## Estado actual

FOCO ya cuenta con su primera base de producto:

- sistema visual graphite monocromático;
- navegación inferior entre Hoy, Proyectos, Enfoque y Estadísticas;
- pantalla Hoy interactiva;
- creación rápida de tareas en memoria;
- actualización inmediata de tareas completadas y métricas;
- rutas preparadas para los siguientes módulos.

La persistencia local, el Pomodoro real y las estadísticas completas se incorporarán en bloques posteriores.

## Stack

- React Native 0.81
- Expo SDK 54
- TypeScript estricto
- Expo Router
- Expo Go como visor inicial
- GitHub como fuente única de verdad

## Requisitos

- Node.js 20 LTS o superior
- npm
- Git
- Expo Go instalado en Android
- Computadora y teléfono con acceso a la misma red o al túnel de Expo

## Instalación

```bash
git clone https://github.com/jbskood-cyber/mobile-lab.git
cd mobile-lab
npm install
```

## Ejecutar con Expo Go

```bash
npm run start:lan
```

1. Espera a que Metro muestre el código QR.
2. Abre Expo Go en el Samsung.
3. Pulsa **Scan QR code**.
4. Escanea el código.
5. Mantén la terminal abierta durante la revisión.

### Si la conexión LAN falla

```bash
npm run start:tunnel
```

El túnel evita muchos bloqueos causados por el router o el firewall de Windows.

## Verificaciones

```bash
npm test
npm run typecheck
npm run lint
npx expo-doctor@latest
npx expo export --platform android
```

## Flujo de trabajo

- **ChatGPT:** guía el producto, define arquitectura, implementa bloques autorizados y controla el progreso.
- **GitHub:** fuente única de verdad del código.
- **Entorno local:** baja la rama aprobada, ejecuta Metro y permite validar en el teléfono.
- **Expo Go:** visor inicial en el dispositivo físico.

## Política de ramas

- `main`: versión estable y aprobada.
- `feature/*`: trabajo aislado de cada bloque.
- No usar `force push`.
- No fusionar sin pruebas técnicas y revisión disponible en teléfono.

## Costos

La fase actual no requiere backend, servicios externos ni planes de pago. El costo adicional previsto durante el experimento es **$0 MXN**.