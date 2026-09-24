/**
 * db.js
 * -----------------------------------------------------------------------
 * Configura y expone el pool de conexiones a Azure SQL Database usando el
 * driver oficial `mssql` (NUNCA `msnodesqlv8`, ya que este último depende
 * de binarios nativos de Windows/ODBC y no es compatible multiplataforma).
 *
 * El pool se crea una sola vez (patrón Singleton simple mediante una
 * promesa cacheada) y se reutiliza en toda la aplicación. Los repositorios
 * son los ÚNICOS consumidores autorizados de este módulo.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const sql = require('mssql');

/**
 * Configuración de conexión a Azure SQL.
 * Los valores sensibles (usuario/password) se leen de variables de
 * entorno; nunca deben quedar escritos directamente en el código fuente.
 */
const dbConfig = {
  server: process.env.DB_SERVER || 'servidor-mejorasjr-isaac.database.windows.net',
  database: process.env.DB_DATABASE || 'MejoraSJR_DB',
  user: process.env.DB_USER || 'admin_mejorasjr',
  password: process.env.DB_PASSWORD, // Obligatorio: definir en .env, nunca en el código.
  port: 1433,
  options: {
    encrypt: true, // Azure SQL requiere conexiones cifradas.
    trustServerCertificate: false, // No confiar en certificados autofirmados.
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

if (!dbConfig.password) {
  // No lanzamos el error de inmediato para no romper herramientas como
  // linters o tests que importan este módulo sin conectarse realmente,
  // pero sí avisamos fuerte en consola.
  console.warn(
    '[db.js] ADVERTENCIA: DB_PASSWORD no está definida. Configúrala en tu archivo .env antes de conectar a Azure SQL.'
  );
}

/** @type {Promise<import('mssql').ConnectionPool> | null} */
let poolPromise = null;

/**
 * Obtiene (o crea, si aún no existe) el pool de conexiones a Azure SQL.
 * Se debe usar SIEMPRE esta función en lugar de instanciar `sql.ConnectionPool`
 * manualmente, para garantizar que exista un único pool compartido.
 *
 * @returns {Promise<import('mssql').ConnectionPool>}
 */
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig)
      .connect()
      .then((pool) => {
        console.log('[db.js] Conexión a Azure SQL (MejoraSJR_DB) establecida correctamente.');

        pool.on('error', (err) => {
          console.error('[db.js] Error inesperado en el pool de Azure SQL:', err);
        });

        return pool;
      })
      .catch((err) => {
        // Si falla la conexión, limpiamos la promesa cacheada para permitir
        // reintentos en la siguiente llamada a getPool().
        poolPromise = null;
        console.error('[db.js] Error al conectar con Azure SQL:', err.message);
        throw err;
      });
  }

  return poolPromise;
}

module.exports = {
  sql,
  getPool,
  dbConfig,
};
