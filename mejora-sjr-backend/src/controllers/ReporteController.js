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

            // ✅ INYECCIÓN SEGURA DEL USUARIO (Mock temporal)
            // Se debe leer desde req.user (el token desencriptado) en el futuro
            payload.IdUsuario = req.user ? req.user.IdUsuario : 1;

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
}

module.exports = ReporteController;
