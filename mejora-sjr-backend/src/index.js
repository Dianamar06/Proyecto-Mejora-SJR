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

const reporteRoutes = require('./routes/reporte.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api', reporteRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[index.js] Servidor Mejora SJR escuchando en el puerto ${PORT}`);
});

module.exports = app;
