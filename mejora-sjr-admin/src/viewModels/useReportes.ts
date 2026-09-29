'use client';

/**
 * @viewModel useReportes
 * Custom Hook que gestiona TODA la lógica del módulo de Monitoreo de Reportes.
 *
 * ================================================================
 * REGLAS ARQUITECTÓNICAS APLICADAS:
 * ================================================================
 * [MVVM] Es el único lugar donde vive el estado del listado de reportes.
 *        La Vista (ReportesMonitorView) es pasiva y recibe solo props.
 *
 * [SRP]  SOLO maneja: carga de datos, filtros, loading y error.
 *        No dibuja JSX. No conoce cómo se hace el fetch.
 *
 * [DIP]  Recibe `service: IReportesService` como PARÁMETRO.
 *        JAMÁS importa reportesApiService directamente.
 *        El adaptador (page.tsx) decide qué implementación inyectar.
 *
 * [ISP]  Expone solo { reportes, total, isLoading, error, filtros,
 *                      setFiltroEstado, setFiltroCategoria, recargar }.
 * ================================================================
 */

import { useState, useEffect, useCallback } from 'react';
import type { IReportesService, ReportesFiltros, EstadoFiltro, CategoriaFiltro } from '@/services/contracts/IReportesService';
import type { Reporte } from '@/models/Reporte';

// ─── Estado público que expone el Hook a la Vista ────────────────────────────

export interface ReportesViewState {
  reportes: Reporte[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filtros: ReportesFiltros;
  /** Cambia el filtro de estado y recarga automáticamente */
  setFiltroEstado: (estado: EstadoFiltro) => void;
  /** Cambia el filtro de categoría y recarga automáticamente */
  setFiltroCategoria: (categoria: CategoriaFiltro) => void;
  /** Fuerza una recarga manual (ej: botón "Actualizar") */
  recargar: () => void;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

/**
 * @param service Implementación de IReportesService inyectada por el adaptador.
 */
export function useReportes(service: IReportesService): ReportesViewState {
  const [reportes, setReportes]     = useState<Reporte[]>([]);
  const [total, setTotal]           = useState<number>(0);
  const [isLoading, setIsLoading]   = useState<boolean>(true);
  const [error, setError]           = useState<string | null>(null);
  const [filtros, setFiltros]       = useState<ReportesFiltros>({});
  /** Token de recarga: incrementarlo forza un nuevo fetch */
  const [refreshToken, setRefreshToken] = useState<number>(0);

  // ── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelado = false;

    async function cargarReportes() {
      setIsLoading(true);
      setError(null);

      try {
        const { reportes: datos, total: ttl } = await service.getReportes(filtros);
        if (!cancelado) {
          setReportes(datos);
          setTotal(ttl);
        }
      } catch (err) {
        if (!cancelado) {
          const mensaje =
            err instanceof Error
              ? err.message
              : 'Error desconocido al cargar los reportes.';
          setError(mensaje);
        }
      } finally {
        if (!cancelado) setIsLoading(false);
      }
    }

    cargarReportes();

    return () => {
      cancelado = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service, filtros, refreshToken]);

  // ── Acciones expuestas a la Vista ──────────────────────────────────────────

  const setFiltroEstado = useCallback((estado: EstadoFiltro) => {
    setFiltros((prev) => ({ ...prev, estado }));
  }, []);

  const setFiltroCategoria = useCallback((categoria: CategoriaFiltro) => {
    setFiltros((prev) => ({ ...prev, categoria }));
  }, []);

  const recargar = useCallback(() => {
    setRefreshToken((n) => n + 1);
  }, []);

  return {
    reportes,
    total,
    isLoading,
    error,
    filtros,
    setFiltroEstado,
    setFiltroCategoria,
    recargar,
  };
}
