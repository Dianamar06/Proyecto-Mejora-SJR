/**
 * reporte.routes.js
 * -----------------------------------------------------------------------
 * Define las rutas HTTP de "Reporte" y actúa como "composition root":
 * aquí es donde se instancian el Repository, el Service y el Controller,
 * y se conectan entre sí mediante Inyección de Dependencias por
 * constructor. Ninguna de las capas se instancia a sí misma ni conoce
 * cómo se construyen sus dependencias.
 * -----------------------------------------------------------------------
 */

const { Router } = require('express');
const { getPool } = require('../config/db');
const ReporteRepository = require('../repositories/ReporteRepository');
const ReporteService = require('../services/ReporteService');
const ReporteController = require('../controllers/ReporteController');

const router = Router();

// --- Composición de dependencias (Inyección por constructor) -----------
const reporteRepository = new ReporteRepository(getPool);
const reporteService = new ReporteService(reporteRepository);
const reporteController = new ReporteController(reporteService);
// -------------------------------------------------------------------------

router.get('/reportes', reporteController.listar);

module.exports = router;
