# Diseño: base técnica de Mobile Lab

## Objetivo

Crear una base móvil mínima, profesional y gratuita que pueda ejecutarse en Expo Go desde un Android físico y crecer después hacia Android e iOS.

## Arquitectura

- Expo SDK 54 para compatibilidad inmediata con Expo Go físico.
- Expo Router como punto de entrada y navegación futura.
- TypeScript estricto.
- Una ruta inicial sin dependencias de producto.
- GitHub Actions para verificar tipos, lint y Expo Doctor.

## Pantalla temporal

Una pantalla oscura centrada confirma visualmente:

- Mobile Lab.
- Entorno móvil funcionando.
- React Native + Expo.
- Preparación para construir FOCO.

## Fuera de alcance

- Pantallas finales de FOCO.
- Persistencia.
- Backend.
- Autenticación.
- Pagos.
- Servicios externos.

## Criterios de aceptación

- `npm install` resuelve dependencias.
- TypeScript y ESLint terminan sin errores.
- Expo Doctor aprueba el proyecto.
- Expo exporta el bundle Android.
- Metro inicia y entrega un QR.
- La pantalla puede abrirse con Expo Go.
