/**
 * IReportesService — Contrato del servicio de reportes ciudadanos.
 *
 * ================================================================
 * REGLAS ARQUITECTÓNICAS APLICADAS:
 * ================================================================
 * [ISP]  La interfaz expone solo lo que el módulo de reportes necesita.
 * [DIP]  El ViewModel depende de esta ABSTRACCIÓN, nunca de fetch/axios.
 * [SRP]  Este archivo define tipos de dominio + contrato HTTP. Nada más.
 * ================================================================
 */

import type { Reporte } from '@/models/Reporte';

// ─── Tipos de filtros disponibles ────────────────────────────────────────────

/** Valores permitidos para el filtro de Estado (IdEstado). 0 = todos. */
export type EstadoFiltro = 0 | 1 | 2 | 3 | 4;

/** Valores permitidos para el filtro de Categoría (IdCategoria). 0 = todas. */
export type CategoriaFiltro = number;

export interface ReportesFiltros {
  /** IdEstado de BD. 0 significa "sin filtrar". */
  estado?: EstadoFiltro;
  /** IdCategoria de BD. 0 significa "sin filtrar". */
  categoria?: CategoriaFiltro;
}

// ─── Respuesta paginada del backend ──────────────────────────────────────────

export interface ReportesResponse {
  /** Lista de reportes de la página actual */
  reportes: Reporte[];
  /** Total de registros en BD (para paginación futura) */
  total: number;
}

// ─── Contrato del servicio ───────────────────────────────────────────────────

export interface IReportesService {
  /**
   * Obtiene la lista paginada de reportes aplicando filtros opcionales.
   * El servicio concreto es responsable de inyectar el JWT en los headers.
   *
   * @param filtros Filtros opcionales: { estado, categoria }
   * @throws {Error} con mensaje legible si la petición falla (401, 500, red…)
   */
  getReportes(filtros?: ReportesFiltros): Promise<ReportesResponse>;
}
