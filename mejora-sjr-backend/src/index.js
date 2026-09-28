/**
 * index.js
 * -----------------------------------------------------------------------
 * Punto de entrada del servidor Express. Solo se encarga de configurar
 * middlewares globales y montar los routers de cada módulo. No contiene
 * lógica de negocio ni acceso a datos.
 * -----------------------------------------------------------------------
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Rutas
const usuarioRoutes = require('./routes/usuario.routes');
const authRoutes = require('./routes/auth.routes'); // <-- Ruta de Login agregada
const reporteRoutes = require('./routes/reporte.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Inyectar Rutas
app.use('/api', usuarioRoutes);
app.use('/api', reporteRoutes);
app.use('/api/auth', authRoutes); // <-- Montaje de la ruta auth

// Puerto y Arranque
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Mejora SJR corriendo en el puerto ${PORT}`);
});

app.listen(PORT, () => {
  console.log(`[index.js] Servidor Mejora SJR escuchando en el puerto ${PORT}`);
});

module.exports = app;
