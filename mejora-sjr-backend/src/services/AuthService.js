const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    constructor(usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    async login(correo, password) {
        if (!correo || !password) {
            throw new Error('Faltan credenciales (Correo, Password)');
        }

        const usuario = await this.usuarioRepository.findByCorreo(correo);
        if (!usuario) {
            throw new Error('Credenciales inválidas');
        }

        const passwordValido = await bcrypt.compare(password, usuario.PasswordHash);
        if (!passwordValido) {
            throw new Error('Credenciales inválidas');
        }

        const secret = process.env.JWT_SECRET || 'supersecreto_sjr';
        const token = jwt.sign(
            {
                IdUsuario: usuario.IdUsuario, 
                IdRol: usuario.IdRol, 
                IdDepartamento: usuario.IdDepartamento,
                Correo: usuario.Correo 
            }, 
            secret, 
            { expiresIn: '8h' }
        );

        return { token, usuario: { IdUsuario: usuario.IdUsuario, NombreCompleto: usuario.NombreCompleto, IdRol: usuario.IdRol, IdDepartamento: usuario.IdDepartamento } };
    }
}

module.exports = AuthService;
