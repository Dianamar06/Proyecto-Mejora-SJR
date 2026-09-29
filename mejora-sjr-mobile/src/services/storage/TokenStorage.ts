import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ITokenStorage } from '../contracts/ITokenStorage';

const TOKEN_KEY = 'sjr_auth_token';

/**
 * Única responsabilidad: persistir, recuperar y eliminar el JWT.
 * - Android / iOS: SecureStore cifra el valor en el almacenamiento del sistema.
 * - Web: localStorage mantiene la sesión entre recargas del navegador.
 * 
 * Cumple con ITokenStorage para permitir Dependency Inversion (SOLID).
 */
export class TokenStorage implements ITokenStorage {
  async getToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
    }

    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  async setToken(token: string): Promise<void> {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      throw new Error('No se puede guardar un token vacío.');
    }

    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        throw new Error('El almacenamiento web no está disponible.');
      }
      window.localStorage.setItem(TOKEN_KEY, normalizedToken);
      return;
    }

    await SecureStore.setItemAsync(TOKEN_KEY, normalizedToken);
  }

  async removeToken(): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(TOKEN_KEY);
      }
      return;
    }

    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

export const defaultTokenStorage = new TokenStorage();
