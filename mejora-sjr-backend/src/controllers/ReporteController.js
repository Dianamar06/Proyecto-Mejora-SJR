/**
 * ReporteController.js
 * -----------------------------------------------------------------------
 * Capa HTTP para "Reporte". Traduce peticiones/respuestas de Express hacia
 * y desde el Service correspondiente. No contiene lógica de negocio ni
 * accede a la base de datos directamente.
 * -----------------------------------------------------------------------
 */

class ReporteController {
  /**
   * @param {import('../services/ReporteService')} reporteService
   */
  constructor(reporteService) {
    this.reporteService = reporteService;

    // Bind explícito para preservar el `this` cuando Express invoca
    // el método como callback de una ruta.
    this.listar = this.listar.bind(this);
  }

  /**
   * GET /api/reportes
   * Devuelve la lista completa de reportes.
   */
  async listar(req, res) {
    try {
      const reportes = await this.reporteService.listarReportes();
      return res.status(200).json({
        success: true,
        data: reportes,
      });
    } catch (error) {
      console.error('[ReporteController] Error al listar reportes:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Ocurrió un error al obtener los reportes.',
      });
    }
  }
}

module.exports = ReporteController;
