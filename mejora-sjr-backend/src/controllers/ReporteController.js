const CAMPOS_REQUERIDOS = [
    'Titulo',
    'Descripcion',
    'UbicacionLatitud',
    'UbicacionLongitud',
    'IdCategoria' // Se removió IdUsuario por seguridad
];

class ReporteController {
    constructor(reporteService) {
        this.reporteService = reporteService;
    }

    async crearReporte(req, res) {
        try {
            // El controlador SOLO valida la forma del payload y enruta (SRP)
            const payload = req.body;

            // Inyección de usuario desde token desencriptado (o default temporal si no hay middleware en creación)
            payload.IdUsuario = req.user ? req.user.IdUsuario : (payload.IdUsuario || 1);

            const camposFaltantes = CAMPOS_REQUERIDOS.filter(
                (campo) => payload[campo] === undefined || payload[campo] === null || payload[campo] === ''
            );

            if (camposFaltantes.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Faltan campos requeridos: ${camposFaltantes.join(', ')}`
                });
            }

            if (typeof payload.UbicacionLatitud !== 'number' || typeof payload.UbicacionLongitud !== 'number') {
                return res.status(400).json({
                    success: false,
                    message: 'UbicacionLatitud y UbicacionLongitud deben ser valores numéricos'
                });
            }

            if (!Number.isInteger(payload.IdUsuario) || !Number.isInteger(payload.IdCategoria)) {
                return res.status(400).json({
                    success: false,
                    message: 'IdUsuario e IdCategoria deben ser números enteros'
                });
            }

            const resultado = await this.reporteService.crearReporte(payload);

            return res.status(201).json({
                success: true,
                message: 'Reporte creado con éxito',
                data: resultado
            });
        } catch (error) {
            const isClientError = error.message.includes('no existe') || error.message.includes('requeridos');
            return res.status(isClientError ? 400 : 500).json({
                success: false,
                message: error.message
            });
        }
    }

    async subirEvidencia(req, res) {
        try {
            const { id } = req.params;
            
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No se envió ninguna imagen (campo esperado: evidencia).'
                });
            }

            const resultado = await this.reporteService.subirEvidencia(id, req.file.buffer);

            return res.status(200).json({
                success: true,
                message: 'Evidencia subida y guardada correctamente en la BD.',
                data: resultado
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message
            });
        }
    }

    /**
     * GET /api/reportes
     * Obtiene el listado de reportes con filtros opcionales de query (?estado=...&categoria=...)
     */
    async obtenerReportes(req, res) {
        try {
            const { estado, categoria } = req.query;
            
            // Segregación de datos: Si el usuario tiene departamento (Admin/Trabajador), solo ve lo de su área.
            const idDepartamento = req.user && req.user.IdDepartamento ? req.user.IdDepartamento : null;

            const reportes = await this.reporteService.obtenerReportes({ estado, categoria, idDepartamento });

            return res.status(200).json({
                success: true,
                message: 'Reportes obtenidos con éxito',
                total: reportes.length,
                data: reportes
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor al obtener reportes'
            });
        }
    }

    /**
     * PUT /api/reportes/:id/estado
     * Actualiza el estado de un reporte.
     * Códigos HTTP:
     * - 200 OK: Actualización exitosa.
     * - 400 Bad Request: Parámetros o cuerpo de la petición inválidos.
     * - 404 Not Found: El reporte con el :id especificado no existe.
     * - 500 Internal Server Error: Error no controlado en BD o servidor.
     */
    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const idReporte = parseInt(id, 10);

            if (isNaN(idReporte) || idReporte <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El parámetro :id debe ser un número entero válido'
                });
            }

            // Soporta tanto IdEstado como estado en el cuerpo de la petición
            const rawEstado = req.body.IdEstado !== undefined ? req.body.IdEstado : req.body.estado;
            if (rawEstado === undefined || rawEstado === null || rawEstado === '') {
                return res.status(400).json({
                    success: false,
                    message: 'El campo IdEstado (o estado) es requerido'
                });
            }

            const nuevoEstado = parseInt(rawEstado, 10);
            if (isNaN(nuevoEstado)) {
                return res.status(400).json({
                    success: false,
                    message: 'El campo IdEstado debe ser un valor numérico entero'
                });
            }

            const reporteActualizado = await this.reporteService.actualizarEstado(idReporte, nuevoEstado);

            return res.status(200).json({
                success: true,
                message: 'Estado del reporte actualizado con éxito',
                data: reporteActualizado
            });
        } catch (error) {
            if (error.statusCode === 404 || error.message.includes('no fue encontrado') || error.message.includes('no existe')) {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: error.message || 'Error interno del servidor al actualizar el estado del reporte'
            });
        }
    }
}

module.exports = ReporteController;
