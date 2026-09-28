import { Platform } from 'react-native';
import { IAuthService } from '../contracts/IAuthService';
import { ITokenStorage } from '../contracts/ITokenStorage';
import { TokenStorage, defaultTokenStorage } from '../storage/TokenStorage';
import { LoginPayload, RegisterPayload, AuthResponse } from '../../models/Auth';

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

/**
 * Resuelve la URL base predeterminada según el entorno de ejecución móvil.
 * - Android Emulator: 10.0.2.2 apunta al localhost de la máquina host.
 * - iOS Simulator / Web: localhost.
 */
function resolveDefaultBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  return 'http://localhost:3000/api';
}

/**
 * Clase de error personalizada para estandarizar fallos de red y HTTP.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * AuthApiService — Implementación concreta de IAuthService para React Native.
 * 
 * Cumple con SOLID:
 * - SRP: Se encarga exclusivamente de la comunicación HTTP para autenticación.
 * - DIP: Depende de ITokenStorage para persistir el JWT.
 * - Desacoplamiento: No se importa Axios; utiliza fetch nativo optimizado.
 */
export class AuthApiService implements IAuthService {
  private readonly baseUrl: string;
  private readonly tokenStorage: ITokenStorage;

  constructor(
    baseUrl: string = resolveDefaultBaseUrl(),
    tokenStorage: ITokenStorage = defaultTokenStorage
  ) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.tokenStorage = tokenStorage;
  }

  /**
   * Ejecuta peticiones HTTP estandarizadas con fetch.
   */
  private async executeRequest<T>(
    endpoint: string,
    method: 'POST' | 'GET',
    body?: unknown
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (networkError) {
      const message =
        networkError instanceof Error
          ? networkError.message
          : 'No se pudo conectar con el servidor. Revisa tu conexión de red.';
      throw new ApiError(message, undefined, networkError);
    }

    let responseData: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json().catch(() => null);
    } else {
      const text = await response.text().catch(() => '');
      responseData = text ? { message: text } : null;
    }

    if (!response.ok) {
      const errorMessage =
        (responseData && typeof responseData === 'object' && responseData.message) ||
        (responseData && typeof responseData === 'object' && responseData.error) ||
        `Error del servidor (${response.status}): ${response.statusText}`;

      throw new ApiError(String(errorMessage), response.status, responseData);
    }

    return responseData as T;
  }

  /**
   * Realiza el inicio de sesión enviando el payload PascalCase al backend.
   */
  async login(payload: LoginPayload): Promise<AuthResponse> {
    // Intentar endpoint estándar /auth/login
    const result = await this.executeRequest<AuthResponse>('/auth/login', 'POST', payload);

    if (result && result.token) {
      await this.tokenStorage.setToken(result.token);
    }

    return result;
  }

  /**
   * Realiza el registro enviando el payload PascalCase al backend.
   */
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    // Intentar endpoint estándar /usuarios (backend lo expone así)
    const result = await this.executeRequest<AuthResponse>('/usuarios', 'POST', payload);

    if (result && result.token) {
      await this.tokenStorage.setToken(result.token);
    }

    return result;
  }

  /**
   * Implementación de GET genérico para cumplir parcialmente con IApiService / ReportesHttpService.
   */
  async get<T>(endpoint: string, options?: any): Promise<T> {
    return this.executeRequest<T>(endpoint, 'GET');
  }
}

/** Instancia singleton de servicio lista para inyección por defecto */
export const authApiService = new AuthApiService();
export const apiService: IAuthService = authApiService;
