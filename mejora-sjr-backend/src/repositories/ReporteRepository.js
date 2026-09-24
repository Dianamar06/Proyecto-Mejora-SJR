/**
 * ReporteRepository.js
 * -----------------------------------------------------------------------
 * Capa de acceso a datos para la entidad "Reporte".
 *
 * Regla arquitectónica: TODA consulta SQL relacionada con Reportes vive
 * exclusivamente aquí. Ninguna otra capa (Service, Controller) debe
 * importar `mssql` ni construir queries directamente.
 *
 * Recibe `getPool` (la función exportada por config/db.js) por inyección
 * de dependencias en el constructor, en lugar de importar el módulo de
 * conexión directamente. Esto facilita las pruebas unitarias (se puede
 * inyectar un getPool falso/mock) y respeta el Principio de Inversión de
 * Dependencias (la "D" de SOLID).
 * -----------------------------------------------------------------------
 */

class ReporteRepository {
  /**
   * @param {() => Promise<import('mssql').ConnectionPool>} getPool
   *        Función que retorna (o crea) el pool de conexión a Azure SQL.
   */
  constructor(getPool) {
    this.getPool = getPool;
  }

  /**
   * Obtiene todos los reportes almacenados en la base de datos.
   * @returns {Promise<Array<object>>}
   */
  async obtenerTodos() {
    const pool = await this.getPool();
    const result = await pool.request().query('SELECT * FROM Reportes');
    return result.recordset;
  }
}

module.exports = ReporteRepository;
