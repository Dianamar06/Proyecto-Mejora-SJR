/**
 * AuthApiService — Implementación concreta de IAuthService.
 *
 * Usa la Fetch API nativa. Si el proyecto migra a Axios u otro cliente,
 * sólo se reemplaza ESTE archivo; el ViewModel y la Vista no cambian.
 *
 * Registrar la URL base en la variable de entorno:
 *   NEXT_PUBLIC_API_BASE_URL=https://api.mejorasjr.mx
 */

import type { IAuthService, LoginPayload, LoginResponse } from "./IAuthService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export class AuthApiService implements IAuthService {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // Intenta extraer un mensaje de error del cuerpo; si no, usa el status
      const errorBody = await response.json().catch(() => ({}));
      const mensaje =
        (errorBody as { message?: string }).message ??
        `Error ${response.status}: ${response.statusText}`;
      throw new Error(mensaje);
    }

    return response.json() as Promise<LoginResponse>;
  }

  async register(payload: import("./IAuthService").RegisterPayload): Promise<void> {
    const response = await fetch(`${API_BASE}/api/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const mensaje =
        (errorBody as { message?: string }).message ??
        `Error al registrar usuario: ${response.status}`;
      throw new Error(mensaje);
    }
  }
}

/** Instancia Singleton lista para ser inyectada por defecto */
export const authApiService = new AuthApiService();
