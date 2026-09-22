# Servicios móviles

Esta carpeta contendrá los contratos y las implementaciones de acceso a la API REST.
Los ViewModels recibirán servicios por parámetro o contexto, tipados mediante interfaces.
Solo las implementaciones de servicios podrán utilizar fetch o axios.

HU-05 no requiere peticiones ni autenticación; no se crea un servicio ficticio para navegar.
La app se comunicará con el backend por capas. Microsoft SQL Server será responsabilidad
del backend y no tendrá conexión directa desde el móvil.
