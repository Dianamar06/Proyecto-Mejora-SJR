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
    }

    /**
     * Busca un reporte por su IdReporte.
     */
    async findById(idReporte) {
        const result = await this.dbPool.request()
            .input('IdReporte', sql.Int, idReporte)
            .query('SELECT * FROM Reportes WHERE IdReporte = @IdReporte');
        return result.recordset[0] || null;
    }

    /**
     * Obtiene reportes con filtros dinámicos por estado y categoría.
     * Utiliza consultas parametrizadas de mssql para prevenir inyección SQL.
     */
    async getReportes(filtros = {}) {
        const request = this.dbPool.request();
        const conditions = [];

        if (filtros.estado !== undefined && filtros.estado !== null && filtros.estado !== '') {
            const idEstado = parseInt(filtros.estado, 10);
            if (!isNaN(idEstado)) {
                request.input('IdEstado', sql.Int, idEstado);
                conditions.push('r.IdEstado = @IdEstado');
            }
        }

        if (filtros.categoria !== undefined && filtros.categoria !== null && filtros.categoria !== '') {
            const idCategoria = parseInt(filtros.categoria, 10);
            if (!isNaN(idCategoria)) {
                request.input('IdCategoria', sql.Int, idCategoria);
                conditions.push('r.IdCategoria = @IdCategoria');
            }
        }

        if (filtros.idDepartamento) {
            request.input('IdDepartamento', sql.Int, filtros.idDepartamento);
            conditions.push('c.IdDepartamento = @IdDepartamento');
        }

        let query = `
            SELECT 
                r.IdReporte,
                r.Titulo,
                r.Descripcion,
                r.UbicacionLatitud,
                r.UbicacionLongitud,
                r.DireccionFisica,
                r.EvidenciaUrl,
                r.IdUsuario,
                r.IdCategoria,
                r.IdEstado,
                r.FechaCreacion,
                r.FechaActualizacion
            FROM Reportes r
            LEFT JOIN Categorias c ON r.IdCategoria = c.IdCategoria
        `;

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY r.FechaCreacion DESC`;

        const result = await request.query(query);
        return result.recordset;
    }

    /**
     * Actualiza el IdEstado de un reporte existente y actualiza FechaActualizacion.
     */
    async actualizarEstado(idReporte, nuevoEstado) {
        const result = await this.dbPool.request()
            .input('IdReporte', sql.Int, idReporte)
            .input('IdEstado', sql.Int, nuevoEstado)
            .query(`
                UPDATE Reportes 
                SET IdEstado = @IdEstado, FechaActualizacion = GETDATE()
                OUTPUT INSERTED.IdReporte,
                       INSERTED.Titulo,
                       INSERTED.Descripcion,
                       INSERTED.UbicacionLatitud,
                       INSERTED.UbicacionLongitud,
                       INSERTED.DireccionFisica,
                       INSERTED.EvidenciaUrl,
                       INSERTED.IdUsuario,
                       INSERTED.IdCategoria,
                       INSERTED.IdEstado,
                       INSERTED.FechaCreacion,
                       INSERTED.FechaActualizacion
                WHERE IdReporte = @IdReporte
            `);
        return result.recordset[0] || null;
    }

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
