import { IApiService, RequestOptions } from '../contracts/IApiService';

/**
 * Mock de IApiService para pruebas y desarrollo desacoplado.
 * 
 * Permite simular respuestas de la API sin requerir un servidor activo.
 * Demuestra la ventaja fundamental de DIP: el ViewModel no distingue
 * si está consumiendo la red real o este mock.
 */
export class ApiServiceMock implements IApiService {
  private mockResponses: Map<string, unknown> = new Map();

  setMockResponse(endpoint: string, data: unknown): void {
    this.mockResponses.set(endpoint, data);
  }

  async get<T>(endpoint: string, _options?: RequestOptions): Promise<T> {
    return (this.mockResponses.get(endpoint) || { success: true }) as T;
  }

  async post<T>(endpoint: string, _body?: unknown, _options?: RequestOptions): Promise<T> {
    return (this.mockResponses.get(endpoint) || { token: 'mock-jwt-token-12345' }) as T;
  }

  async put<T>(endpoint: string, _body?: unknown, _options?: RequestOptions): Promise<T> {
    return (this.mockResponses.get(endpoint) || { success: true }) as T;
  }

  async delete<T>(endpoint: string, _options?: RequestOptions): Promise<T> {
    return (this.mockResponses.get(endpoint) || { success: true }) as T;
  }
}
