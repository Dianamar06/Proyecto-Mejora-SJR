'use client';

/**
 * @adapter DashboardPage
 * Adaptador que conecta el ViewModel con la Vista para la ruta /dashboard.
 *
 * ============================================================
 * RESPONSABILIDAD DE ESTE ARCHIVO:
 * Es el ÚNICO lugar autorizado para:
 *   1. Importar la implementación concreta del servicio (mock o API real)
 *   2. Instanciar/obtener el servicio e inyectarlo al ViewModel
 *   3. Llamar al Custom Hook (useDashboardViewModel)
 *   4. Pasar los props resultantes a la Vista (DashboardView)
 *
 * El DÍA que el backend esté listo, SOLO este archivo cambia:
 *   - Se reemplaza `dashboardServiceMock` por `dashboardServiceApi`
 *   - El ViewModel y la Vista NO se tocan.
 * ============================================================
 */

import { useMemo } from 'react';
import { useDashboardViewModel } from '@/viewModels/useDashboardViewModel';
import { dashboardServiceMock } from '@/services/mocks/dashboardServiceMock';
import { DashboardView } from '@/views/DashboardView';

export default function DashboardPage() {
  /**
   * Estabilizamos la referencia al servicio con useMemo para que
   * el useEffect del ViewModel no se dispare en cada render.
   * Cuando se use un servicio singleton real, esto ya no será necesario.
   */
  const service = useMemo(() => dashboardServiceMock, []);

  // ── Inyección de dependencia: el ViewModel recibe el servicio por parámetro ──
  const { resumen, isLoading, error } = useDashboardViewModel(service);

  // ── La Vista recibe SOLO los props mínimos que necesita pintar ──
  return (
    <DashboardView
      resumen={resumen}
      isLoading={isLoading}
      error={error}
    />
  );
}
