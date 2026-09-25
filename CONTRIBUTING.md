# Guía de contribución

## Flujo de trabajo

Seguimos el modelo de GitHub Flow:

1. Crear una rama nueva desde `main` con el formato `feature/nombre-modulo`, `fix/descripcion` o `chore/configuracion`.
2. Realizar commits respetando la convención de Conventional Commits.
3. Abrir un Pull Request hacia `main`.
4. Esperar la validación del CI en verde y al menos una aprobación antes del merge.

## Convención de commits

Usamos mensajes claros y legibles, por ejemplo:

- `feat: agrega validación de login`
- `fix: corrige error de carga de reportes`
- `chore: agrega workflow de CI`
- `docs: documenta estrategia de despliegue`

## Reglas de revisión

- Todo cambio debe pasar las pruebas y la validación de tipos.
- Los PRs hacia `main` requieren al menos una revisión.
- Los cambios críticos deben estar explícitamente documentados en la descripción del PR.

## Versionado

Se usa versionado semántico con formato `vX.Y.Z` y se vincula con el número de compilación interno del móvil (`version` y `build` en la configuración de Expo).

## Criterio de entrega

Un cambio está listo cuando:

- el CI pasa en el PR,
- la funcionalidad queda cubierta por pruebas,
- la documentación relevante está actualizada y
- la rama queda actualizada con `main` antes del merge.
