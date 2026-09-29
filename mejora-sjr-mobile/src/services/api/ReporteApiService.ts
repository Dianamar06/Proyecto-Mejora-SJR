import type { CrearReportePayload, EvidenciaArchivo } from '../../models/Reporte';
import type { EvidenciaSubidaResponse, IReporteApiService, ReporteCreadoResponse } from '../contracts/IReporteApiService';
import type { ITokenStorage } from '../contracts/ITokenStorage';

/**
 * ReporteApiService — Implementación concreta de red para creación de reportes y subida de evidencia.
 * 
 * Cumple con SOLID y Reglas Arquitectónicas:
 * - SRP: Encapsula exclusivamente las llamadas HTTP hacia /reportes y /reportes/:id/evidencia.
 * - DIP: Desacoplado de librerías externas (usa fetch estándar y recibe dependencias por constructor).
 */
export class ReporteApiService implements IReporteApiService {
  constructor(
    private readonly baseUrl: string,
    private readonly tokenStorage: Pick<ITokenStorage, 'getToken'>,
  ) {}

  private resolveEndpoint(path: string): string {
    const cleanBase = this.baseUrl.replace(/\/$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (cleanBase.endsWith('/api')) {
      return `${cleanBase}${cleanPath}`;
    }
    return `${cleanBase}/api${cleanPath}`;
  }

  /**
   * Envía la petición POST en formato JSON a /api/reportes para crear el reporte.
   * Extrae y devuelve el IdReporte generado en base de datos.
   */
  async crearReporte(payload: CrearReportePayload): Promise<ReporteCreadoResponse> {
    const token = await this.tokenStorage.getToken();
    const endpoint = this.resolveEndpoint('/reportes');

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
    }

    const result: any = await response.json().catch(() => null);
    const body = result !== null && typeof result === 'object' ? result : {};

    if (!response.ok || (('success' in body) && body.success !== true)) {
      const message = typeof body.message === 'string'
        ? body.message
        : 'No se pudo confirmar la creación del reporte.';
      throw new Error(message);
    }

    const idGenerado = body.data?.IdReporte ?? body.IdReporte ?? body.data?.id ?? body.id;
    const IdReporte = Number(idGenerado) || 0;

    return {
      IdReporte,
      ...body,
    };
  }

  /**
   * Envía la foto como multipart/form-data al endpoint /api/reportes/:id/evidencia.
   * El archivo se adjunta bajo el campo 'evidencia'.
   */
  async subirEvidencia(idReporte: number | string, archivo: EvidenciaArchivo): Promise<EvidenciaSubidaResponse> {
    const token = await this.tokenStorage.getToken();
    const endpoint = this.resolveEndpoint(`/reportes/${idReporte}/evidencia`);

    const formData = new FormData();
    formData.append('evidencia', {
      uri: archivo.uri,
      name: archivo.name || 'evidencia.jpg',
      type: archivo.type || 'image/jpeg',
    } as any);

    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
    } catch {
      throw new Error('No se pudo conectar con el servidor para subir la evidencia fotográfica.');
    }

    const result: any = await response.json().catch(() => null);
    const body = result !== null && typeof result === 'object' ? result : {};

    if (!response.ok || (('success' in body) && body.success !== true)) {
      const message = typeof body.message === 'string'
        ? body.message
        : 'Error al subir la evidencia del reporte.';
      throw new Error(message);
    }

    return {
      EvidenciaUrl: body.data?.EvidenciaUrl ?? body.EvidenciaUrl ?? '',
      ...body,
    };
  }
}
