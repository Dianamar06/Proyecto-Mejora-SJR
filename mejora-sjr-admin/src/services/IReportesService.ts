export interface IReportesService {
  /**
   * Cambia el estado de un reporte ciudadano (HU-16).
   * @param idReporte ID del reporte a modificar.
   * @param idNuevoEstado El nuevo estado (1: Recibido, 2: En Revisión, 3: En Progreso, 4: Resuelto).
   */
  cambiarEstado(idReporte: number, idNuevoEstado: number): Promise<void>;
}
