/**
 * Opciones de configuración para cada petición HTTP.
 */
export interface RequestOptions {
  /**
   * Encabezados adicionales a enviar.
   */
  headers?: Record<string, string>;

  /**
   * Determina si la petición debe incluir automáticamente el encabezado
   * Authorization: Bearer <token>. Por defecto es true.
   */
  requiresAuth?: boolean;
}

/**
 * Error estandarizado de la capa de red para el cliente móvil.
 */
export class ApiError extends Error {
  public readonly status?: number;
  public readonly data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Contrato de servicio de red para la aplicación móvil.
 * 
 * Cumple con DIP (Dependency Inversion Principle):
 * Los ViewModels dependerán exclusivamente de esta abstracción,
 * permitiendo sustituir la implementación real por Mocks en pruebas
 * o cambiar la biblioteca de red sin modificar la lógica de presentación.
 */
export interface IApiService {
  /**
   * Ejecuta una petición GET.
   */
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;

  /**
   * Ejecuta una petición POST con cuerpo JSON opcional.
   */
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>;

  /**
   * Ejecuta una petición PUT con cuerpo JSON opcional.
   */
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T>;

  /**
   * Ejecuta una petición DELETE.
   */
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;
}
