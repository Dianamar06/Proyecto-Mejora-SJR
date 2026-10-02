# Práctica: Herramientas de automatización de pruebas

## Proyecto integrador: Mejora SJR

**Unidad II — Tema I**

| Dato | Información |
|---|---|
| Institución | ______________________________________________ |
| Asignatura | ______________________________________________ |
| Docente | Héctor Saldaña Benítez |
| Integrantes del equipo | ______________________________________________ |
| Grupo | ______________________________________________ |
| Fecha de entrega | ______________________________________________ |

---

## Índice

1. [Introducción](#1-introducción)
2. [Objetivos](#2-objetivos)
3. [Descripción del sistema y alcance](#3-descripción-del-sistema-y-alcance)
4. [Plan de pruebas de la API REST](#4-plan-de-pruebas-de-la-api-rest)
5. [Casos de prueba con patrón AAA](#5-casos-de-prueba-con-patrón-aaa)
6. [Automatización y ejecución de las pruebas API](#6-automatización-y-ejecución-de-las-pruebas-api)
7. [Quality Gate en SonarQube Cloud](#7-quality-gate-en-sonarqube-cloud)
8. [Pruebas para aplicaciones móviles](#8-pruebas-para-aplicaciones-móviles)
9. [Herramientas seleccionadas](#9-herramientas-seleccionadas)
10. [Casos de aceptación móvil](#10-casos-de-aceptación-móvil)
11. [Resultados y limitaciones](#11-resultados-y-limitaciones)
12. [Conclusiones](#12-conclusiones)
13. [Referencias](#13-referencias)

## 1. Introducción

Mejora SJR es un sistema para registrar y consultar reportes ciudadanos de
incidencias urbanas. Su solución integra una API REST desarrollada con
Node.js/Express, una aplicación móvil construida con React Native y Expo, y un
panel web administrativo con Next.js.

Esta práctica presenta un plan de pruebas para la API, seis casos automatizados
con el patrón AAA (Arrange, Act, Assert; Preparar, Actuar y Verificar), una
propuesta de Quality Gate en SonarQube Cloud y una estrategia de pruebas para la
aplicación móvil.

> **Nota académica:** la presentación del Tema I de la Unidad II no se encuentra
> en el repositorio. Se recomienda comparar los conceptos y umbrales de este
> documento con la presentación de clase antes de entregarlo.

## 2. Objetivos

### Objetivo general

Definir y aplicar una estrategia de calidad que permita verificar el
comportamiento de la API REST y establecer pruebas apropiadas para la aplicación
móvil de Mejora SJR.

### Objetivos específicos

- Diseñar un plan de pruebas para operaciones representativas de la API.
- Automatizar al menos cinco casos de prueba aplicando AAA; se implementaron
  seis.
- Establecer condiciones de aprobación para un Quality Gate.
- Identificar tipos de pruebas y herramientas adecuadas para aplicaciones
  móviles.
- Registrar las limitaciones de integración y distinguir pruebas unitarias de
  pruebas de integración y extremo a extremo.

## 3. Descripción del sistema y alcance

### 3.1 Componentes

| Componente | Tecnología | Responsabilidad |
|---|---|---|
| API REST | Node.js, Express, JavaScript | Validar solicitudes, autenticar usuarios y atender operaciones de reportes |
| Aplicación móvil | React Native, Expo, TypeScript | Permitir al ciudadano iniciar sesión, capturar y consultar información |
| Panel administrativo | Next.js, TypeScript | Interfaz web de administración y consulta |
| Persistencia | SQL Server, acceso desde backend | Guardar y consultar usuarios y reportes |
| Evidencias | Servicio de almacenamiento configurado en backend | Guardar imágenes y asociarlas a reportes |

Los clientes se comunican con el backend mediante HTTP/JSON. La aplicación
móvil y el panel no deben acceder directamente a la base de datos.

### 3.2 Endpoints incluidos en el plan

| Método y ruta | Propósito | Acceso definido actualmente |
|---|---|---|
| `POST /api/usuarios` | Registrar ciudadano | Público |
| `POST /api/auth/login` | Autenticar y obtener JWT | Público |
| `POST /api/reportes` | Crear reporte | Público en el router actual |
| `POST /api/reportes/:id/evidencia` | Subir evidencia usando multipart y el campo `evidencia` | Público en el router actual |
| `GET /api/reportes` | Listar y filtrar reportes | Requiere JWT |
| `PUT /api/reportes/:id/estado` | Actualizar estado | Requiere JWT con `IdRol = 3` |

El acceso marcado como público refleja el montaje actual de rutas observado en
el código; debe revisarse con el equipo antes de desplegar a producción.

### 3.3 Incluido y excluido

**Incluido:** validaciones del controlador, formato de respuesta, códigos HTTP,
delegación al servicio, pruebas aisladas con dobles de prueba, calidad estática
y análisis automatizado.

**Excluido de los casos unitarios:** conexión real a SQL Server, credenciales
reales, servicio real de almacenamiento y autorización del ambiente productivo.
Esos elementos requieren un ambiente de integración aislado.

## 4. Plan de pruebas de la API REST

### 4.1 Estrategia

1. **Unidad del controlador:** verificar validaciones y respuestas HTTP sin
   conectar con base de datos; sustituir el servicio por una implementación
   simulada.
2. **Integración HTTP:** iniciar el backend con una base de datos y servicios
   exclusivos de pruebas; cubrir rutas, middleware, consultas y serialización.
3. **Aceptación manual o automatizada:** usar Postman/Insomnia para preparar y
   revisar solicitudes; utilizar Newman si se automatiza una colección de
   Postman en CI.
4. **Análisis estático:** analizar los directorios fuente del backend, móvil y
   panel web mediante SonarQube Cloud.

### 4.2 Ambiente y datos

- Node.js y npm en versiones compatibles con los proyectos.
- Ambiente de pruebas separado de producción.
- Usuario, categorías y reportes semilla ficticios para integración.
- Variables de conexión y `JWT_SECRET` propios del ambiente de pruebas.
- No guardar contraseñas, tokens, datos personales ni llaves en el repositorio.
- Registrar commit, fecha, ambiente, resultado esperado, resultado obtenido y
  evidencia sin secretos.

### 4.3 Riesgos y dependencias

- Una base de datos o almacenamiento fuera de servicio puede impedir pruebas de
  integración; no afecta la ejecución de pruebas unitarias con stubs.
- El cliente móvil documenta la omisión de `IdUsuario` al crear un reporte,
  mientras que el controlador del backend lo necesita y actualmente puede
  asignar temporalmente el valor `1`. El contrato debe alinearse antes de
  aprobar el flujo móvil completo.
- La autorización de creación de reportes y subida de evidencia debe confirmarse
  con el equipo; el router actual no aplica middleware de autenticación a esas
  rutas.

## 5. Casos de prueba con patrón AAA

Los seis casos están automatizados en
[`mejora-sjr-backend/tests/ReporteController.test.js`](../mejora-sjr-backend/tests/ReporteController.test.js).
En cada uno, **Arrange** prepara el controlador, la solicitud y el servicio
simulado; **Act** ejecuta el método del controlador; **Assert** comprueba el
resultado observable y, cuando corresponde, que el servicio no se invoque.

### API-01 — Crear reporte sin campos requeridos

- **Endpoint/operación:** `POST /api/reportes`
- **Arrange:** preparar un body incompleto que solo contenga `Titulo` y un
  servicio simulado que registre si fue invocado.
- **Act:** ejecutar `crearReporte(req, res)`.
- **Assert:** verificar HTTP 400, `success: false`, que el mensaje indique un
  campo faltante y que el servicio no haya sido invocado.
- **Resultado esperado:** la solicitud inválida se rechaza en el controlador.

### API-02 — Crear reporte con coordenada no numérica

- **Endpoint/operación:** `POST /api/reportes`
- **Arrange:** preparar todos los campos obligatorios, con `UbicacionLatitud`
  como texto, y un servicio simulado.
- **Act:** ejecutar `crearReporte(req, res)`.
- **Assert:** verificar HTTP 400, mensaje de coordenadas numéricas y que el
  servicio no haya sido invocado.
- **Resultado esperado:** las coordenadas no numéricas se rechazan.

### API-03 — Crear reporte válido

- **Endpoint/operación:** `POST /api/reportes`
- **Arrange:** preparar título, descripción, coordenadas numéricas, categoría e
  identificador de usuario. Configurar el servicio para devolver el reporte con
  `IdReporte: 23`.
- **Act:** ejecutar `crearReporte(req, res)`.
- **Assert:** verificar HTTP 201, `success: true`, que la respuesta contenga
  `IdReporte: 23` y que el servicio haya recibido el usuario esperado.
- **Resultado esperado:** la creación se confirma con el reporte devuelto por
  el servicio.

### API-04 — Actualizar estado con identificador inválido

- **Endpoint/operación:** `PUT /api/reportes/:id/estado`
- **Arrange:** preparar `id=abc`, un estado válido y un servicio simulado con
  indicador de invocación.
- **Act:** ejecutar `actualizarEstado(req, res)`.
- **Assert:** verificar HTTP 400, mensaje de identificador entero inválido y
  que el servicio no haya sido invocado.
- **Resultado esperado:** un ID inválido se rechaza antes de acceder al servicio.

### API-05 — Actualizar estado sin proporcionar estado

- **Endpoint/operación:** `PUT /api/reportes/:id/estado`
- **Arrange:** preparar `id=23`, body vacío y un servicio simulado.
- **Act:** ejecutar `actualizarEstado(req, res)`.
- **Assert:** verificar HTTP 400, mensaje que indique que el estado es requerido
  y que el servicio no haya sido invocado.
- **Resultado esperado:** la solicitud incompleta se rechaza.

### API-06 — Actualizar estado correctamente

- **Endpoint/operación:** `PUT /api/reportes/:id/estado`
- **Arrange:** preparar `id=23`, `IdEstado: 3` y un servicio simulado que devuelva
  esos datos.
- **Act:** ejecutar `actualizarEstado(req, res)`.
- **Assert:** verificar HTTP 200, `success: true`, llamada al servicio con
  `(23, 3)` y datos correctos en la respuesta.
- **Resultado esperado:** el controlador delega la actualización y devuelve el
  reporte actualizado.

### 5.1 Casos de integración complementarios

| ID | Solicitud | Resultado esperado |
|---|---|---|
| INT-01 | Login con credenciales de prueba válidas | HTTP 200, token presente y usuario sin hash de contraseña |
| INT-02 | Login con contraseña incorrecta | HTTP 401 y sin token |
| INT-03 | `GET /api/reportes` sin token | HTTP 403 |
| INT-04 | `GET /api/reportes?estado=1&categoria=1` con JWT válido | HTTP 200, `data` es arreglo y los filtros son aplicados |
| INT-05 | `PUT /api/reportes/23/estado` sin rol 3 | HTTP 403 y sin actualización |
| INT-06 | Subida de evidencia sin archivo `evidencia` | HTTP 400 |
| INT-07 | Crear reporte con categoría inexistente | HTTP 400 y no se crea registro |

Estos casos requieren datos y servicios de prueba configurados y no son
sustituidos por los seis casos unitarios.

## 6. Automatización y ejecución de las pruebas API

### 6.1 Herramientas

- **Node.js `node:test`:** ejecuta las pruebas automatizadas incluidas con Node.
- **`node:assert/strict`:** comprueba resultados esperados.
- **Stubs/servicios simulados:** aíslan la lógica del controlador para que las
  pruebas no requieran base de datos.
- **Postman o Insomnia:** preparan solicitudes HTTP para pruebas manuales.
- **Newman:** puede ejecutar colecciones Postman en CI cuando se agreguen.
- **GitHub Actions:** ejecuta pruebas en cada push/PR configurado.

### 6.2 Comando

Desde PowerShell, en la raíz del proyecto:

```powershell
npm --prefix .\mejora-sjr-backend test
```

También puede ejecutarse entrando primero a la carpeta del backend:

```powershell
cd .\mejora-sjr-backend
npm test
```

No se ejecuta `npm test` desde la raíz del monorepo, porque allí no existe un
`package.json`.

### 6.3 Cobertura para SonarQube

Desde `mejora-sjr-backend`, ejecutar `npm run test:coverage`. El comando vuelve
a ejecutar los seis casos y genera `lcov.info` con el reporter integrado de
Node. El archivo se ignora en Git y SonarQube lo lee desde la ruta configurada
en [`sonar-project.properties`](../sonar-project.properties).

## 7. Quality Gate en SonarQube Cloud

### 7.1 Propósito

El Quality Gate establece condiciones mínimas de calidad para aprobar un
análisis. La propuesta utiliza métricas de código nuevo, de modo que el equipo
pueda controlar cambios recientes sin atribuir defectos antiguos a una entrega
nueva.

### 7.2 Condiciones propuestas

| Métrica en código nuevo | Criterio de aprobación |
|---|---:|
| Bugs nuevos | 0 |
| Vulnerabilidades nuevas | 0 |
| Hotspots de seguridad revisados | 100 % |
| Calificación de confiabilidad | A |
| Calificación de seguridad | A |
| Calificación de mantenibilidad | A |
| Cobertura de código nuevo | >= 80 % |
| Líneas duplicadas nuevas | <= 3 % |

El workflow genera un reporte LCOV nativo de Node y SonarQube está configurado
para leerlo. El valor de cobertura y el cumplimiento del umbral se confirman en
el análisis del PR; la existencia del reporte por sí sola no significa que se
haya aprobado ese criterio.

### 7.3 Configuración técnica del análisis

El proyecto contiene:

- [`sonar-project.properties`](../sonar-project.properties): define la project
  key `Dianamar06_Proyecto-Mejora-SJR`, nombre del proyecto y directorios fuente
  y de pruebas.
- [`sonarcloud.yml`](../.github/workflows/sonarcloud.yml): ejecuta las pruebas
  del backend, la verificación de tipos móvil, SonarQube Cloud y espera el estado
  del Quality Gate.

El workflow se activa con pushes a `main` o `sP3`, pull requests hacia esas
ramas y ejecución manual.

### 7.4 Activación en las cuentas

El repositorio ya tiene configurados el secret `SONAR_TOKEN` y la variable
`SONAR_ORGANIZATION` en GitHub Actions. El valor del token no se guarda en el
código ni en esta documentación. El análisis del PR #4 hacia `main` pasó el
gate predeterminado **Sonar way**, pero la página indicó que no había suficientes
líneas nuevas para calcular cobertura. Ese resultado no confirma los umbrales
propuestos ni representa un análisis del cambio dirigido a `sP3`. La ejecución
del PR a `sP3` debe revisarse en Actions y en SonarQube Cloud. Las condiciones
de la sección 7.2 siguen siendo una propuesta hasta crear y asignar un gate
personalizado.

## 8. Pruebas para aplicaciones móviles

Las pruebas móviles deben cubrir tanto la lógica como el funcionamiento en
dispositivos reales o emulados. Se recomienda una pirámide: muchas pruebas de
unidad rápidas, pruebas de integración selectivas y un conjunto reducido de
flujos E2E.

| Tipo de prueba | Qué verifica en Mejora SJR | Ejemplos |
|---|---|---|
| Análisis estático | Tipos, imports y errores de estilo | TypeScript, ESLint/Expo lint |
| Unidad | Lógica de ViewModels y servicios simulados | Validaciones del formulario, sesión y respuestas HTTP |
| UI/componente | Render e interacciones desde la perspectiva del usuario | Estados de carga, errores y botones |
| Integración | Interacción entre app, almacenamiento, red y backend de prueba | Restaurar JWT y consumir endpoint |
| Extremo a extremo (E2E) | Flujo real por la interfaz | Iniciar sesión, crear reporte y confirmar respuesta |
| Manual/compatibilidad | OS, resolución, teclado, permisos y hardware | Cámara, galería y GPS en Android/iOS |
| Accesibilidad | Navegación asistida, etiquetas y escalado de texto | TalkBack, VoiceOver y contraste |
| No funcional | Rendimiento, seguridad, resiliencia y consumo | Red intermitente, perfil de memoria y OWASP MASVS |

## 9. Herramientas seleccionadas

| Herramienta | Uso |
|---|---|
| `node:test` + `tsx` | Pruebas de unidad existentes para hooks/ViewModels y servicios móviles |
| TypeScript (`tsc`) | Verificación estática de tipos, ejecutada mediante `npm run typecheck` |
| Expo lint / ESLint | Reglas de estilo y detección de errores comunes (`npm run lint`) |
| React Native Testing Library | Alternativa recomendada para verificar componentes e interacciones de UI |
| Jest + `jest-expo` | Alternativa de runner con configuración de mocks del entorno Expo |
| Postman / Newman | Pruebas manuales o automatizadas de la API |
| Maestro o Detox | Automatización de flujos E2E en emuladores/dispositivos |
| Android Studio Emulator | Validación de Android y diferentes resoluciones |
| Xcode Simulator | Validación de iOS; requiere macOS |
| Android Studio Profiler / Instruments | Rendimiento, CPU y memoria |
| TalkBack / VoiceOver | Accesibilidad con lector de pantalla |

Se debe evitar instalar dos runners con el mismo propósito sin una decisión
del equipo. Para cámara, GPS y permisos, incluir pruebas manuales en dispositivos
físicos porque un mock no demuestra la integración con hardware.

## 10. Casos de aceptación móvil

| ID | Preparación y acción | Resultado esperado |
|---|---|---|
| MOB-01 | Iniciar sesión con cuenta ficticia, cerrar completamente y reabrir la app | La sesión se restaura y se muestra la pantalla privada |
| MOB-02 | Cerrar sesión y reiniciar | Se elimina el token y se muestra Login |
| MOB-03 | Enviar formulario vacío o coordenadas fuera de rango | Se muestra validación y no se envía solicitud |
| MOB-04 | Enviar reporte válido con red disponible y contrato API alineado | Se muestra confirmación y se bloquea el doble envío durante la carga |
| MOB-05 | Interrumpir la red durante el envío | Se muestra error entendible, se conservan datos y se permite reintentar |
| MOB-06 | Probar cámara y galería con permisos concedidos, denegados y cancelación | Se conserva o selecciona la imagen correctamente y se informa el estado |
| MOB-07 | Recorrer Login y formulario mediante lector de pantalla y texto ampliado | Los controles tienen etiquetas y orden de foco comprensible |

Registrar build/commit, modelo del dispositivo, sistema operativo, pasos,
resultado, evidencia y defectos. Usar cuentas y datos ficticios.

## 11. Resultados y limitaciones

### Verificación realizada en el entorno local

- Los seis casos AAA del backend pasaron con `npm test`.
- El chequeo TypeScript móvil pasó con `npm run typecheck`.
- La instalación de dependencias móviles reportó que el Node local (20.18.0)
  está por debajo del mínimo requerido por algunas dependencias Metro
  (`20.19.4`); se recomienda actualizar Node antes de ejecutar el conjunto móvil.
- Una ejecución directa de las pruebas móviles con el runner Node produjo
  errores al cargar módulos nativos de Expo/React Native. No se reporta el
  conjunto móvil como aprobado.
- `npm run test:coverage` genera el reporte LCOV con Node y el workflow lo
  entrega a SonarQube Cloud. En el análisis del PR #4 hacia `main`, Sonar way
  pasó, pero la cobertura no pudo calcularse por falta de líneas nuevas; esa
  ejecución no sustituye la verificación del PR dirigido a `sP3`.
- El gate personalizado de la sección 7.2 aún debe configurarse y asignarse;
  **Sonar way Passed** no demuestra que se cumplan todos esos umbrales.
- Las pruebas de integración con SQL Server, API real, autenticación y
  almacenamiento en nube quedan pendientes de un ambiente aislado.

### Criterios de salida

- Pruebas automatizadas aplicables aprobadas.
- Chequeos estáticos sin errores bloqueantes.
- Flujos críticos probados en Android y, si el equipo cuenta con macOS, iOS.
- Quality Gate de SonarQube Cloud en estado **Passed**.
- Defectos de severidad alta/crítica corregidos o documentados con responsable.
- Evidencia reproducible sin secretos ni información personal.

## 12. Conclusiones

El patrón AAA hace que cada prueba describa con claridad la preparación, la
acción y el resultado esperado. Las pruebas unitarias del controlador
comprueban validaciones importantes sin depender de SQL Server, mientras que
las pruebas de integración y E2E completan la verificación de los componentes
conectados.

Para la app móvil no basta con comprobar el código: también deben validarse
sesión, navegación, red, permisos, accesibilidad y compatibilidad en dispositivos.
La integración de SonarQube Cloud automatiza el análisis y puede bloquear una
entrega cuando el Quality Gate falla; su resultado solo es válido después de
activar las credenciales, importar el proyecto y ejecutar el workflow.

## 13. Referencias

- SonarSource. [GitHub Actions para SonarQube Cloud](https://docs.sonarsource.com/sonarqube-cloud/analyzing-source-code/ci-based-analysis/github-actions-for-sonarcloud/).
- SonarSource. [Administración de Quality Gates en SonarQube Cloud](https://docs.sonarsource.com/sonarqube-cloud/standards/managing-quality-gates/).
- Expo. [Unit testing with Jest](https://docs.expo.dev/develop/unit-testing/).
- React Native. [Testing overview](https://reactnative.dev/docs/testing-overview).
- React Native Testing Library. [Documentación](https://callstack.github.io/react-native-testing-library/).
- Maestro. [Documentación E2E](https://maestro.mobile.dev/).
- Detox. [Documentación E2E](https://wix.github.io/Detox/).
- OWASP. [Mobile Application Security Verification Standard (MASVS)](https://mas.owasp.org/MASVS/).
