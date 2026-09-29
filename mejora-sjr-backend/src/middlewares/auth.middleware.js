const jwt = require('jsonwebtoken');

/**
 * Middleware para autenticar y autorizar a usuarios con rol Operador/Admin (IdRol = 3).
 * 
 * Valida:
 * 1. Presencia del token JWT en el header Authorization (Bearer <token>).
 * 2. Validez y vigencia de la firma criptográfica con JWT_SECRET.
 * 3. Que el rol del usuario corresponda exactamente a IdRol = 3 (Operador/Admin).
 * 
 * Respuestas HTTP:
 * - 403 Forbidden: Si falta el token, es inválido/expirado, o el usuario no cuenta con IdRol = 3.
 */
function validarOperadorAdmin(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: Token de autenticación no proporcionado'
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    if (!token) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: Formato de token inválido'
        });
    }

    const secret = process.env.JWT_SECRET || 'supersecreto_sjr';

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;

        if (decoded.IdRol !== 3) {
            return res.status(403).json({
                success: false,
                message: 'Acceso denegado: Se requieren permisos de Operador/Admin (IdRol = 3)'
            });
        }

        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: Token de autenticación inválido o expirado'
        });
    }
}

/**
 * Middleware opcional/complementario para validar únicamente el JWT sin restringir rol.
 */
function autenticarToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];

    if (!authHeader) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: Token de autenticación no proporcionado'
        });
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : authHeader.trim();

    const secret = process.env.JWT_SECRET || 'supersecreto_sjr';

    try {
        const decoded = jwt.verify(token, secret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado: Token de autenticación inválido o expirado'
        });
    }
}

module.exports = {
    validarOperadorAdmin,
    autenticarToken
};
