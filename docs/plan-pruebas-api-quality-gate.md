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

El backend de la rama `main` está implementado con Node.js y Express. En esta
rama, la ruta observada para reportes es:

| Método y ruta | Propósito | Acceso observado |
|---|---|---|
| `GET /api/reportes` | Listar todos los reportes | Sin middleware de autenticación en la ruta actual |

Los casos automatizados verifican la respuesta HTTP/JSON del listado y la
delegación entre controlador, servicio y repositorio. Otras operaciones
(autenticación, creación, actualización o evidencia) no están expuestas por las
rutas de esta rama y se consideran fuera del alcance de esta entrega. La
persistencia real requiere pruebas de integración con una base de datos aislada;
no se simula como si fuera una validación end-to-end.

## 3. Estrategia y entorno

- **Pruebas de unidad/contrato del controlador:** `node:test`,
  `node:assert/strict` y servicios sustitutos. Se ejecutan sin SQL Server ni
  credenciales reales. Jest no es el runner de estos casos.
- **Cobertura:** `c8` envuelve a `node:test` para emitir el archivo LCOV que
  requiere SonarQube; `node --test --experimental-test-coverage` por sí solo
  presenta cobertura nativa, pero no genera el archivo LCOV.
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
| API-01 | Listar reportes existentes | Controlador con servicio simulado que devuelve dos reportes | Invocar `listar` | HTTP 200, `success: true`, arreglo esperado y servicio invocado una vez |
| API-02 | Listar sin resultados | Servicio simulado que devuelve `[]` | Invocar `listar` | HTTP 200 y `data` es un arreglo vacío |
| API-03 | Error al obtener reportes | Servicio simulado que lanza un error interno | Invocar `listar` | HTTP 500 y mensaje genérico sin detalles internos |
| API-04 | Invocar el handler como callback de Express | Controlador con servicio simulado y referencia separada a `listar` | Invocar el handler separado | HTTP 200 y datos correctos; se conserva el enlace al controlador |
| API-05 | El servicio obtiene datos del repositorio | Servicio con repositorio simulado | Invocar `listarReportes` | Devuelve los datos del repositorio y lo invoca una vez |
| API-06 | El servicio propaga errores del repositorio | Repositorio simulado que rechaza con un error conocido | Invocar `listarReportes` | La promesa rechaza con el mismo error para que el controlador lo gestione |

### Ejecución

```powershell
cd mejora-sjr-backend
npm test
npm run test:coverage
```

`npm run test:coverage` genera `coverage/lcov.info`; la carpeta `coverage/` se
mantiene fuera del control de versiones.

## 5. Casos de integración/aceptación recomendados

Preparar una base de datos y registros semilla ficticios en un ambiente aislado.

| ID | Solicitud | Resultado esperado |
|---|---|---|
| INT-01 | `GET /api/reportes` con base de datos de prueba disponible | HTTP 200 y `data` contiene el arreglo de reportes |
| INT-02 | `GET /api/reportes` cuando la base de datos de prueba no está disponible | HTTP 500 con mensaje genérico; la respuesta no expone detalles internos |

Las pruebas de autenticación, creación, actualización y carga de evidencia se
podrán agregar cuando esas rutas estén incorporadas a la rama objetivo.

## 6. Quality Gate en SonarQube Cloud

El archivo [`sonar-project.properties`](../sonar-project.properties) define las
carpetas fuente, pruebas y el path LCOV. La integración de CI está en
`../.github/workflows/sonarcloud.yml`: genera la cobertura del backend, verifica
los tipos de la app móvil, analiza el código con SonarQube Cloud y espera el
resultado del Quality Gate. Las pruebas móviles con Node no se incluyen en ese
workflow porque actualmente una de ellas carga módulos nativos de Expo que el
runner `node:test` no prepara.

La ejecución actual de GitHub Actions aprobó las pruebas AAA y el typecheck
móvil. El job de SonarQube Cloud se detuvo antes del análisis porque falta
configurar `SONAR_TOKEN` y `SONAR_ORGANIZATION`; no hay todavía resultado de
Quality Gate.

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

La cobertura se genera mediante `c8` en formato LCOV y el workflow usa el mismo
comando. Se configuró `sonar.javascript.lcov.reportPaths` para leer el archivo
generado. La cobertura observada localmente en los archivos probados es 100 %,
pero el Quality Gate completo no está verificado: el scanner requiere importar
el proyecto y configurar el secret y la variable indicados.

## 7. Criterios de salida

- Los casos automatizados pasan localmente (`npm test`).
- Los casos de integración aplicables pasan con datos de prueba aislados.
- El análisis se completa y el Gate figura como **Passed**.
- Se adjuntan al informe la versión del análisis, fecha, rama/commit, resumen de
  pruebas y evidencia sin secretos.
- Las limitaciones de integración móvil/API y cualquier defecto abierto quedan
  identificados; no se presentan pruebas unitarias como pruebas de producción.
