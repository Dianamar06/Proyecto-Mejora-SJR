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
    IdReporte: 1,
    Titulo: 'Bache profundo',
    Descripcion: 'Bache profundo frente a la parada de autobuses en Av. Juárez.',
    UbicacionLatitud: 20.3845,
    UbicacionLongitud: -99.9922,
    DireccionFisica: 'Av. Juárez Poniente #123, Col. Centro',
    EvidenciaUrl: null,
    IdUsuario: 101,
    IdCategoria: 2, // baches
    IdEstado: 1, // pendiente/recibido
    FechaCreacion: '2026-09-20T10:30:00.000Z',
    FechaActualizacion: '2026-09-20T10:30:00.000Z',
  },
  {
    IdReporte: 2,
    Titulo: 'Luminaria apagada',
    Descripcion: 'Luminaria apagada en Calle Morelos desde hace 5 días.',
    UbicacionLatitud: 20.3850,
    UbicacionLongitud: -99.9910,
    DireccionFisica: 'Calle Morelos #45, Col. Centro',
    EvidenciaUrl: null,
    IdUsuario: 102,
    IdCategoria: 1, // alumbrado
    IdEstado: 2, // en revisión
    FechaCreacion: '2026-09-19T08:15:00.000Z',
    FechaActualizacion: '2026-09-19T08:15:00.000Z',
  },
  {
    IdReporte: 3,
    Titulo: 'Fuga de agua',
    Descripcion: 'Fuga de agua en tubería principal, caudal visible en banqueta.',
    UbicacionLatitud: 20.3860,
    UbicacionLongitud: -99.9900,
    DireccionFisica: 'Blvd. San Juan #890, Col. Jardines',
    EvidenciaUrl: null,
    IdUsuario: 103,
    IdCategoria: 3, // agua/drenaje
    IdEstado: 3, // en proceso
    FechaCreacion: '2026-09-18T14:00:00.000Z',
    FechaActualizacion: '2026-09-18T14:00:00.000Z',
  },
  {
    IdReporte: 4,
    Titulo: 'Contenedor de basura',
    Descripcion: 'Contenedor de basura desbordado, lleva 3 días sin recolección.',
    UbicacionLatitud: 20.3870,
    UbicacionLongitud: -99.9890,
    DireccionFisica: 'Prolongación Constitución #210',
    EvidenciaUrl: null,
    IdUsuario: 104,
    IdCategoria: 4, // recolección basura
    IdEstado: 4, // resuelto
    FechaCreacion: '2026-09-17T09:00:00.000Z',
    FechaActualizacion: '2026-09-17T09:00:00.000Z',
  },
  {
    IdReporte: 5,
    Titulo: 'Semáforo dañado',
    Descripcion: 'Semáforo sin funcionar en cruce de alta afluencia vehicular.',
    UbicacionLatitud: 20.3880,
    UbicacionLongitud: -99.9880,
    DireccionFisica: 'Intersección Av. 5 de Febrero y Calle 16 de Sept.',
    EvidenciaUrl: null,
    IdUsuario: 105,
    IdCategoria: 6, // seguridad vial
    IdEstado: 1, // recibido
    FechaCreacion: '2026-09-22T07:45:00.000Z',
    FechaActualizacion: '2026-09-22T07:45:00.000Z',
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
