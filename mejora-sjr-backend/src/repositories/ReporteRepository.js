const sql = require('mssql');

class ReporteRepository {
    constructor(dbPool) {
        this.dbPool = dbPool;
    }

    /**
     * Inserta un nuevo reporte. IdEstado siempre llega en 1 ('Recibido'),
     * decisión que toma el Service, no este repositorio.
     */
    async createReporte(reporte) {
        const result = await this.dbPool.request()
            .input('Titulo', sql.VarChar, reporte.Titulo)
            .input('Descripcion', sql.NVarChar, reporte.Descripcion)
            .input('UbicacionLatitud', sql.Decimal(9, 6), reporte.UbicacionLatitud)
            .input('UbicacionLongitud', sql.Decimal(9, 6), reporte.UbicacionLongitud)
            .input('DireccionFisica', sql.VarChar, reporte.DireccionFisica || null)
            .input('EvidenciaUrl', sql.VarChar, reporte.EvidenciaUrl || null)
            .input('IdUsuario', sql.Int, reporte.IdUsuario)
            .input('IdCategoria', sql.Int, reporte.IdCategoria)
            .input('IdEstado', sql.Int, reporte.IdEstado)
            .query(`
                INSERT INTO Reportes (
                    Titulo, Descripcion, UbicacionLatitud, UbicacionLongitud,
                    DireccionFisica, EvidenciaUrl, IdUsuario, IdCategoria, IdEstado,
                    FechaCreacion, FechaActualizacion
                )
                OUTPUT INSERTED.IdReporte, INSERTED.IdEstado, INSERTED.FechaCreacion, INSERTED.FechaActualizacion
                VALUES (
                    @Titulo, @Descripcion, @UbicacionLatitud, @UbicacionLongitud,
                    @DireccionFisica, @EvidenciaUrl, @IdUsuario, @IdCategoria, @IdEstado,
                    GETDATE(), GETDATE()
                )
            `);
        return result.recordset[0];
    }

    /**
     * Verifica que la llave foránea IdUsuario exista antes de insertar,
     * para no depender solo del error de constraint de SQL Server.
     */
    async existeUsuario(idUsuario) {
        const result = await this.dbPool.request()
            .input('IdUsuario', sql.Int, idUsuario)
            .query('SELECT IdUsuario FROM Usuarios WHERE IdUsuario = @IdUsuario');
        return result.recordset.length > 0;
    }

    /**
     * Verifica que la llave foránea IdCategoria exista antes de insertar.
     */
    async existeCategoria(idCategoria) {
        const result = await this.dbPool.request()
            .input('IdCategoria', sql.Int, idCategoria)
            .query('SELECT IdCategoria FROM Categorias WHERE IdCategoria = @IdCategoria');
        return result.recordset.length > 0;
    /**
     * Actualiza la URL de la evidencia fotográfica de un reporte existente.
     */
    async actualizarEvidencia(idReporte, evidenciaUrl) {
        const result = await this.dbPool.request()
            .input('IdReporte', sql.Int, idReporte)
            .input('EvidenciaUrl', sql.VarChar, evidenciaUrl)
            .query(`
                UPDATE Reportes 
                SET EvidenciaUrl = @EvidenciaUrl, FechaActualizacion = GETDATE()
                WHERE IdReporte = @IdReporte
            `);
        return result.rowsAffected[0] > 0;
    }
}

module.exports = ReporteRepository;
