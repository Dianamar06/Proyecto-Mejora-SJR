class AuthController {
    constructor(authService) {
        this.authService = authService;
    }

    async login(req, res) {
        try {
            const { Correo, Password } = req.body;
            const resultado = await this.authService.login(Correo, Password);
            
            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: resultado
            });
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
}

module.exports = AuthController;
