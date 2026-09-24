'use client';

/**
 * @viewModel useDashboardViewModel
 * Custom Hook que gestiona TODO el estado y lógica del Dashboard.
 *
 * ============================================================
 * REGLAS ARQUITECTÓNICAS APLICADAS:
 * ============================================================
 *
 * [MVVM] Es el único lugar donde vive el estado del Dashboard.
 * La Vista (DashboardView) es pasiva y recibe solo props de este hook.
 *
 * [SRP] Este hook SOLO maneja lógica de presentación del Dashboard:
 * carga de datos, estados de carga y error. No dibuja JSX.
 *
 * [DIP] Recibe `service: IDashboardService` como PARÁMETRO.
 * JAMÁS importa dashboardServiceMock ni axios directamente.
 * El adaptador (page.tsx) decide qué implementación inyectar.
 *
 * [ISP] Expone únicamente { resumen, isLoading, error }.
 * La Vista nunca recibe el objeto service completo.
 * ============================================================
 */

import { useState, useEffect } from 'react';
import type { IDashboardService, DashboardResumen } from '@/services/contracts/IDashboardService';

// ─── Tipos del estado público expuesto a la Vista ──────────────────────────

export interface DashboardViewState {
  resumen: DashboardResumen | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

/**
 * @param service Implementación del contrato IDashboardService inyectada
 *                por el adaptador (page.tsx). Nunca se importa directamente aquí.
 */
export function useDashboardViewModel(service: IDashboardService): DashboardViewState {
  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false; // Evita actualizar estado en componentes desmontados

    async function cargarResumen() {
      setIsLoading(true);
      setError(null);

      try {
        const datos = await service.getResumenDashboard();
        if (!cancelado) {
          setResumen(datos);
        }
      } catch (err) {
        if (!cancelado) {
          const mensaje =
            err instanceof Error
              ? err.message
              : 'Error desconocido al cargar el dashboard.';
          setError(mensaje);
        }
      } finally {
        if (!cancelado) {
          setIsLoading(false);
        }
      }
    }

    cargarResumen();

    // Cleanup: marca como cancelado si el componente se desmonta antes de que termine
    return () => {
      cancelado = true;
    };
  }, [service]);

  // Expone SOLO lo que la Vista necesita pintar. Nada más.
  return { resumen, isLoading, error };
}
