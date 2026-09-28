const { Router } = require('express');
const UsuarioRepository = require('../repositories/UsuarioRepository');
const AuthService = require('../services/AuthService');
const AuthController = require('../controllers/AuthController');
const { getPool } = require('../config/db');

const router = Router();
let authControllerInstance = null;

async function inyectarDependenciasAuth(req, res, next) {
    if (!authControllerInstance) {
        try {
            const dbPool = await getPool();
            const usuarioRepository = new UsuarioRepository(dbPool);
            const authService = new AuthService(usuarioRepository);
            authControllerInstance = new AuthController(authService);
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Fallo al inicializar base de datos' });
        }
    }
    next();
}

router.post('/login', inyectarDependenciasAuth, (req, res) => {
    authControllerInstance.login(req, res);
});

module.exports = router;
