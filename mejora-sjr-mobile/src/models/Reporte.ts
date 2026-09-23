// Contrato de GET /api/reportes. Se conserva el nombre de las columnas del backend.
export interface Reporte {
  IdReporte: number;
  Titulo: string;
  Descripcion: string;
  UbicacionLatitud: number;
  UbicacionLongitud: number;
  DireccionFisica?: string | null;
  EvidenciaUrl?: string | null;
  IdUsuario: number;
  IdCategoria: number;
  IdEstado: number;
  FechaCreacion: string;
  FechaActualizacion: string;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isOptionalText(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

export function isReporte(value: unknown): value is Reporte {
  if (typeof value !== 'object' || value === null) return false;
  const reporte = value as Record<string, unknown>;
  return isFiniteNumber(reporte.IdReporte) &&
    typeof reporte.Titulo === 'string' &&
    typeof reporte.Descripcion === 'string' &&
    isFiniteNumber(reporte.UbicacionLatitud) &&
    isFiniteNumber(reporte.UbicacionLongitud) &&
    isOptionalText(reporte.DireccionFisica) &&
    isOptionalText(reporte.EvidenciaUrl) &&
    isFiniteNumber(reporte.IdUsuario) &&
    isFiniteNumber(reporte.IdCategoria) &&
    isFiniteNumber(reporte.IdEstado) &&
    typeof reporte.FechaCreacion === 'string' &&
    typeof reporte.FechaActualizacion === 'string';
}
