/**
 * ReporteService.js
 * -----------------------------------------------------------------------
 * Capa de lógica de negocio para "Reporte".
 *
 * No conoce nada sobre SQL, mssql, ni el pool de conexión: solo conoce la
 * interfaz del repositorio que recibe por Inyección de Dependencias en su
 * constructor. Esto permite:
 *   - Cambiar de motor de base de datos sin tocar el Service.
 *   - Probar el Service con un repositorio "mock" en pruebas unitarias.
 * -----------------------------------------------------------------------
 */

class ReporteService {
  /**
   * @param {import('../repositories/ReporteRepository')} reporteRepository
   */
  constructor(reporteRepository) {
    this.reporteRepository = reporteRepository;
  }

  /**
   * Retorna la lista completa de reportes.
   * Aquí es donde, a futuro, se agregaría lógica de negocio adicional
   * (filtrado, transformación, reglas de permisos, etc.) sin tocar el
   * repositorio ni el controlador.
   * @returns {Promise<Array<object>>}
   */
  async listarReportes() {
    const reportes = await this.reporteRepository.obtenerTodos();
    return reportes;
  }
}

module.exports = ReporteService;
