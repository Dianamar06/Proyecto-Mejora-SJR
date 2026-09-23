import { ITokenStorage } from '../contracts/ITokenStorage';

/**
 * Implementación de almacenamiento de tokens para el cliente móvil.
 * 
 * Diseñado con fallback seguro: mantiene el token en memoria para desarrollo
 * y entornos de prueba, preparado para delegar en AsyncStorage o SecureStore
 * según la configuración de seguridad del dispositivo.
 */
export class TokenStorage implements ITokenStorage {
  private static memoryToken: string | null = null;
  private readonly storageKey: string;

  constructor(storageKey: string = '@mejora_sjr_jwt') {
    this.storageKey = storageKey;
  }

  async getToken(): Promise<string | null> {
    try {
      // Si se encuentra en entorno web o hay localStorage disponible
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(this.storageKey);
      }
    } catch {
      // Ignorar excepciones de acceso a almacenamiento
    }

    return TokenStorage.memoryToken;
  }

  async setToken(token: string): Promise<void> {
    TokenStorage.memoryToken = token;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(this.storageKey, token);
      }
    } catch {
      // Fallback seguro en memoria ya asignado
    }
  }

  async removeToken(): Promise<void> {
    TokenStorage.memoryToken = null;

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(this.storageKey);
      }
    } catch {
      // Ignorar excepciones al remover
    }
  }
}
