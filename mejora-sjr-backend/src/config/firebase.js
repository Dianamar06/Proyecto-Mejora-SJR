const admin = require('firebase-admin');
require('dotenv').config(); // Asegura cargar las variables de entorno si usan .env

// Obtenemos la ruta del JSON de credenciales desde las variables de entorno
// (Se asume que tienen una variable como FIREBASE_CREDENTIALS_PATH en su .env)
const serviceAccountPath = process.env.FIREBASE_CREDENTIALS_PATH;

if (!serviceAccountPath) {
  console.error("Error: Falta la variable de entorno FIREBASE_CREDENTIALS_PATH");
}

// Requerimos el JSON de la cuenta de servicio
// Nota: La ruta en el .env debe ser absoluta o relativa a la raíz desde donde se ejecuta el backend
const serviceAccount = require(serviceAccountPath);

// Inicializamos la aplicación de Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Extraemos la instancia de Firestore
const db = admin.firestore();

// Exportamos la base de datos (y admin en caso de que lo necesiten para Auth/Storage)
module.exports = { db, admin };
