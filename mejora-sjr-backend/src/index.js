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
