import type { CrearReportePayload, EvidenciaArchivo } from '../../models/Reporte';

export interface ReporteCreadoResponse {
  IdReporte: number;
  [key: string]: unknown;
}

export interface EvidenciaSubidaResponse {
  EvidenciaUrl: string;
  [key: string]: unknown;
}

/**
 * Contrato de servicio para creación de reportes y carga de evidencia (HU-17).
 * Cumple con ISP: Segregación de interfaz específica para reporte y multimedia.
 */
export interface IReporteApiService {
  crearReporte(payload: CrearReportePayload): Promise<ReporteCreadoResponse>;
  subirEvidencia(idReporte: number | string, archivo: EvidenciaArchivo): Promise<EvidenciaSubidaResponse>;
}
