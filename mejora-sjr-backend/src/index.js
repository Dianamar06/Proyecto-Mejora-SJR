require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Inicializar la aplicación de Express
const app = express();

// Configuración de Middlewares
app.use(cors()); // Habilita peticiones cruzadas desde cualquier origen
app.use(express.json()); // Permite recibir y parsear JSON en el body de las peticiones

// Endpoint GET de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    estado: 'ok',
    mensaje: 'API Funcional'
  });
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor base levantado exitosamente en el puerto ${PORT}`);
});
