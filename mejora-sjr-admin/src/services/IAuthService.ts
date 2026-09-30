/**
 * IAuthService — Contrato (interfaz) del servicio de autenticación.
 *
 * El ViewModel SÓLO conoce esta interfaz; nunca importa axios ni fetch.
 * Cualquier implementación concreta (Axios, Fetch, Mock) puede ser
 * inyectada sin modificar el ViewModel ni la Vista.
 *
 * Payload: PascalCase requerido por el backend Mejora SJR.
 */

export interface LoginPayload {
  /** Correo electrónico del administrador */
  Correo: string;
  /** Contraseña en texto plano para que el backend la verifique */
  Password: string;
}

export interface LoginResponse {
  /** JWT o token de sesión devuelto por el backend */
  token: string;
  /** Nombre visible del usuario autenticado */
  nombreUsuario?: string;
  /** Rol del usuario para control de acceso */
  rol?: string;
}

export interface RegisterPayload {
  NombreCompleto: string;
  Correo: string;
  PasswordHash: string;
  Telefono: string;
}

export interface IAuthService {
  /**
   * Envía las credenciales al endpoint POST /auth/login.
   * @throws {Error} con mensaje legible si las credenciales son inválidas
   *                 o si hay un error de red.
   */
  login(payload: LoginPayload): Promise<LoginResponse>;

  /**
   * Da de alta a un nuevo usuario/ciudadano en el sistema.
   * Payload: PascalCase idéntico a las columnas SQL.
   */
  register(payload: RegisterPayload): Promise<void>;
}
