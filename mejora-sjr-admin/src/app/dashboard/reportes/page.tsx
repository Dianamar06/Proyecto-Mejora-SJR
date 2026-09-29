'use client';

/**
 * @adapter ReportesPage
 * Adaptador que conecta useReportes (ViewModel) con ReportesMonitorView (Vista).
 * Ruta: /dashboard/reportes
 *
 * ================================================================
 * ÚNICA RESPONSABILIDAD DE ESTE ARCHIVO:
 * ================================================================
 * 1. Elegir e importar la implementación concreta del servicio.
 * 2. Inyectarla al Custom Hook `useReportes`.
 * 3. Pasar los props resultantes a la Vista.
 *
 * Para conectar el backend REAL, cambia solo la línea marcada con ★:
 *   - Cambia: reportesServiceMock
 *   - Por:    reportesApiService   (importado de @/services/reportesService)
 * ================================================================
 */

import { useMemo } from 'react';
import { useReportes } from '@/viewModels/useReportes';
// ★ CONECTADO AL BACKEND REAL
import { reportesApiService } from '@/services/reportesService';
import { ReportesMonitorView } from '@/views/ReportesMonitorView';

export default function ReportesPage() {
  // Estabilizamos la referencia con useMemo (igual que en DashboardPage)
  const service = useMemo(() => reportesApiService, []);

  const {
    reportes,
    total,
    isLoading,
    error,
    filtros,
    setFiltroEstado,
    setFiltroCategoria,
    recargar,
  } = useReportes(service);

  return (
    <ReportesMonitorView
      reportes={reportes}
      total={total}
      isLoading={isLoading}
      error={error}
      filtros={filtros}
      onFiltroEstado={setFiltroEstado}
      onFiltroCategoria={setFiltroCategoria}
      onRecargar={recargar}
    />
  );
}
