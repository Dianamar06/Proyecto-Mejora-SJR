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

Esta historia solo implementa navegación: no autentica, no crea sesiones y no consulta
una API. Los ViewModels son deliberadamente mínimos hasta incorporar casos de uso.

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
