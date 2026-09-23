/**
 * @service dashboardServiceMock
 * Implementación SIMULADA del contrato IDashboardService.
 *
 * PROPÓSITO: Permite desarrollar y probar el ViewModel y la Vista
 * sin depender del servidor backend real (Sprint 2 — "Datos Simulados").
 *
 * REGLA DIP: Implementa IDashboardService. Puede sustituirse por
 * dashboardServiceApi.ts sin modificar el ViewModel ni la Vista.
 *
 * REGLA SRP: Solo simula datos de red. No dibuja UI ni maneja estado visual.
 */

import type { IDashboardService, DashboardResumen } from '@/services/contracts/IDashboardService';
import type { Reporte } from '@/models/Reporte';

const MOCK_REPORTES_RECIENTES: Reporte[] = [
  {
    id: 'rep_001',
    descripcion: 'Bache profundo frente a la parada de autobuses en Av. Juárez.',
    estado: 'pendiente',
    prioridad: 'alta',
    categoria: 'baches_pavimento',
    direccionReferencia: 'Av. Juárez Poniente #123, Col. Centro',
    fechaCreacion: '2026-09-20T10:30:00.000Z',
    usuarioId: 'usr_aB3kL9',
  },
  {
    id: 'rep_002',
    descripcion: 'Luminaria apagada en Calle Morelos desde hace 5 días.',
    estado: 'en_revision',
    prioridad: 'media',
    categoria: 'alumbrado_publico',
    direccionReferencia: 'Calle Morelos #45, Col. Centro',
    fechaCreacion: '2026-09-19T08:15:00.000Z',
    usuarioId: 'usr_cD7mNp',
  },
  {
    id: 'rep_003',
    descripcion: 'Fuga de agua en tubería principal, caudal visible en banqueta.',
    estado: 'en_proceso',
    prioridad: 'alta',
    categoria: 'agua_drenaje',
    direccionReferencia: 'Blvd. San Juan #890, Col. Jardines',
    fechaCreacion: '2026-09-18T14:00:00.000Z',
    usuarioId: 'usr_eF2qRs',
  },
  {
    id: 'rep_004',
    descripcion: 'Contenedor de basura desbordado, lleva 3 días sin recolección.',
    estado: 'resuelto',
    prioridad: 'baja',
    categoria: 'recoleccion_basura',
    direccionReferencia: 'Prolongación Constitución #210',
    fechaCreacion: '2026-09-17T09:00:00.000Z',
    usuarioId: 'usr_gH5tUv',
  },
  {
    id: 'rep_005',
    descripcion: 'Semáforo sin funcionar en cruce de alta afluencia vehicular.',
    estado: 'pendiente',
    prioridad: 'alta',
    categoria: 'seguridad_vial',
    direccionReferencia: 'Intersección Av. 5 de Febrero y Calle 16 de Sept.',
    fechaCreacion: '2026-09-22T07:45:00.000Z',
    usuarioId: 'usr_iJ8wXy',
  },
];

const MOCK_RESUMEN: DashboardResumen = {
  totalReportes: 128,
  pendientes: 47,
  enProceso: 31,
  resueltos: 50,
  reportesRecientes: MOCK_REPORTES_RECIENTES,
};

/** Simula la latencia de una petición HTTP real (1.2 segundos) */
const simularLatencia = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardServiceMock: IDashboardService = {
  async getResumenDashboard(): Promise<DashboardResumen> {
    await simularLatencia(1200);
    return MOCK_RESUMEN;
  },
};
