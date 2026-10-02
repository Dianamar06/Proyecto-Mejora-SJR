# Plan de pruebas de la API REST y Quality Gate

## 1. Propósito

Definir cómo verificar la API REST de Mejora SJR, registrar casos con el patrón
AAA (Arrange, Act, Assert: Preparar, Actuar y Verificar) y establecer criterios
de salida mediante un Quality Gate de SonarQube.

La presentación del Tema I de la Unidad II no está incluida en los archivos del
proyecto. Por ello, este documento aplica los conceptos AAA y de calidad de
software usados habitualmente; si la presentación prescribe umbrales o formatos
distintos, deben cotejarse antes de entregar.

## 2. Sistema bajo prueba y alcance

El backend está implementado con Node.js y Express. Las rutas observadas son:

| Método y ruta | Propósito | Acceso observado |
|---|---|---|
| `POST /api/usuarios` | Registrar ciudadano | Público |
| `POST /api/auth/login` | Autenticar y obtener JWT | Público |
| `POST /api/reportes` | Crear reporte | Público en el router actual |
| `POST /api/reportes/:id/evidencia` | Subir evidencia multipart (`evidencia`) | Público en el router actual |
| `GET /api/reportes` | Listar y filtrar reportes | JWT requerido |
| `PUT /api/reportes/:id/estado` | Actualizar estado | JWT y rol `IdRol = 3` |

Se prueban las validaciones de entrada, la respuesta HTTP/JSON y la delegación
del controlador a su servicio. La persistencia real, el proveedor de imágenes,
la verificación de credenciales contra SQL Server y los permisos de producción
requieren pruebas de integración con servicios configurados; no se simulan
como si fueran una validación end-to-end.

## 3. Estrategia y entorno

- **Pruebas de unidad/contrato del controlador:** `node:test`, `node:assert/strict`
  y servicios sustitutos. Se ejecutan sin SQL Server ni credenciales reales.
- **Pruebas de integración HTTP:** ejecutar el backend contra una base de datos
  y configuración de prueba aisladas. Validar rutas, middleware, serialización y
  consultas. No apuntar pruebas destructivas a producción.
- **Pruebas de aceptación manuales:** Postman o Insomnia para inspeccionar
  solicitudes, JWT, códigos HTTP y cuerpos JSON; Newman permite automatizar una
  colección de Postman en CI.
- Configurar `JWT_SECRET`, conexión de SQL Server y almacenamiento con valores
  exclusivos de prueba. Nunca registrar secretos o tokens en evidencias.
- Ejecutar los comandos desde `mejora-sjr-backend/`.

## 4. Casos AAA automatizados

Los siguientes seis casos están implementados en
[`mejora-sjr-backend/tests/ReporteController.test.js`](../mejora-sjr-backend/tests/ReporteController.test.js).
Cada caso mantiene separados Preparar, Actuar y Verificar.

| ID | Endpoint/escenario | Preparar (Arrange) | Actuar (Act) | Verificar (Assert) |
|---|---|---|---|---|
| API-01 | Crear sin campos requeridos | Controlador con servicio espía y body incompleto | Invocar `crearReporte` | HTTP 400, `success: false`, mensaje identifica el faltante, servicio no invocado |
| API-02 | Crear con latitud no numérica | Body con todos los campos requeridos, latitud como texto y servicio espía | Invocar `crearReporte` | HTTP 400, error de coordenadas numéricas, servicio no invocado |
| API-03 | Crear reporte válido | Body con título, descripción, coordenadas numéricas, categoría y usuario; servicio simulado | Invocar `crearReporte` | HTTP 201, `success: true`, respuesta contiene el ID devuelto y servicio recibió el usuario |
| API-04 | Actualizar con ID inválido | Parámetro `id=abc` y servicio espía | Invocar `actualizarEstado` | HTTP 400, mensaje de ID entero válido, servicio no invocado |
| API-05 | Actualizar sin estado | ID válido, body vacío y servicio espía | Invocar `actualizarEstado` | HTTP 400, mensaje de estado requerido, servicio no invocado |
| API-06 | Actualizar con datos válidos | ID `23`, `IdEstado: 3` y servicio simulado | Invocar `actualizarEstado` | HTTP 200, `success: true`, servicio recibió `(23, 3)` y JSON devuelve los datos |

### Ejecución

```powershell
cd mejora-sjr-backend
npm test
```

## 5. Casos de integración/aceptación recomendados

Preparar previamente un usuario y datos semilla no productivos. Para las rutas
protegidas, iniciar sesión y usar `Authorization: Bearer <token>`.

