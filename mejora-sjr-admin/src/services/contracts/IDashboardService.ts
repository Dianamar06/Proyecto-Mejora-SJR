import type { Reporte } from '@/models/Reporte';

export interface DashboardResumen {
  totalReportes: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  reportesRecientes: Reporte[];
}

export interface IDashboardService {
  getResumenDashboard(): Promise<DashboardResumen>;
}
