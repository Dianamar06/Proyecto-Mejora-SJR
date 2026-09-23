/**
 * @contract IDashboardService
 * Interfaz que define las capacidades mínimas que el ViewModel del Dashboard necesita.
 *
 * REGLA DIP (Inversión de Dependencias):
 * El ViewModel dependerá de ESTA interfaz, nunca de una implementación concreta.
 * Esto permite sustituir la implementación (mock ↔ API real) sin tocar el ViewModel.
 *
 * REGLA ISP (Segregación de Interfaces):
 * Este contrato solo expone los métodos que el Dashboard necesita.
 * No obliga a implementar métodos ajenos al caso de uso.
 */

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
