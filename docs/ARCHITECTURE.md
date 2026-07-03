# Arquitectura de DefenseOS

## Flujo general

1. Los servicios del backend recogen logs del sistema y métricas del host.
2. Las señales en bruto se convierten en registros de eventos de seguridad.
3. Las reglas de correlación evalúan esos eventos y crean alertas cuando corresponde.
4. El frontend permite revisar alertas y gestionar incidentes.
5. Las métricas se exponen mediante REST y canales WebSocket.

## Componentes

### Backend

- Punto de entrada: backend/app/main.py
- Rutas de la API: backend/app/api/v1/
- Modelos de dominio: backend/app/models/
- Servicios de negocio: backend/app/services/
- Configuración, seguridad, base de datos y logging: backend/app/core/

### Frontend

- Estructura de rutas: frontend/src/App.jsx
- Estado global de autenticación: frontend/src/lib/AuthContext.jsx
- Cliente de API y endpoints: frontend/src/lib/api.js
- Páginas principales: frontend/src/pages/

## Modelo de seguridad

- Tokens JWT para acceso a la API
- Control de acceso por roles en la capa de dependencias
- Rutas protegidas en el frontend con guardias de autenticación

## Resumen del modelo de datos

- User: autenticación y rol
- SecurityEvent: evento normalizado en bruto
- Alert: elemento accionable derivado de un evento
- Incident: ciclo de investigación, puede agrupar alertas

## Tareas en tiempo de ejecución

### Bucle de monitoreo de logs

- Sigue archivos de logs configurados del host
- Ejecuta reglas simples de triage por palabras clave
- Persiste eventos y dispara la correlación de alertas

### Bucle de difusión de métricas

- Recolecta métricas periódicas del host
- Envía los payloads a los clientes por WebSocket

## Modos de despliegue

### Desarrollo local

- scripts/setup.sh
- scripts/start-dev.sh

### Docker Compose

- docker-compose.yml
- servicio backend en el puerto 8000
- servicio frontend en el puerto 80

## Limitaciones conocidas

- El endpoint de refresh token está documentado, pero no está expuesto en el router de autenticación.
- La barra lateral del frontend incluye una opción de Usuarios, aunque aún no existe la ruta correspondiente.
- El endpoint de métricas por WebSocket no tiene validación explícita de token.

Estos son buenos siguientes pasos para que el proyecto madure un poco más.
