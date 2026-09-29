import { LoginPayload, RegisterPayload, AuthResponse } from '../../models/Auth';

/**
 * IAuthService — Contrato de servicio para el módulo de Autenticación en Mejora SJR.
 * 
 * Reglas de Arquitectura:
 * - Los ViewModels dependen ÚNICAMENTE de esta interfaz, nunca de Axios o Fetch.
 * - Permite inyección de dependencias (DI) e intercambio transparente por mocks en tests.
 * - Los payloads recibidos por este contrato respetan el formato PascalCase del backend:
 *   - Login: { Correo, Password }
 *   - Registro: { NombreCompleto, Correo, Password, Telefono }
 */
export interface IAuthService {
  /**
   * Envía las credenciales al endpoint de login (POST /auth/login o /usuarios/login).
   * @param payload Credenciales con formato PascalCase { Correo, Password }.
   * @returns Promesa con AuthResponse conteniendo el token y datos de usuario.
   */
  login(payload: LoginPayload): Promise<AuthResponse>;

  /**
   * Envía los datos de nuevo registro (POST /auth/registro o /usuarios/registro).
   * @param payload Datos del ciudadano con formato PascalCase { NombreCompleto, Correo, Password, Telefono }.
   * @returns Promesa con AuthResponse confirmando el alta del usuario.
   */
  register(payload: RegisterPayload): Promise<AuthResponse>;
}
