/**
 * Contratos de modelos y payloads para el módulo de Autenticación de Mejora SJR.
 * 
 * NOTA CRÍTICA:
 * Los payloads de la API requieren estrictamente PascalCase para coincidir
 * con el backend y la base de datos Azure SQL (MejoraSJR_DB):
 * - Registro: { NombreCompleto, Correo, Password, Telefono }
 * - Login:    { Correo, Password }
 */

export interface LoginPayload {
  /** Correo electrónico del usuario o ciudadano */
  Correo: string;
  /** Contraseña; el backend verifica el hash almacenado. */
  Password: string;
}

export interface RegisterPayload {
  /** Nombre completo del ciudadano */
  NombreCompleto: string;
  /** Correo electrónico del ciudadano */
  Correo: string;
  /** Contraseña sin encriptar (el backend la encriptará) */
  Password: string;
  /** Teléfono de contacto (10 dígitos) */
  Telefono: string;
}

export interface UsuarioAutenticado {
  id?: number | string;
  nombreCompleto?: string;
  correo: string;
  telefono?: string;
  rol?: string;
}

export interface AuthResponse {
  /** Token JWT de sesión para autorizar peticiones subsiguientes */
  token: string;
  /** Datos del usuario logueado o registrado */
  usuario?: UsuarioAutenticado;
  /** Mensaje de éxito o retroalimentación devuelto por el backend */
  message?: string;
}
