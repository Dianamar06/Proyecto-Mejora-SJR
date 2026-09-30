/**
 * reportesService — Implementación concreta de IReportesService.
 *
 * ================================================================
 * REGLAS ARQUITECTÓNICAS APLICADAS:
 * ================================================================
 * [SRP]  Única responsabilidad: realizar peticiones HTTP a /api/reportes.
 * [DIP]  Implementa IReportesService; el ViewModel nunca importa este
 *        archivo directamente (lo hace el adaptador page.tsx).
 * [SEC]  Inyecta el JWT desde localStorage en cada petición GET.
 *        Si el token no existe o expira (401), lanza un Error descriptivo.
 * ================================================================
 *
 * Configura la URL base en tu .env.local:
 *   NEXT_PUBLIC_API_BASE_URL=https://api.mejorasjr.mx
 */

import type { IReportesService, ReportesFiltros, ReportesResponse } from './contracts/IReportesService';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:5000';

class ReportesApiService implements IReportesService {
  /**
   * Construye los query params a partir de los filtros.
   * Solo agrega params cuando el valor es distinto de 0 / undefined.
   */
  private buildQueryString(filtros?: ReportesFiltros): string {
    const params = new URLSearchParams();

    if (filtros?.estado && (filtros.estado as number) !== 0) {
      params.set('estado', String(filtros.estado));
    }
    if (filtros?.categoria && (filtros.categoria as number) !== 0) {
      params.set('categoria', String(filtros.categoria));
    }

    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  /**
   * Obtiene el JWT del almacenamiento local e inyecta el header Authorization.
   * @throws {Error} Si no hay token en sesión (fuerza re-login).
   */
  private getAuthHeaders(): HeadersInit {
    // ⚠️ La key DEBE coincidir con la que useLoginViewModel persiste al hacer login.
    // useLoginViewModel → sessionStorage.setItem("sjr_token", response.token)
    const token =
      typeof window !== 'undefined'
        ? (sessionStorage.getItem('sjr_token') ?? localStorage.getItem('sjr_token'))
        : null;

    if (!token) {
      throw new Error('No autenticado: inicia sesión para continuar.');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  }

  async getReportes(filtros?: ReportesFiltros): Promise<ReportesResponse> {
    const qs = this.buildQueryString(filtros);
    const url = `${API_BASE}/api/reportes${qs}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (response.status === 401) {
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const mensaje =
        (errorBody as { message?: string }).message ??
        `Error ${response.status}: ${response.statusText}`;
      throw new Error(mensaje);
    }

    const data = await response.json();
    return {
      reportes: data.data,
      total: data.total
    };
  }
}

/** Instancia Singleton lista para ser inyectada por el adaptador (page.tsx). */
export const reportesApiService = new ReportesApiService();
