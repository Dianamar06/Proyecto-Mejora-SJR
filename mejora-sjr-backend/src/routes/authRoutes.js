const express = require('express');
const router = express.Router();
const { loginTest } = require('../controllers/authController');

// Endpoint de prueba: GET /login
router.get('/login', loginTest);

module.exports = router;
