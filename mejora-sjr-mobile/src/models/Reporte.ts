/** Contrato exacto de creación definido por HU-12 y HU-17. */
export interface CrearReportePayload {
  Titulo: string;
  Descripcion: string;
  UbicacionLatitud: number;
  UbicacionLongitud: number;
  IdCategoria: number;
  DireccionFisica?: string | null;
  EvidenciaUrl?: string | null;
}

export interface EvidenciaArchivo {
  uri: string;
  name?: string;
  type?: string;
}

export interface CategoriaReporte {
  IdCategoria: number;
  Nombre: string;
}

/** TextInput conserva texto, incluso mientras se escribe un signo o decimal. */
export type ReporteFormulario = {
  Titulo: string;
  Descripcion: string;
  UbicacionLatitud: string;
  UbicacionLongitud: string;
  DireccionFisica: string;
  EvidenciaUrl: string;
  IdCategoria: number | null;
  foto?: EvidenciaArchivo | null;
};

export type ErroresReporte = Partial<Record<keyof Omit<ReporteFormulario, 'foto'>, string>>;

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

export function isReporte(obj: unknown): obj is Reporte {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  
  return (
    typeof r.IdReporte === 'number' && Number.isFinite(r.IdReporte) &&
    typeof r.Titulo === 'string' &&
    typeof r.Descripcion === 'string' &&
    typeof r.UbicacionLatitud === 'number' && Number.isFinite(r.UbicacionLatitud) &&
    typeof r.UbicacionLongitud === 'number' && Number.isFinite(r.UbicacionLongitud) &&
    (r.DireccionFisica === undefined || r.DireccionFisica === null || typeof r.DireccionFisica === 'string') &&
    (r.EvidenciaUrl === undefined || r.EvidenciaUrl === null || typeof r.EvidenciaUrl === 'string') &&
    typeof r.IdUsuario === 'number' && Number.isFinite(r.IdUsuario) &&
    typeof r.IdCategoria === 'number' && Number.isFinite(r.IdCategoria) &&
    typeof r.IdEstado === 'number' && Number.isFinite(r.IdEstado) &&
    typeof r.FechaCreacion === 'string' &&
    typeof r.FechaActualizacion === 'string' &&
    (r.DireccionFisica === undefined || r.DireccionFisica === null || typeof r.DireccionFisica === 'string') &&
    (r.EvidenciaUrl === undefined || r.EvidenciaUrl === null || typeof r.EvidenciaUrl === 'string')
  );
}
