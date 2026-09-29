import type { EvidenciaArchivo } from '../../models/Reporte';
import type { EvidenciaSubidaResponse, IReporteApiService, ReporteCreadoResponse } from '../contracts/IReporteApiService';

/**
 * Acuerdo temporal: atribuye los reportes al usuario de prueba 1 si no viene en el token.
 */
export function conUsuarioTemporal(apiService: IReporteApiService): IReporteApiService {
  return {
    async crearReporte(payload): Promise<ReporteCreadoResponse> {
      const payloadTemporal = { ...payload, IdUsuario: 1 };
      return apiService.crearReporte(payloadTemporal as any);
    },
    async subirEvidencia(idReporte: number | string, archivo: EvidenciaArchivo): Promise<EvidenciaSubidaResponse> {
      return apiService.subirEvidencia(idReporte, archivo);
    },
  };
}
