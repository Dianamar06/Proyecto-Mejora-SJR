# 🗄️ Esquema de Base de Datos — Firebase Firestore
### Proyecto: Mejora SJR · Sistema de Reportes Urbanos Ciudadanos
> **Rama:** `sP1` · **Autor:** Arquitecto de BD NoSQL · **Fecha:** 2026-09-14

---

## Índice
1. [Convenciones generales](#convenciones-generales)
2. [Colección `usuarios`](#colección-usuarios)
3. [Colección `reportes`](#colección-reportes)
4. [Diagrama de relaciones](#diagrama-de-relaciones)
5. [Notas para el equipo backend](#notas-para-el-equipo-backend)

---

## Convenciones generales

| Convención | Detalle |
|---|---|
| IDs de documentos | Generados automáticamente por Firestore (`Auto-ID`) salvo `uid` de autenticación en `usuarios` |
| Nombres de colecciones | `snake_case` en minúsculas |
| Nombres de campos | `camelCase` |
| Timestamps | `Firestore Timestamp` (UTC). **No** usar `string` ni `Date` de JavaScript |
| Referencias | Tipo `reference` de Firestore para vínculos entre colecciones |
| Imágenes/archivos | Se almacenan en **Firebase Storage**; en Firestore se guarda únicamente la URL de descarga |

---

## Colección `usuarios`

### Descripción
Almacena el perfil de cada ciudadano registrado en la plataforma. El `documentId` coincide con el `uid` generado por **Firebase Authentication**.

---

### Ejemplo de documento JSON

```json
{
  "uid": "aB3kL9mNpQ2rT5vX",
  "nombre": "María Fernanda López",
  "correo": "mfernanda.lopez@email.com",
  "telefono": "+52 477 123 4567",
  "rol": "ciudadano",
  "fotoPerfil": "https://firebasestorage.googleapis.com/v0/.../usuarios/aB3kL9mNpQ2rT5vX/perfil.jpg",
  "activo": true,
  "fechaRegistro": "2026-03-10T09:15:00Z",
  "ultimoAcceso": "2026-09-14T16:02:00Z"
}
```

---

### Tabla de campos

| Campo | Tipo de dato | Descripción breve |
|---|---|---|
| `uid` | `string` | UID de Firebase Authentication. También es el `documentId` del documento |
| `nombre` | `string` | Nombre completo del ciudadano |
| `correo` | `string` | Correo electrónico único, verificado vía Firebase Auth |
| `telefono` | `string` | Número de contacto en formato E.164 (`+52 477 …`) |
| `rol` | `string` | Perfil de acceso: `"ciudadano"`, `"moderador"` o `"admin"` |
| `fotoPerfil` | `string` | URL de descarga de la imagen almacenada en Firebase Storage |
| `activo` | `boolean` | Indica si la cuenta está habilitada (`true`) o suspendida (`false`) |
| `fechaRegistro` | `timestamp` | Momento en que el usuario completó el registro por primera vez |
| `ultimoAcceso` | `timestamp` | Fecha y hora del último inicio de sesión exitoso |

> **Valores permitidos para `rol`**
> - `"ciudadano"` — usuario estándar, puede crear y consultar sus propios reportes.
> - `"moderador"` — puede actualizar el estado de cualquier reporte.
> - `"admin"` — acceso completo a la plataforma y configuración.

---

## Colección `reportes`

### Descripción
Almacena cada incidencia urbana enviada por un ciudadano. El `documentId` es generado automáticamente por Firestore. La referencia al usuario se mantiene tanto como `reference` (para queries relacionales) como como `string` (`uidUsuario`) para facilitar lecturas rápidas sin resolver referencias.

---

### Ejemplo de documento JSON

```json
{
  "id": "7rFkP2qZnX1mWv8Y",
  "uidUsuario": "aB3kL9mNpQ2rT5vX",
  "refUsuario": "usuarios/aB3kL9mNpQ2rT5vX",
  "categoria": "alumbrado_publico",
  "subcategoria": "luminaria_apagada",
  "descripcion": "La lámpara del poste frente al parque lleva 5 días apagada. Genera inseguridad por la noche.",
  "estado": "en_revision",
  "prioridad": "media",
  "ubicacion": {
    "geopoint": { "_latitude": 21.1234, "_longitude": -101.6789 },
    "direccion": "Calle Morelos 45, Col. Centro, San José de Río, GTO",
    "referencia": "Frente al Parque Principal"
  },
  "evidencias": [
    "https://firebasestorage.googleapis.com/v0/.../reportes/7rFkP2qZnX1mWv8Y/foto_01.jpg",
    "https://firebasestorage.googleapis.com/v0/.../reportes/7rFkP2qZnX1mWv8Y/foto_02.jpg"
  ],
  "comentarioModerador": "Se notificó a la dependencia de servicios públicos.",
  "fechaCreacion": "2026-09-12T11:30:00Z",
  "fechaActualizacion": "2026-09-14T08:45:00Z",
  "fechaResolucion": null
}
```

---

### Tabla de campos

| Campo | Tipo de dato | Descripción breve |
|---|---|---|
| `id` | `string` | Auto-ID de Firestore. Se denormaliza dentro del documento para facilitar lecturas |
| `uidUsuario` | `string` | UID del ciudadano que generó el reporte (clave foránea ligera) |
| `refUsuario` | `reference` | Referencia nativa de Firestore al documento en `usuarios/{uid}` |
| `categoria` | `string` | Categoría principal de la incidencia (ver valores permitidos abajo) |
| `subcategoria` | `string` | Clasificación más específica dentro de la categoría |
| `descripcion` | `string` | Texto libre del ciudadano describiendo el problema (máx. 1 000 caracteres) |
| `estado` | `string` | Estado del ciclo de vida del reporte (ver valores permitidos abajo) |
| `prioridad` | `string` | Nivel de urgencia asignado: `"baja"`, `"media"` o `"alta"` |
| `ubicacion` | `map` | Objeto compuesto con la geo-referencia del incidente (ver sub-campos) |
| `ubicacion.geopoint` | `geopoint` | Coordenadas GPS (latitud/longitud) del punto exacto reportado |
| `ubicacion.direccion` | `string` | Dirección textual legible para humanos |
| `ubicacion.referencia` | `string` | Punto de referencia adicional (opcional) |
| `evidencias` | `array<string>` | Lista de URLs de Firebase Storage con las fotos o videos adjuntos |
| `comentarioModerador` | `string` | Nota interna del equipo moderador/admin (puede ser `null`) |
| `fechaCreacion` | `timestamp` | Momento exacto en que el ciudadano envió el reporte |
| `fechaActualizacion` | `timestamp` | Última vez que cualquier campo del documento fue modificado |
| `fechaResolucion` | `timestamp \| null` | Fecha en que el reporte fue marcado como resuelto; `null` si aún está abierto |

---

### Valores permitidos para `categoria`

| Valor | Descripción |
|---|---|
| `"alumbrado_publico"` | Luminarias dañadas, postes caídos, zonas sin luz |
| `"baches_pavimento"` | Hoyos en calles, banquetas deterioradas |
| `"agua_drenaje"` | Fugas, tomas rotas, alcantarillas tapadas |
| `"recoleccion_basura"` | Contenedores llenos, rutas no atendidas |
| `"areas_verdes"` | Parques descuidados, árboles con riesgo de caída |
| `"seguridad_vial"` | Señales dañadas, semáforos sin funcionar |
| `"otro"` | Incidencias que no encajan en las categorías anteriores |

---

### Valores permitidos para `estado`

| Valor | Descripción | Quién puede asignarlo |
|---|---|---|
| `"pendiente"` | Reporte recién enviado, aún no revisado | Sistema (automático al crear) |
| `"en_revision"` | Un moderador tomó el reporte | Moderador / Admin |
| `"en_proceso"` | La dependencia responsable está atendiendo | Moderador / Admin |
| `"resuelto"` | Incidencia corregida y verificada | Moderador / Admin |
| `"rechazado"` | Reporte duplicado, fuera de jurisdicción o inválido | Moderador / Admin |

---

## Diagrama de relaciones

```
┌─────────────────────────┐        ┌──────────────────────────────────────┐
│   usuarios/{uid}        │        │   reportes/{autoId}                  │
│─────────────────────────│        │──────────────────────────────────────│
│ uid            string   │◄───────│ uidUsuario        string             │
│ nombre         string   │        │ refUsuario        reference          │
│ correo         string   │        │ categoria         string             │
│ telefono       string   │        │ subcategoria      string             │
│ rol            string   │        │ descripcion       string             │
│ fotoPerfil     string   │        │ estado            string             │
│ activo         boolean  │        │ prioridad         string             │
│ fechaRegistro  timestamp│        │ ubicacion         map                │
│ ultimoAcceso   timestamp│        │   ├─ geopoint     geopoint           │
└─────────────────────────┘        │   ├─ direccion    string             │
                                   │   └─ referencia   string             │
                                   │ evidencias        array<string>      │
                                   │ comentarioModerador string           │
                                   │ fechaCreacion     timestamp          │
                                   │ fechaActualizacion timestamp         │
                                   │ fechaResolucion   timestamp | null   │
                                   └──────────────────────────────────────┘
```

---

## Notas para el equipo backend

### 🔐 Reglas de seguridad (Firestore Security Rules) — lineamientos

- **`usuarios`**: Solo el propio usuario puede leer/escribir su documento. Los `admin` tienen acceso total.
- **`reportes`**: Cualquier usuario autenticado puede **crear** un reporte. Solo el `moderador` o `admin` puede modificar el campo `estado`. El ciudadano puede actualizar `descripcion` y `evidencias` únicamente si el estado es `"pendiente"`.

### 📌 Índices compuestos recomendados

| Colección | Campos indexados | Orden | Propósito |
|---|---|---|---|
| `reportes` | `estado` + `fechaCreacion` | ASC / DESC | Listar reportes por estado paginados |
| `reportes` | `uidUsuario` + `fechaCreacion` | ASC / DESC | Historial de reportes de un ciudadano |
| `reportes` | `categoria` + `estado` | ASC / ASC | Filtrado por tipo e incidencia activa |
| `reportes` | `ubicacion.geopoint` | — | Consultas geoespaciales con `GeoFirestore` |

### ⚠️ Consideraciones importantes

1. **Límite de Firestore**: Un documento no puede superar **1 MB**. El campo `evidencias` solo almacena URLs, nunca archivos binarios.
2. **Denormalización**: El campo `uidUsuario` (string) se incluye además de `refUsuario` para evitar lecturas adicionales en listados masivos.
3. **Soft delete**: No se elimina físicamente ningún documento. Para usuarios, usar `activo: false`; para reportes, usar `estado: "rechazado"`.
4. **Auditoría**: Los campos `fechaCreacion` y `fechaActualizacion` deben ser escritos exclusivamente desde el backend con `FieldValue.serverTimestamp()`, nunca desde el cliente.
5. **Paginación**: Usar `startAfter(lastDocument)` + `limit(n)` para todas las consultas paginadas sobre `reportes`.