| ID | Solicitud | Resultado esperado |
|---|---|---|
| INT-01 | `POST /api/auth/login` con credenciales válidas de prueba | HTTP 200, `success: true`, token JWT presente y usuario sin hash de contraseña |
| INT-02 | `POST /api/auth/login` con contraseña incorrecta | HTTP 401, `success: false`, sin token |
| INT-03 | `GET /api/reportes` sin `Authorization` | HTTP 403, mensaje de token no proporcionado |
| INT-04 | `GET /api/reportes?estado=1&categoria=1` con JWT válido | HTTP 200, `data` es arreglo, filtros aplicados y `total` corresponde al arreglo |
| INT-05 | `PUT /api/reportes/23/estado` sin token o con rol distinto a 3 | HTTP 403, servicio de actualización no debe ejecutarse |
| INT-06 | `POST /api/reportes/23/evidencia` sin archivo `evidencia` | HTTP 400, mensaje de archivo requerido |
| INT-07 | `POST /api/reportes` con `IdCategoria` inexistente | HTTP 400 según el manejo actual del servicio; no debe crearse registro |

En las solicitudes de creación, el backend actual espera `IdUsuario` y lo
predetermina en `1` solo si el body no lo proporciona. El cliente móvil HU-12
declara un payload sin `IdUsuario`; resolver esa diferencia de contrato es un
prerrequisito para una prueba integrada exitosa con el cliente real.

## 6. Quality Gate en SonarQube Cloud

El archivo [`sonar-project.properties`](../sonar-project.properties) define las
carpetas fuente y de pruebas. La integración de CI está en
`../.github/workflows/sonarcloud.yml`: ejecuta las pruebas AAA del backend,
verifica los tipos de la app móvil, analiza el código con SonarQube Cloud y
espera el resultado del Quality Gate. Las pruebas móviles con Node no se
incluyen en el workflow porque actualmente una de ellas carga módulos nativos
de Expo que el runner `node:test` no prepara.
El análisis aún requiere un proyecto creado en SonarQube Cloud y configuración
del repositorio de GitHub.

### Configuración inicial requerida en GitHub y SonarQube Cloud

1. En SonarQube Cloud, importar `Dianamar06/Proyecto-Mejora-SJR` desde GitHub.
   Confirmar que la project key coincide con
   `Dianamar06_Proyecto-Mejora-SJR`, que ya está declarada en
   `sonar-project.properties`, y anotar la **organization key** exacta que
   muestre el tutorial; no asumir que coincide con el nombre visible.
2. Crear un token de análisis desde la cuenta/organización en SonarQube Cloud.
   Guardarlo directamente en GitHub como un **Actions secret** con nombre
   `SONAR_TOKEN`. No pegarlo en el código, chat ni logs.
3. En `Settings > Secrets and variables > Actions > Variables` del repositorio
   GitHub, crear estas variables:
   - `SONAR_ORGANIZATION`: organization key exacta entregada por SonarQube Cloud.
4. En SonarQube Cloud, crear el Quality Gate **Mejora SJR - Unidad II** con
   estas condiciones para código nuevo y asignarlo al proyecto:

| Métrica | Condición para aprobar |
|---|---:|
| Bugs nuevos | 0 |
| Vulnerabilidades nuevas | 0 |
| Hotspots de seguridad revisados | 100 % |
| Calificación de confiabilidad | A |
| Calificación de seguridad | A |
| Calificación de mantenibilidad | A |
| Cobertura de código nuevo | >= 80 % |
| Líneas duplicadas en código nuevo | <= 3 % |

La política debe ser **fallar ante cualquier condición incumplida**. La
configuración de condiciones se administra en SonarQube Cloud, no en el archivo
de propiedades del proyecto.

### Ejecución y verificación

Al hacer push a `main`/`sP3`, abrir o actualizar un PR a esas ramas, o iniciar
manualmente el workflow, GitHub Actions ejecutará las pruebas y el scanner.
`sonar.qualitygate.wait=true` hace que el job espere y falle si SonarQube Cloud
no aprueba el Gate. Revisar el resultado en **Actions** y en el proyecto de
SonarQube Cloud. No aceptar la entrega/PR mientras el Gate no figure como
**Passed**.

La cobertura requiere reportes LCOV generados por los runners y configurados
con `sonar.javascript.lcov.reportPaths`. En este repositorio aún no se generan
esos reportes: las pruebas existentes y las agregadas verifican comportamiento,
pero no constituyen por sí solas evidencia de cobertura para SonarQube. Por eso
el umbral de cobertura del 80 % no se considera listo para exigirse al Gate
hasta conectar el reporte LCOV. El workflow y las propiedades quedan
configurados, pero el primer análisis solo podrá correr después de importar el
proyecto en SonarQube Cloud y definir el secret y las variables anteriores.

## 7. Criterios de salida

- Los casos automatizados pasan localmente (`npm test`).
- Los casos de integración aplicables pasan con datos de prueba aislados.
- El análisis se completa y el Gate figura como **Passed**.
- Se adjuntan al informe la versión del análisis, fecha, rama/commit, resumen de
  pruebas y evidencia sin secretos.
- Las limitaciones de integración móvil/API y cualquier defecto abierto quedan
  identificados; no se presentan pruebas unitarias como pruebas de producción.
