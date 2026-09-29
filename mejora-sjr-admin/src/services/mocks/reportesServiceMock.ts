/**
 * @mock reportesServiceMock
 * Implementación falsa de IReportesService para desarrollo local.
 *
 * Simula la respuesta del backend con datos realistas.
 * Soporta filtrado por estado y categoría para validar la UI sin backend.
 *
 * REGLA: Este archivo NUNCA se importa en producción.
 *        Solo el adaptador page.tsx lo usa durante desarrollo.
 */

import type { IReportesService, ReportesFiltros, ReportesResponse } from '../contracts/IReportesService';
import type { Reporte } from '@/models/Reporte';

const REPORTES_DEMO: Reporte[] = [
  {
    IdReporte: 1,
    Titulo: 'Bache peligroso en Av. Constitución',
    Descripcion: 'Bache de aproximadamente 40cm de diámetro que pone en riesgo a motociclistas.',
    UbicacionLatitud: 20.3934,
    UbicacionLongitud: -99.9979,
    DireccionFisica: 'Av. Constitución 145, Col. Centro',
    EvidenciaUrl: 'https://placehold.co/200x200/1C2333/94A3B8?text=Bache',
    IdUsuario: 101,
    IdCategoria: 7,
    IdEstado: 1,
    FechaCreacion: '2026-09-10T10:30:00.000Z',
    FechaActualizacion: '2026-09-10T10:30:00.000Z',
  },
  {
    IdReporte: 2,
    Titulo: 'Lámpara fundida en Parque Hidalgo',
    Descripcion: 'Dos luminarias apagadas en la sección norte del parque, zona de alto tránsito nocturno.',
    UbicacionLatitud: 20.3910,
    UbicacionLongitud: -99.9965,
    DireccionFisica: 'Parque Hidalgo, San Juan del Río',
    EvidenciaUrl: null,
    IdUsuario: 102,
    IdCategoria: 2,
    IdEstado: 2,
    FechaCreacion: '2026-09-12T08:15:00.000Z',
    FechaActualizacion: '2026-09-13T09:00:00.000Z',
  },
  {
    IdReporte: 3,
    Titulo: 'Fuga de agua en calle Morelos',
    Descripcion: 'Fuga de agua potable visible desde la banqueta, lleva 3 días activa.',
    UbicacionLatitud: 20.3945,
    UbicacionLongitud: -99.9950,
    DireccionFisica: 'Calle Morelos 88, Col. San Sebastián',
    EvidenciaUrl: 'https://placehold.co/200x200/1C2333/94A3B8?text=Fuga',
    IdUsuario: 103,
    IdCategoria: 3,
    IdEstado: 3,
    FechaCreacion: '2026-09-15T14:00:00.000Z',
    FechaActualizacion: '2026-09-16T11:30:00.000Z',
  },
  {
    IdReporte: 4,
    Titulo: 'Basura acumulada en baldío municipal',
    Descripcion: 'Depósito clandestino de residuos en terreno municipal genera plagas.',
    UbicacionLatitud: 20.3901,
    UbicacionLongitud: -100.0010,
    DireccionFisica: 'Calle Juárez esq. Guerrero',
    EvidenciaUrl: null,
    IdUsuario: 104,
    IdCategoria: 6,
    IdEstado: 4,
    FechaCreacion: '2026-09-18T09:45:00.000Z',
    FechaActualizacion: '2026-09-22T16:00:00.000Z',
  },
  {
    IdReporte: 5,
    Titulo: 'Semáforo en mal estado en glorieta',
    Descripcion: 'Semáforo peatonal parpadeante en rojo sin ciclo correcto.',
    UbicacionLatitud: 20.3920,
    UbicacionLongitud: -99.9985,
    DireccionFisica: 'Glorieta Principal, Centro',
    EvidenciaUrl: 'https://placehold.co/200x200/1C2333/94A3B8?text=Semáforo',
    IdUsuario: 105,
    IdCategoria: 7,
    IdEstado: 1,
    FechaCreacion: '2026-09-20T07:00:00.000Z',
    FechaActualizacion: '2026-09-20T07:00:00.000Z',
  },
  {
    IdReporte: 6,
    Titulo: 'Árbol caído obstruye carril vehicular',
    Descripcion: 'Árbol caído tras tormenta eléctrica bloquea parcialmente la vialidad.',
    UbicacionLatitud: 20.3955,
    UbicacionLongitud: -100.0030,
    DireccionFisica: 'Blvd. De la Nación km 3',
    EvidenciaUrl: null,
    IdUsuario: 106,
    IdCategoria: 4,
    IdEstado: 2,
    FechaCreacion: '2026-09-25T06:30:00.000Z',
    FechaActualizacion: '2026-09-25T08:00:00.000Z',
  },
  {
    IdReporte: 7,
    Titulo: 'Grafiti en monumento histórico',
    Descripcion: 'Pintas sobre la fachada del edificio del Palacio Municipal.',
    UbicacionLatitud: 20.3935,
    UbicacionLongitud: -99.9975,
    DireccionFisica: 'Palacio Municipal, Plaza Principal',
    EvidenciaUrl: 'https://placehold.co/200x200/1C2333/94A3B8?text=Grafiti',
    IdUsuario: 107,
    IdCategoria: 8,
    IdEstado: 3,
    FechaCreacion: '2026-09-27T11:00:00.000Z',
    FechaActualizacion: '2026-09-28T09:00:00.000Z',
  },
];

class ReportesServiceMock implements IReportesService {
  async getReportes(filtros?: ReportesFiltros): Promise<ReportesResponse> {
    // Simula latencia de red
    await new Promise((resolve) => setTimeout(resolve, 700));

    let resultado = [...REPORTES_DEMO];

    if (filtros?.estado && (filtros.estado as number) !== 0) {
      resultado = resultado.filter((r) => r.IdEstado === filtros.estado);
    }
    if (filtros?.categoria && (filtros.categoria as number) !== 0) {
      resultado = resultado.filter((r) => r.IdCategoria === filtros.categoria);
    }

    return { reportes: resultado, total: resultado.length };
  }
}

export const reportesServiceMock = new ReportesServiceMock();
