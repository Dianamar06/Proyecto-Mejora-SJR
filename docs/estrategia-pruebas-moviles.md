# Estrategia de pruebas para la aplicación móvil Mejora SJR

## 1. Objetivo

Documentar tipos de pruebas, herramientas, entorno y criterios para validar la
app de ciudadano en React Native y Expo. La estrategia se enfoca en funciones
presentes en el repositorio: autenticación/sesión, navegación, formularios,
comunicación HTTP y selección de imágenes. No supone implementadas funciones
que siguen pendientes de integración.

## 2. Pirámide y tipos de prueba

| Nivel/tipo | Qué valida en esta app | Herramientas recomendadas |
|---|---|---|
| Estático | Tipos, imports, reglas de estilo, errores evidentes | TypeScript (`tsc`), ESLint/Expo lint |
| Unidad | ViewModels/hooks, validaciones, manejo de estados, serialización, servicios con dependencias simuladas | Runner actual `node:test` + `tsx`; Jest + `jest-expo` es una alternativa de migración, no se usa actualmente; React Native Testing Library para componentes |
| Componente/UI | Render, interacción, estados de carga/error y mensajes accesibles | React Native Testing Library; evitar snapshots como único criterio |
| Integración | App/servicio HTTP, persistencia del token, middleware y API en ambiente de prueba | Postman/Newman para API; servidor simulado para fallos/red; dispositivo/emulador |
| End-to-end | Flujos completos desde la UI hasta la respuesta esperada | Maestro para flujos multiplataforma; Detox cuando se necesite automatización nativa sincronizada |
| Manual/compatibilidad | Tamaños de pantalla, teclado, permisos, accesibilidad y comportamiento real del dispositivo | Android Emulator/Android Studio; dispositivo Android; iOS Simulator/Xcode y dispositivo iOS en macOS |
| No funcional | Rendimiento, consumo, seguridad, resiliencia a red y accesibilidad | Android Studio Profiler, Instruments, TalkBack, VoiceOver, Accessibility Inspector y revisión OWASP MASVS/MSTG |

### Herramientas presentes

En `mejora-sjr-mobile/package.json` ya existen:

- `node:test` como runner, ejecutado mediante `tsx`.
- `react-test-renderer` para montar hooks/componentes.
- TypeScript con el comando `npm run typecheck`.
- Expo lint con `npm run lint`.

Los tests móviles actuales se ejecutan con `node:test` a través de `tsx`; los
seis casos añadidos al backend también usan el runner integrado de Node, junto
con `node:assert/strict`. Jest no está configurado en este repositorio y
Supertest no está instalado: se mencionan solo como alternativas futuras para
pruebas de componentes y de integración HTTP. Para métricas LCOV del backend,
el reporter integrado `node --test --experimental-test-coverage
--test-reporter=lcov` escribe el formato que consume SonarQube.
React Native Testing Library permite comprobar interacciones de UI desde la
perspectiva del usuario.

## 3. Aplicación al proyecto

| Módulo/flujo | Nivel mínimo | Escenarios |
|---|---|---|
| Registro e inicio de sesión | Unidad + integración | Campos inválidos, respuesta 401, respuesta exitosa, token ausente/malformado |
| Persistencia/restauración de sesión | Unidad + integración | Token vacío, token válido guardado, error de lectura, cierre de sesión y navegación correspondiente |
| Creación de reporte | Unidad + componente + integración | Obligatorios, latitud/longitud y límites, cero válido, categoría, envío duplicado, error HTTP, éxito |
| Listado y filtros | Unidad + integración | Lista vacía, lista poblada, filtro de estado/categoría, error de servidor, carga |
| Cámara/galería | Unidad + manual en dispositivo | Permiso concedido/denegado, cancelación, selección, limpieza y metadatos del archivo |
| Navegación | Componente + E2E | Acceso público sin sesión, pantallas privadas con sesión, regreso y cierre de sesión |
| Accesibilidad | Manual + componente | Etiquetas, orden de foco, contraste, escalado de texto, TalkBack y VoiceOver |
| Compatibilidad/resiliencia | Manual + E2E | Diferentes tamaños/OS, red lenta/sin conexión/restablecida, app en background/foreground |

### Brecha conocida entre cliente y API

La rama `main` usada como base para la entrega solo expone `GET /api/reportes`;
los flujos móviles de autenticación, creación de reportes y carga de evidencia
no se pueden validar contra la API de esa rama hasta que sus rutas se integren.
La captura de cámara/galería está implementada como selector, pero la subida
multipart a `POST /api/reportes/:id/evidencia` debe validarse cuando el flujo de
integración correspondiente esté conectado.

## 4. Casos manuales E2E prioritarios

1. **Restauración de sesión:** iniciar sesión con una cuenta de pruebas, cerrar
   la app y abrirla de nuevo; la app debe restaurar la sesión sin mostrar Login.
2. **Cierre de sesión:** cerrar sesión, reiniciar la app y comprobar que vuelve
   a Login y que ya no existe token persistido.
3. **Validación del reporte:** enviar el formulario vacío y después coordenadas
   fuera de rango; no debe emitirse la petición.
4. **Reporte válido:** enviar con red disponible y contrato alineado; debe
   mostrarse confirmación y bloquearse el doble envío mientras está cargando.
5. **Fallo de red:** desconectar durante el envío; presentar error comprensible,
   conservar los datos y permitir reintentar sin duplicar la solicitud.
6. **Permisos de imágenes:** probar permiso concedido, denegado y cancelación
   en cámara y galería de un dispositivo físico.
7. **Accesibilidad:** recorrer Login, reporte y selección de evidencia con
   lector de pantalla y tamaño de fuente ampliado.

Registrar para cada ejecución: ID del caso, build/commit, dispositivo y versión
de OS, pasos, resultado esperado/observado, evidencia, severidad y ticket del
defecto. Usar exclusivamente cuentas y datos ficticios.

## 5. Ejecución local actual

Desde `mejora-sjr-mobile/`:

```powershell
npm test
npm run typecheck
npm run lint
```

Para probar en dispositivos, configurar una URL de backend accesible en la red
del dispositivo (`EXPO_PUBLIC_API_URL`) y usar un ambiente no productivo. El
emulador, el simulador y el teléfono pueden requerir direcciones de host
diferentes; `localhost` dentro del móvil no necesariamente es el host del PC.

## 6. Criterios de aprobación y reporte

- Todas las pruebas de unidad y chequeos estáticos pasan.
- Los flujos críticos no tienen defectos abiertos de severidad alta/crítica.
- Los casos E2E de autenticación, reporte y permisos pasan en Android y, cuando
  el equipo disponga de macOS, en iOS.
- No se sustituyen fallos por mocks en pruebas que se reporten como E2E.
- Se conserva evidencia mínima reproducible y no se incluyen credenciales,
  datos personales ni tokens en capturas o logs.
- El resultado documenta explícitamente funcionalidades pendientes de conectar.

## 7. Referencias técnicas

- [Expo: Unit testing with Jest](https://docs.expo.dev/develop/unit-testing/) —
  configuración del preset `jest-expo` para apps Expo.
- [React Native: Testing overview](https://reactnative.dev/docs/testing-overview) —
  análisis estático, separación de lógica y pruebas automatizadas.
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
  — pruebas de componentes e interacciones.
- [Maestro](https://maestro.mobile.dev/) y [Detox](https://wix.github.io/Detox/)
  — automatización E2E móvil.
- [OWASP MASVS](https://mas.owasp.org/MASVS/) — referencia para requisitos y
  verificación de seguridad móvil.
