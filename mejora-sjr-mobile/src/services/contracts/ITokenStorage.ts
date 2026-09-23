/**
 * Contrato abstracto para el almacenamiento seguro de credenciales y tokens JWT.
 * 
 * Cumple con DIP (Dependency Inversion Principle):
 * Permite que ApiService dependa de esta interfaz y no de una implementación
 * concreta como AsyncStorage, SecureStore o almacenamiento en memoria.
 */
export interface ITokenStorage {
  /**
   * Obtiene el token JWT actual almacenado.
   */
  getToken(): Promise<string | null>;

  /**
   * Guarda o actualiza el token JWT.
   */
  setToken(token: string): Promise<void>;

  /**
   * Elimina el token almacenado (por ejemplo, al cerrar sesión).
   */
  removeToken(): Promise<void>;
}
