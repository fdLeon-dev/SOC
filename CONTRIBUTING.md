# Contribuir

Gracias por colaborar con DefenseOS.

## Configuración para desarrollar

1. Ejecuta el script de instalación:

```bash
bash scripts/setup.sh
```

2. Inicia el entorno local:

```bash
bash scripts/start-dev.sh
```

## Revisiones locales antes de abrir un PR

### Pruebas del backend

```bash
cd backend
.venv/bin/python -m pytest tests -v
```

### Build del frontend

```bash
cd frontend
npm run build
```

## Expectativas para pull requests

- Mantén el alcance del PR enfocado
- Explica el impacto de seguridad en la descripción
- Añade o actualiza pruebas si cambias comportamiento
- Actualiza la documentación cuando cambien endpoints o pasos de instalación

## Estilo de código

- Backend: sigue los patrones existentes de FastAPI y SQLAlchemy async
- Frontend: mantén consistentes los guardias de rutas y la capa de API
- Evita añadir dependencias sin revisar si están justificadas

## Seguridad y ética

Este proyecto es defensivo y educativo.

No añadas payloads ofensivos, lógica de escaneo no autorizada ni valores por defecto inseguros en ejemplos compartidos.
