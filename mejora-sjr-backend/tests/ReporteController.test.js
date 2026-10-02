const test = require('node:test');
const assert = require('node:assert/strict');
const ReporteController = require('../src/controllers/ReporteController');

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

function createController(service = {}) {
    return new ReporteController(service);
}

test('POST /api/reportes rechaza los campos requeridos faltantes', async () => {
    // Arrange
    let serviceCalled = false;
    const controller = createController({
        async crearReporte() {
            serviceCalled = true;
        }
    });
    const req = { body: { Titulo: 'Bache' } };
    const res = createResponse();

    // Act
    await controller.crearReporte(req, res);

    // Assert
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Descripcion/);
    assert.equal(serviceCalled, false);
});

test('POST /api/reportes rechaza coordenadas no numéricas', async () => {
    // Arrange
    let serviceCalled = false;
    const controller = createController({
        async crearReporte() {
            serviceCalled = true;
        }
    });
    const req = {
        body: {
            Titulo: 'Bache',
            Descripcion: 'Bache frente al parque',
            UbicacionLatitud: '21.12',
            UbicacionLongitud: -101.68,
            IdCategoria: 1,
            IdUsuario: 1
        }
    };
    const res = createResponse();

    // Act
    await controller.crearReporte(req, res);

    // Assert
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /valores numéricos/);
    assert.equal(serviceCalled, false);
});

test('POST /api/reportes crea un reporte válido y responde 201', async () => {
    // Arrange
    const payload = {
        Titulo: 'Bache',
        Descripcion: 'Bache frente al parque',
        UbicacionLatitud: 21.12,
        UbicacionLongitud: -101.68,
        IdCategoria: 1,
        IdUsuario: 7
    };
    let receivedPayload;
    const controller = createController({
        async crearReporte(data) {
            receivedPayload = data;
            return { ...data, IdReporte: 23, IdEstado: 1 };
        }
    });
    const req = { body: { ...payload } };
    const res = createResponse();

    // Act
    await controller.crearReporte(req, res);

    // Assert
    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.IdReporte, 23);
    assert.equal(receivedPayload.IdUsuario, 7);
});

test('PUT /api/reportes/:id/estado rechaza un identificador inválido', async () => {
    // Arrange
    let serviceCalled = false;
    const controller = createController({
        async actualizarEstado() {
            serviceCalled = true;
        }
    });
    const req = { params: { id: 'abc' }, body: { IdEstado: 2 } };
    const res = createResponse();

    // Act
    await controller.actualizarEstado(req, res);

    // Assert
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /número entero válido/);
    assert.equal(serviceCalled, false);
});

test('PUT /api/reportes/:id/estado rechaza la ausencia de estado', async () => {
    // Arrange
    let serviceCalled = false;
    const controller = createController({
        async actualizarEstado() {
            serviceCalled = true;
        }
    });
    const req = { params: { id: '23' }, body: {} };
    const res = createResponse();

    // Act
    await controller.actualizarEstado(req, res);

    // Assert
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /es requerido/);
    assert.equal(serviceCalled, false);
});

test('PUT /api/reportes/:id/estado actualiza el estado y responde 200', async () => {
    // Arrange
    let receivedArguments;
    const controller = createController({
        async actualizarEstado(id, estado) {
            receivedArguments = [id, estado];
            return { IdReporte: id, IdEstado: estado };
        }
    });
    const req = { params: { id: '23' }, body: { IdEstado: 3 } };
    const res = createResponse();

    // Act
    await controller.actualizarEstado(req, res);

    // Assert
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(receivedArguments, [23, 3]);
    assert.deepEqual(res.body.data, { IdReporte: 23, IdEstado: 3 });
});
