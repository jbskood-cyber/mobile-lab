# Mobile Lab

Laboratorio móvil para construir **FOCO**, una aplicación de productividad y concentración para Android y, posteriormente, iOS.

## Estado actual

La base técnica está inicializada. La pantalla temporal confirma que React Native, Expo Router y Expo Go funcionan antes de construir las pantallas definitivas.

## Stack

- React Native
- Expo SDK 54
- TypeScript estricto
- Expo Router
- Expo Go como visor inicial
- GitHub como fuente única de verdad

SDK 54 se mantiene temporalmente porque Expo lo recomienda para probar con Expo Go en un teléfono físico durante la transición actual a SDK 57.

## Requisitos

- Node.js 20 LTS o superior
- npm
- Git
- Expo Go instalado en Android
- Computadora y teléfono conectados a la misma red Wi-Fi

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
2. Abre Expo Go en tu Samsung.
3. Pulsa **Scan QR code**.
4. Escanea el código.
5. Confirma que aparezcan “Mobile Lab” y “Entorno móvil funcionando”.

### Si la conexión LAN falla

```bash
npm run start:tunnel
```

El túnel puede tardar más, pero evita muchos bloqueos causados por la red local o el firewall.

## Verificaciones

```bash
npm run typecheck
npm run lint
npx expo-doctor@latest
npx expo export --platform android
```

## Flujo oficial

- **ChatGPT:** guía el producto, define arquitectura y controla el progreso.
- **Constructor en ChatGPT:** implementa y publica cuando dispone de capacidad.
- **GitHub:** fuente única de verdad del código.
- **Entorno local:** ejecuta Metro y permite validar en el teléfono.
- **Expo Go:** visor inicial en el dispositivo físico.

## Política de ramas

- `main`: versión estable y validada.
- `feature/*`: implementación aislada de futuros bloques.
- No usar `force push`.
- No integrar una función sin typecheck, lint y validación disponible.

## Costos

La fase actual no requiere backend, servicios externos ni planes de pago. El costo adicional previsto durante el experimento es **$0 MXN**.
