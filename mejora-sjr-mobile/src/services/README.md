# Servicios móviles

Esta carpeta contendrá los contratos y las implementaciones de acceso a la API REST.
Los ViewModels recibirán servicios por parámetro o contexto, tipados mediante interfaces.
Solo las implementaciones de servicios podrán utilizar fetch o axios.

La consulta de reportes utiliza el contrato existente `IApiService`, limitado a `get`
mediante `Pick` en el ViewModel. `App.tsx` selecciona e inyecta `ApiService`;
`ApiServiceMock` puede sustituirlo configurando `/reportes` con `{ success: true, data: [...] }`.
El listado no implementa autenticación; utiliza el comportamiento de tokens del servicio existente.
La app se comunicará con el backend por capas. Microsoft SQL Server será responsabilidad
del backend y no tendrá conexión directa desde el móvil.
