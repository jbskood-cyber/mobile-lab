# Decisiones técnicas

## Expo SDK 54

Se usa SDK 54 durante la fase inicial porque Expo lo recomienda para proyectos que se prueban con Expo Go en un dispositivo físico durante la transición actual a SDK 57.

## Sin backend

La primera fase utiliza únicamente código local. No se incorporan cuentas, sincronización, pagos, APIs externas ni almacenamiento remoto.

## Sin recursos visuales binarios iniciales

La pantalla temporal usa formas y tipografía nativas. Los iconos, tipografías y recursos definitivos de FOCO se incorporarán dentro del bloque visual correspondiente para evitar activos provisionales y dependencias innecesarias.

## Instalación con npm

El repositorio publica el manifiesto de dependencias y CI ejecuta `npm install`. El archivo de bloqueo se incorporará cuando el proyecto se ejecute desde el entorno local canónico, evitando publicar un lockfile generado fuera de ese entorno sin necesidad.
