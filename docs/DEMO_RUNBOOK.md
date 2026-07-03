# Guía rápida de DefenseOS

Puedes usar esta guía para presentar DefenseOS en entrevistas, videos de portfolio o demostraciones breves.

## Objetivo de la demostración

Mostrar un ciclo completo de trabajo en un SOC:

1. Autenticarse
2. Observar la telemetría del host
3. Ver o recibir eventos
4. Comprobar la generación de alertas
5. Actualizar el estado de un incidente

## Lista previa

- Configuración del proyecto completada
- Backend y frontend en ejecución
- Pestañas del navegador listas:
  - panel del frontend
  - documentación de la API en /api/docs
- Usar las credenciales por defecto de admin o una cuenta de analista preparada

## Guion de la demo (5 a 8 minutos)

### Paso 1: Inicio de sesión y orientación

- Abrir el frontend
- Iniciar sesión como admin
- Explicar las áreas del tablero: alertas, eventos, incidentes, métricas, red y procesos

### Paso 2: Visibilidad de métricas

- Abrir la página de métricas
- Mostrar el gráfico en vivo de CPU y memoria
- Abrir las páginas de red y procesos
- Explicar la estrategia para marcar procesos sospechosos

### Paso 3: Flujo de eventos

- Abrir la página de eventos
- Mostrar los filtros por categoría y severidad
- Mencionar el esquema de eventos y el soporte para campos MITRE

### Paso 4: Operaciones con alertas

- Abrir la página de alertas
- Filtrar por estado y severidad
- Cambiar el estado de una alerta de abierta a investigando o resuelta

### Paso 5: Flujo de incidentes

- Abrir la página de incidentes
- Crear un incidente nuevo
- Pasar el estado a en progreso o contenido
- Explicar el uso del ciclo de investigación

## Puntos de narración sugeridos

- Esto es un laboratorio práctico de ingeniería defensiva, no solo una interfaz.
- La correlación convierte eventos ruidosos en alertas útiles.
- El manejo de estados de incidentes se parece a un flujo real de SOC.
- La arquitectura está pensada para ser reproducible y fácil de revisar.

## Demo avanzada opcional

- Generar eventos sintéticos mediante la API
- Mostrar cómo aparecen las alertas resultantes
- Comentar cómo expandir las reglas hacia Sigma o detecciones de un SIEM

## Materiales de cierre

- GIF o video de captura de pantalla de 60 a 90 segundos
- Captura del diagrama de arquitectura
- Sección en el README con resultados medibles y próximos pasos
