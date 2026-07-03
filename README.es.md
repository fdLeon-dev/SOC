# DefenseOS

[English](README.md) | [Espanol](README.es.md)

Un proyecto pequeño que construí para explorar cómo se siente un flujo de SOC cuando las piezas están conectadas en lugar de separadas. Toma señales del host, las convierte en eventos, las agrupa en alertas y ayuda a mantener el trabajo de incidentes en un solo lugar.

## Qué hace

La app está pensada para sentirse más como un laboratorio práctico que como un producto pulido. Permite:

- recopilar actividad básica del host y logs
- organizar esas señales en eventos de seguridad
- generar alertas cuando algo destaca
- mantener notas y estado de incidentes en un mismo lugar

## Una mirada rápida

Está diseñada para ser sencilla de seguir. Puedes iniciar sesión, ver cómo se actualiza el tablero, revisar alertas y avanzar en el trabajo de incidentes sin cambiar entre distintas herramientas.

## Cómo correrlo localmente

Si quieres probarlo, la ruta más sencilla es:

```bash
bash scripts/setup.sh
bash scripts/start-dev.sh
```

En Windows:

```bat
scripts\start-dev.bat
```

La app local suele quedar disponible en:

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/api/docs

Inicio de sesión por defecto:

- Usuario: admin
- Contraseña: Admin1234!

## Notas

Este proyecto se hizo como espacio de aprendizaje y práctica para flujos defensivos. No está pensado para reemplazar una solución real de operaciones de seguridad, pero sí sirve para entender mejor cómo encajan las distintas piezas.
