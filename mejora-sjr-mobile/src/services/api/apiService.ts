import { Platform } from 'react-native';
import { IApiService, RequestOptions, ApiError } from '../contracts/IApiService';
import { ITokenStorage } from '../contracts/ITokenStorage';
import { TokenStorage } from '../storage/TokenStorage';

// Declaración segura de process.env para evitar errores de compilador en React Native/Expo sin @types/node
declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

/**
 * Resuelve la URL base adecuada según la plataforma y el entorno de ejecución móvil.
 * - Emulador Android: 10.0.2.2 apunta al localhost de la máquina anfitriona.
 * - Emulador iOS y Web: localhost.
 * - Variable de entorno: EXPO_PUBLIC_API_URL si está definida.
 */
function resolveDefaultBaseUrl(): string {
  const configuredUrl = process.env.EXPO_PUBLIC_API_URL;
  if (configuredUrl) {
    return configuredUrl;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  }

  return 'http://localhost:3000/api';
}

/**
 * Servicio centralizado de red para la aplicación móvil "Mejora SJR".
 * 
 * Principios aplicados:
 * - DIP (Dependency Inversion Principle):
 *   1. Implementa el contrato IApiService para que los ViewModels dependan de una interfaz.
 *   2. Depende del contrato abstracto ITokenStorage para obtener el JWT, permitiendo
 *      reemplazar el gestor de almacenamiento sin tocar la lógica de red.
 * - Centralización:
 *   1. Incrusta automáticamente el encabezado Authorization: Bearer <token>.
 *   2. Estandariza el manejo y tipado de errores HTTP con ApiError.
 */
export class ApiService implements IApiService {
  private readonly baseUrl: string;
  private readonly tokenStorage: ITokenStorage;

  constructor(
    tokenStorage: ITokenStorage = new TokenStorage(),
    baseUrl: string = resolveDefaultBaseUrl()
  ) {
    this.tokenStorage = tokenStorage;
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  }

  /**
   * Método auxiliar para construir encabezados e incrustar el token JWT si aplica.
   */
  private async buildHeaders(options?: RequestOptions): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options?.headers || {}),
    };

    // Por defecto, todas las peticiones requieren autenticación a menos que se indique lo contrario
    const requiresAuth = options?.requiresAuth ?? true;

    if (requiresAuth) {
      const token = await this.tokenStorage.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Ejecuta la petición HTTP con fetch nativo y procesa la respuesta.
   */
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    body?: unknown,
    options?: RequestOptions
  ): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;
    const headers = await this.buildHeaders(options);

    const init: RequestInit = {
      method,
      headers,
    };

    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, init);

      let responseData: unknown = null;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        const text = await response.text();
        responseData = text ? { message: text } : null;
      }

      if (!response.ok) {
        const errorMessage =
          typeof responseData === 'object' && responseData !== null && 'message' in responseData
            ? String((responseData as { message: unknown }).message)
            : `Error HTTP ${response.status}: ${response.statusText}`;

        throw new ApiError(errorMessage, response.status, responseData);
      }

      return responseData as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      const networkMessage =
        error instanceof Error ? error.message : 'Error desconocido al comunicar con el servidor';
      throw new ApiError(networkMessage, undefined, error);
    }
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'GET', undefined, options);
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'POST', body, options);
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'PUT', body, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, 'DELETE', undefined, options);
  }
}
