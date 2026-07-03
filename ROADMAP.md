# Hoja de ruta

Esta hoja de ruta está pensada para mejorar el impacto del proyecto y su madurez técnica.

## v0.2 - Calidad de detección y completitud de la API

- Añadir el endpoint de refresh de autenticación y el flujo de rotación de tokens
- Añadir la ruta de Usuarios y una interfaz para gestión de usuarios admin
- Añadir trazabilidad de cambios de estado en alertas e incidentes
- Añadir metadatos de paginación en los listados

## v0.3 - Mayor profundidad en correlación y respuesta

- Añadir paquetes de reglas por tipo de fuente (auth, network, process, file)
- Añadir deduplicación y ventanas de enfriamiento para alertas ruidosas
- Añadir timeline de incidentes y notas del operador
- Añadir opciones de exportación para reportes de incidentes

## v0.4 - Endurecimiento y preparación para producción

- Añadir autenticación y validación de conexión en WebSocket
- Añadir defaults seguros según el entorno
- Añadir logging estructurado para acciones sensibles
- Añadir configuraciones más estrictas de CORS/hosts y perfiles de despliegue

## v0.5 - Excelencia para portfolio

- Publicar activos del diagrama de arquitectura en docs/media
- Añadir escenarios de benchmark y resultados medibles de detección
- Añadir gates de calidad en CI (lint, tests, chequeos básicos de seguridad)
- Etiquetar notas de release con hitos técnicos relevantes
