import type { IDashboardService, DashboardResumen } from './contracts/IDashboardService';
import { reportesApiService } from './reportesService';

export class DashboardApiService implements IDashboardService {
  async getResumenDashboard(): Promise<DashboardResumen> {
    const { reportes } = await reportesApiService.getReportes();

    const resumen: DashboardResumen = {
      totalReportes: reportes.length,
      pendientes: reportes.filter(r => r.IdEstado === 1).length,
      enProceso: reportes.filter(r => r.IdEstado === 2 || r.IdEstado === 3).length,
      resueltos: reportes.filter(r => r.IdEstado === 4).length,
      reportesRecientes: [...reportes]
        .sort((a, b) => new Date(b.FechaCreacion).getTime() - new Date(a.FechaCreacion).getTime())
        .slice(0, 5),
    };

    return resumen;
  }
}

export const dashboardApiService = new DashboardApiService();
