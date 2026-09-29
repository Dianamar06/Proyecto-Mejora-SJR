const { Router } = require('express');
const multer = require('multer');
const ReporteRepository = require('../repositories/ReporteRepository');
const StorageService = require('../services/StorageService');
const ReporteService = require('../services/ReporteService');
const ReporteController = require('../controllers/ReporteController');
const { getPool } = require('../config/db');

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// ==========================================
// INYECCIÓN DE DEPENDENCIAS (Fábrica)
// ==========================================
let reporteControllerInstance = null;

async function inyectarDependencias(req, res, next) {
    if (!reporteControllerInstance) {
        try {
            // Obtener el Pool inyectable
            const dbPool = await getPool();

            // Inyectar Pool al Repositorio
            const reporteRepository = new ReporteRepository(dbPool);

            // Instanciar StorageService
            const storageService = new StorageService();

            // Inyectar Repositorio y StorageService al Servicio
            const reporteService = new ReporteService(reporteRepository, storageService);

            // Inyectar Servicio al Controlador
            reporteControllerInstance = new ReporteController(reporteService);
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Fallo al inicializar base de datos' });
        }
    }
    next();
}

// ==========================================
// RUTAS
// ==========================================
router.post('/reportes', inyectarDependencias, (req, res) => {
    reporteControllerInstance.crearReporte(req, res);
});

router.post('/reportes/:id/evidencia', inyectarDependencias, upload.single('evidencia'), (req, res) => {
    reporteControllerInstance.subirEvidencia(req, res);
});

module.exports = router;
