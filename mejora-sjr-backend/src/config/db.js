const sql = require('mssql');

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, // <- Estaba leyendo DB_NAME
    server: process.env.DB_SERVER,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true, // Para Azure SQL
        trustServerCertificate: false 
    }
};

let poolPromise = null;

async function getPool() {
    if (!poolPromise) {
        try {
            poolPromise = sql.connect(dbConfig);
            console.log('Conexión exitosa a la base de datos SQL Server');
        } catch (error) {
            console.error('Error conectando a la base de datos', error);
            throw error;
        }
    }
    return poolPromise;
}

module.exports = { getPool };
