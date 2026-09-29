class ReporteService {
    constructor(reporteRepository, storageService) {
        this.reporteRepository = reporteRepository;
        this.storageService = storageService;
    }

    async crearReporte(datosReporte) {
        const {
            Titulo,
            Descripcion,
            UbicacionLatitud,
            UbicacionLongitud,
            DireccionFisica,
            EvidenciaUrl,
            IdUsuario,
            IdCategoria
        } = datosReporte;

        // 1. Validar que las llaves foráneas realmente existan antes de insertar
        const usuarioValido = await this.reporteRepository.existeUsuario(IdUsuario);
        if (!usuarioValido) {
            throw new Error('El IdUsuario proporcionado no existe (llave foránea inválida)');
        }

        const categoriaValida = await this.reporteRepository.existeCategoria(IdCategoria);
        if (!categoriaValida) {
            throw new Error('El IdCategoria proporcionado no existe (llave foránea inválida)');
        }

        // 2. Preparar entidad: IdEstado siempre 1 ('Recibido') al crear un reporte nuevo
        const nuevoReporte = {
            Titulo,
            Descripcion,
            UbicacionLatitud,
            UbicacionLongitud,
            DireccionFisica: DireccionFisica || null,
            EvidenciaUrl: EvidenciaUrl || null,
            IdUsuario,
            IdCategoria,
            IdEstado: 1
        };

        // 3. Ejecutar creación
        const resultado = await this.reporteRepository.createReporte(nuevoReporte);

        return { ...nuevoReporte, ...resultado };
    }

    async subirEvidencia(idReporte, fileBuffer) {
        // 1. Subir la imagen a la nube
        const urlPublica = await this.storageService.subirImagen(fileBuffer);
        
        // 2. Guardar la URL en la BD
        const actualizado = await this.reporteRepository.actualizarEvidencia(idReporte, urlPublica);
        if (!actualizado) {
            throw new Error('No se encontró el reporte para actualizar la evidencia.');
        }

        return { EvidenciaUrl: urlPublica };
    }

    /**
     * Obtiene el listado de reportes aplicando filtros opcionales de estado y categoría.
     * La lógica delega la construcción del SQL dinámico al Repositorio.
     */
    async obtenerReportes(filtros = {}) {
        return await this.reporteRepository.getReportes(filtros);
    }

    /**
     * Actualiza el estado de un reporte validando su existencia previa.
     */
    async actualizarEstado(idReporte, nuevoEstado) {
        // 1. Verificar si el reporte existe
        const reporteExistente = await this.reporteRepository.findById(idReporte);
        if (!reporteExistente) {
            const error = new Error(`El reporte con ID ${idReporte} no fue encontrado`);
            error.statusCode = 404;
            throw error;
        }

        // 2. Ejecutar la actualización en base de datos
        const reporteActualizado = await this.reporteRepository.actualizarEstado(idReporte, nuevoEstado);
        return reporteActualizado;
    }
}

module.exports = ReporteService;
