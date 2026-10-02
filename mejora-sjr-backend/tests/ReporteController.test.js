const test = require('node:test');
const assert = require('node:assert/strict');
const ReporteController = require('../src/controllers/ReporteController');
const ReporteService = require('../src/services/ReporteService');

function createResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(body) {
            this.body = body;
            return this;
        }
    };
}

function createController(service) {
    return new ReporteController(service);
}

test('GET /api/reportes responde con la lista de reportes', async () => {
    // Arrange
    const reportes = [{ IdReporte: 1 }, { IdReporte: 2 }];
    let serviceCalls = 0;
    const controller = createController({
        async listarReportes() {
            serviceCalls += 1;
            return reportes;
        }
    });
    const req = {};
    const res = createResponse();

    // Act
    await controller.listar(req, res);

    // Assert
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, data: reportes });
    assert.equal(serviceCalls, 1);
});

test('GET /api/reportes responde con una lista vacía cuando no hay reportes', async () => {
    // Arrange
    const controller = createController({
        async listarReportes() {
            return [];
        }
    });
    const req = {};
    const res = createResponse();

    // Act
    await controller.listar(req, res);

    // Assert
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, { success: true, data: [] });
});

test('GET /api/reportes convierte un error del servicio en respuesta 500 genérica', async () => {
    // Arrange
    const controller = createController({
        async listarReportes() {
            throw new Error('Fallo interno de la base de datos');
        }
    });
    const req = {};
    const res = createResponse();

    // Act
    await controller.listar(req, res);

    // Assert
    assert.equal(res.statusCode, 500);
    assert.deepEqual(res.body, {
        success: false,
        message: 'Ocurrió un error al obtener los reportes.'
    });
});

test('GET /api/reportes conserva el enlace del controlador al invocarse como callback', async () => {
    // Arrange
    const reportes = [{ IdReporte: 7 }];
    const controller = createController({
        async listarReportes() {
            return reportes;
        }
    });
    const handler = controller.listar;
    const req = {};
    const res = createResponse();

    // Act
    await handler(req, res);

    // Assert
    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body.data, reportes);
});

test('ReporteService devuelve los reportes obtenidos por el repositorio', async () => {
    // Arrange
    const reportes = [{ IdReporte: 11 }];
    let repositoryCalls = 0;
    const service = new ReporteService({
        async obtenerTodos() {
            repositoryCalls += 1;
            return reportes;
        }
    });

    // Act
    const result = await service.listarReportes();

    // Assert
    assert.deepEqual(result, reportes);
    assert.equal(repositoryCalls, 1);
});

test('ReporteService propaga los errores del repositorio para que el controlador los gestione', async () => {
    // Arrange
    const repositoryError = new Error('Error de consulta');
    const service = new ReporteService({
        async obtenerTodos() {
            throw repositoryError;
        }
    });

    // Act
    const action = service.listarReportes();

    // Assert
    await assert.rejects(action, (error) => error === repositoryError);
});
