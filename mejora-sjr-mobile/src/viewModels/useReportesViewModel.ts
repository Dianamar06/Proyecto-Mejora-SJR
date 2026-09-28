import { useCallback, useEffect, useState } from 'react';

import { isReporte } from '../models/Reporte';
import type { IApiService } from '../services/contracts/IApiService';

// ISP: este caso de uso no necesita post, put ni delete.
export type ReportesHttpService = Pick<IApiService, 'get'>;

const estadoLabels: Partial<Record<number, string>> = {
  1: 'Recibido',
  2: 'En Revisión',
  3: 'En Progreso',
  4: 'Resuelto',
};

export type ReporteListItem = {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
};

type ReportesState = {
  isLoading: boolean;
  reportes: ReporteListItem[];
  error: string | null;
};

function toListItems(response: unknown): ReporteListItem[] {
  if (typeof response !== 'object' || response === null ||
    !('success' in response) || response.success !== true ||
    !('data' in response) || !Array.isArray(response.data) ||
    !response.data.every(isReporte)) {
    throw new Error('La respuesta de reportes no tiene el formato esperado.');
  }

  const ids = new Set<string>();
  return response.data.map((reporte) => {
    const idStr = String(reporte.IdReporte);
    if (ids.has(idStr)) throw new Error('La respuesta contiene identificadores de reportes duplicados.');
    ids.add(idStr);
    return {
      id: idStr,
      titulo: reporte.Titulo.trim() || 'Sin título',
      descripcion: reporte.Descripcion.trim() || 'Sin descripción',
      estado: estadoLabels[reporte.IdEstado] ?? `Estado ${reporte.IdEstado}`,
    };
  });
}

export function useReportesViewModel(apiService: ReportesHttpService) {
  const [state, setState] = useState<ReportesState>({
    isLoading: true, reportes: [], error: null,
  });
  const [revision, setRevision] = useState(0);

  const reload = useCallback(() => {
    setState({ isLoading: true, reportes: [], error: null });
    setRevision((current) => current + 1);
  }, []);

  useEffect(() => {
    let active = true;
    setState({ isLoading: true, reportes: [], error: null });

    async function load() {
      try {
        const response = await apiService.get<unknown>('/reportes');
        const reportes = toListItems(response);
        if (active) setState({ isLoading: false, reportes, error: null });
      } catch (cause) {
        if (active) {
          setState({
            isLoading: false,
            reportes: [],
            error: cause instanceof Error && cause.message.trim()
              ? cause.message
              : 'No se pudieron cargar los reportes. Intenta nuevamente.',
          });
        }
      }
    }

    void load();
    // Ignora respuestas de una carga anterior, de otro servicio o tras desmontar.
    return () => { active = false; };
  }, [apiService, revision]);

  return { ...state, reload };
}
