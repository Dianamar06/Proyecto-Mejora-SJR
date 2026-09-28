/** Contrato exacto de creación definido por HU-12. */
export interface CrearReportePayload {
  Titulo: string;
  Descripcion: string;
  UbicacionLatitud: number;
  UbicacionLongitud: number;
  DireccionFisica: string;
  EvidenciaUrl: string;
  IdCategoria: number;
}

export interface CategoriaReporte {
  IdCategoria: number;
  Nombre: string;
}

/** TextInput conserva texto, incluso mientras se escribe un signo o decimal. */
export type ReporteFormulario = {
  [K in keyof CrearReportePayload]: K extends 'IdCategoria' ? number | null : string;
};

export type ErroresReporte = Partial<Record<keyof CrearReportePayload, string>>;

export interface Reporte extends CrearReportePayload {
  IdReporte: number;
  IdUsuario: number;
  IdEstado: number;
  FechaCreacion: string;
  FechaActualizacion: string;
}

export function isReporte(obj: unknown): obj is Reporte {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  
  return (
    typeof r.IdReporte === 'number' &&
    typeof r.Titulo === 'string' &&
    typeof r.Descripcion === 'string' &&
    typeof r.UbicacionLatitud === 'number' &&
    typeof r.UbicacionLongitud === 'number' &&
    typeof r.IdUsuario === 'number' &&
    typeof r.IdCategoria === 'number' &&
    typeof r.IdEstado === 'number' &&
    typeof r.FechaCreacion === 'string' &&
    typeof r.FechaActualizacion === 'string'
  );
}
