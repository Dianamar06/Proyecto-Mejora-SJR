require('dotenv').config();
const sql = require('mssql');
const bcrypt = require('bcrypt');

async function createAdmin() {
    try {
        console.log('Conectando a la base de datos...');
        const pool = await sql.connect({
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            server: process.env.DB_SERVER,
            database: process.env.DB_DATABASE,
            options: { encrypt: true, trustServerCertificate: false }
        });
        
        console.log('Hasheando contraseña...');
        const passwordHash = await bcrypt.hash('AdminSJR2026!', 10);
        
        console.log('Insertando usuario administrador...');
        // Verificamos si ya existe para no duplicarlo
        const exist = await pool.request().input('Correo', sql.VarChar, 'admin@mejorasjr.mx').query('SELECT * FROM Usuarios WHERE Correo = @Correo');
        if (exist.recordset.length > 0) {
            console.log('✅ El usuario admin@mejorasjr.mx ya existe. Su contraseña original se mantiene.');
        } else {
            await pool.request()
                .input('NombreCompleto', sql.VarChar, 'Oscar Administrador')
                .input('Correo', sql.VarChar, 'admin@mejorasjr.mx')
                .input('PasswordHash', sql.VarChar, passwordHash)
                .input('Telefono', sql.VarChar, '4270000000')
                .input('IdRol', sql.Int, 3) // Rol 3 = Administrador
                .input('IdDepartamento', sql.Int, 1) // 1 = JAPAM
                .query(`
                    INSERT INTO Usuarios (NombreCompleto, Correo, PasswordHash, Telefono, IdRol, IdDepartamento, FechaRegistro)
                    VALUES (@NombreCompleto, @Correo, @PasswordHash, @Telefono, @IdRol, @IdDepartamento, GETDATE())
                `);
            console.log('✅ Usuario Administrador creado exitosamente.');
            console.log('👉 Correo: admin@mejorasjr.mx');
            console.log('👉 Contraseña: AdminSJR2026!');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error creando admin:', err);
        process.exit(1);
    }
}

createAdmin();
