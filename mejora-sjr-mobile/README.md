# Mejora SJR — Aplicación móvil

## HU-05: Inicialización y ruteador base

Aplicación React Native con Expo SDK 57, TypeScript estricto y React Navigation Native Stack.

La [guía del frontend móvil en el README principal](../README.md#frontend-móvil-estructura-y-funcionamiento)
detalla la responsabilidad de cada carpeta, el flujo MVVM y la futura inyección de servicios.

```text
index.ts                         Registro de la aplicación con Expo
App.tsx                          Proveedor de áreas seguras y composición raíz
src/
  navigation/AppRouter.tsx       Stack tipado y adaptadores de pantallas
  views/LoginView.tsx            Vista de acceso
  views/HomeView.tsx             Vista de inicio
  viewModels/useLoginViewModel.ts
  viewModels/useHomeViewModel.ts
  models/                       Tipos y modelos de dominio
  services/
    contracts/                  Interfaces consumidas por los ViewModels
    api/                        Implementaciones HTTP
    mocks/                      Implementaciones simuladas
  providers/                    Contextos e inyección de dependencias
  components/                   UI reutilizable con props mínimas
  constants/                    Valores compartidos
```

Las carpetas pendientes de implementación contienen únicamente `.gitkeep` para
conservar su estructura en Git. No se crean modelos, servicios ni proveedores ficticios.

### Navegación

La entrada es `index.ts`, que registra `App.tsx`. `AppRouter.tsx` contiene el único
`NavigationContainer` y un Stack con `Login` como ruta inicial y `Home` como segunda ruta.
Las rutas no reciben parámetros. Los adaptadores conectan las acciones de los ViewModels
con React Navigation; las vistas reciben únicamente callbacks.

`Explorar inicio` navega a Home. `Volver al acceso` regresa al inicio del Stack sin
agregar pantallas duplicadas. También se puede regresar usando el encabezado del Stack
o el botón Atrás de Android.

La HU-05 inicial solo implementó navegación. La aplicación ahora también incorpora
la consulta de reportes descrita abajo; todavía no autentica ni crea sesiones.

Se reemplazaron las rutas de ejemplo de `src/app` y las pestañas de Expo Router.
Se retiraron la dependencia, el plugin y los componentes vinculados a Expo Router,
así como el script de reinicio que generaba rutas para ese sistema.
Se retiraron los componentes, hooks, estilos y constantes de ejemplo sin uso.
El estado de presentación de las nuevas funcionalidades vivirá en `viewModels/`.
La salida web usa `single`, compatible con esta entrada personalizada.

### Reglas de arquitectura

- `views/`: UI declarativa, props mínimas y callbacks; sin HTTP ni estado complejo.
- `viewModels/`: custom hooks para estado, validaciones y acciones. Sin fetch ni axios.
- `services/`: acceso a la API REST mediante implementaciones de contratos.
- Los servicios se inyectarán por parámetro o contexto, dependiendo de interfaces.
- El backend será por capas y utilizará Microsoft SQL Server. El móvil no se conectará
  directamente a la base de datos. Las referencias anteriores a CQRS y Firebase están desactualizadas.

### Desarrollo y validación

Usar una versión de Node compatible con Expo SDK 57 (mínimo 22.13).

```bash
npm install
npm start
npm run android
npm run typecheck
npx expo export --platform all
```

Comprobación manual en dispositivo o emulador:

1. Abrir la app: debe mostrar la vista de acceso, sin las pestañas Home/Explore de Expo.
2. Pulsar `Explorar inicio`: debe mostrar Home con el título `Mejora SJR` en el encabezado.
3. Pulsar `Volver al acceso`: debe mostrar Login.
4. Repetir usando el botón Atrás del encabezado y, en Android, el botón del sistema.
5. Repetir el recorrido y confirmar que no se acumulan pantallas.

Referencias: [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/),
[registro de la raíz](https://docs.expo.dev/versions/v57.0.0/sdk/expo/#registerrootcomponent),
[React Navigation Native Stack](https://reactnavigation.org/docs/native-stack-navigator/).

## Consulta de reportes con MVVM e inyección por parámetro

El backend actual publica `GET /api/reportes` y devuelve `{ success: true, data: [...] }`.
`App.tsx` crea una instancia estable de `ApiService` con `TokenStorage` y la pasa a
`AppRouter`. Desde Home, el botón **Consultar reportes** abre la nueva pantalla.

`ReportesScreen`, adaptador de navegación, consume el hook y conecta sus resultados
con la Vista. La Vista no recibe servicios ni conoce la URL o la procedencia de los datos:

```tsx
const { isLoading, reportes, error, reload } = useReportesViewModel(apiService);
return (
  <ReportesView
    isLoading={isLoading}
    reportes={reportes}
    error={error}
    onReload={reload}
  />
);
```

- `src/models/Reporte.ts`: contrato confirmado y comprobación de datos recibidos.
- `src/viewModels/useReportesViewModel.ts`: recibe `Pick<IApiService, 'get'>`, consulta
  `/reportes`, valida el resultado y transforma cada elemento a `id`, `titulo`, `descripcion`
  y `estado` para la UI. No importa implementaciones de red.
- `src/views/ReportesView.tsx`: dibuja carga, error con reintento, lista vacía o resultados.
  No utiliza hooks de estado, efectos ni HTTP.
- `src/navigation/AppRouter.tsx`: contiene el adaptador que une hook y Vista.

El hook inicia la consulta al montar. Expone `isLoading`, `reportes`, `error` y `reload`.
Al recargar limpia el error y la lista anterior. Una lista vacía es un resultado válido.
Si cambia el servicio, se recarga con la nueva dependencia. Las respuestas de efectos
anteriores o de una pantalla desmontada se ignoran; la petición HTTP subyacente no se
cancela porque el contrato actual no expone `AbortSignal`.

### Contrato de datos confirmado

El modelo conserva los nombres del contrato proporcionado por el equipo de backend:

```json
{
  "success": true,
  "data": [
    {
      "IdReporte": 1,
      "Titulo": "Bache",
      "Descripcion": "Bache en la calle",
      "UbicacionLatitud": 20.38,
      "UbicacionLongitud": -99.99,
      "DireccionFisica": null,
      "EvidenciaUrl": null,
      "IdUsuario": 10,
      "IdCategoria": 2,
      "IdEstado": 2,
      "FechaCreacion": "2026-09-23T10:00:00.000Z",
      "FechaActualizacion": "2026-09-23T11:00:00.000Z"
    }
  ]
}
```

`IdReporte`, las coordenadas y los demás IDs son números finitos. Los títulos,
descripciones y fechas son textos; las fechas se reciben en formato ISO según el contrato.
`DireccionFisica` y `EvidenciaUrl` admiten texto, ausencia o `null`.
El ViewModel comprueba IDs de reporte únicos, convierte el ID a texto para la lista,
recorta título y descripción, y traduce `IdEstado`: 1 = Recibido, 2 = En Revisión,
3 = En Progreso. Otros valores muestran `Estado <ID>` hasta confirmar el catálogo.
La Vista recibe solo `id`, `titulo`, `descripcion` y `estado`, sin datos del usuario,
coordenadas ni fechas que no utiliza. Una respuesta incompatible se muestra como error.

### API real y mock

La aplicación usa el servicio real por defecto. Para un celular físico, configurar
`EXPO_PUBLIC_API_URL` con la URL accesible del backend, incluyendo `/api`, y recargar
la aplicación. El servicio conserva las URL predeterminadas para emulador Android y web.
La consulta se realiza al abrir Reportes, no al iniciar la app.

Para desarrollar sin servidor, se puede sustituir únicamente la instancia en `App.tsx`
por el mock existente, configurado con la misma respuesta:

```tsx
import { ApiServiceMock } from '@/services/mocks/apiServiceMock';

const apiService = new ApiServiceMock();
apiService.setMockResponse('/reportes', {
  success: true,
  data: [{
    IdReporte: 1, Titulo: 'Reporte de prueba', Descripcion: 'Bache en la calle',
    UbicacionLatitud: 20.38, UbicacionLongitud: -99.99,
    DireccionFisica: null, EvidenciaUrl: null,
    IdUsuario: 10, IdCategoria: 2, IdEstado: 1,
    FechaCreacion: '2026-09-23T10:00:00.000Z',
    FechaActualizacion: '2026-09-23T11:00:00.000Z',
  }],
});
```

No es necesario cambiar el hook ni la Vista. Un mock sin respuesta configurada para
`/reportes` no satisface el contrato y dará error de formato.

### Verificación

```bash
npm test
npm run typecheck
npx expo export --platform all
```

Las pruebas del hook cubren carga, éxito, lista vacía, error, reintento, respuesta
inválida, IDs duplicados, cambio de servicio, respuestas fuera de orden y desmontaje.
Para la comprobación manual: Login → Home → Consultar reportes; probar con backend
activo, sin servidor y con lista vacía. La autenticación y la persistencia segura de
sesión quedan fuera de esta funcionalidad.
