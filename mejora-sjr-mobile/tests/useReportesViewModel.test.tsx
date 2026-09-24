/// <reference types="node" />
import React from 'react';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { useReportesViewModel, type ReportesHttpService } from '../src/viewModels/useReportesViewModel';
import { ApiServiceMock } from '../src/services/mocks/apiServiceMock';
import { isReporte, type Reporte } from '../src/models/Reporte';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

function deferred() {
  let resolve!: (value: unknown) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<unknown>((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}

function serviceFrom(load: () => Promise<unknown>): ReportesHttpService {
  return { async get<T>(endpoint: string) {
    assert.equal(endpoint, '/reportes');
    return await load() as T;
  } };
}

async function mount(apiService: ReportesHttpService) {
  let current!: ReturnType<typeof useReportesViewModel>;
  let renderer!: ReactTestRenderer;
  function Consumer({ service }: { service: ReportesHttpService }) {
    current = useReportesViewModel(service);
    return null;
  }
  await act(async () => { renderer = create(<Consumer service={apiService} />); });
  return {
    get current() { return current; },
    async unmount() { await act(async () => renderer.unmount()); },
    async replace(service: ReportesHttpService) {
      await act(async () => renderer.update(<Consumer service={service} />));
    },
  };
}

const reporte: Reporte = {
  IdReporte: 7,
  Titulo: '  Bache  ',
  Descripcion: '  Bache en la calle  ',
  UbicacionLatitud: 20.38,
  UbicacionLongitud: -99.99,
  DireccionFisica: null,
  EvidenciaUrl: null,
  IdUsuario: 10,
  IdCategoria: 2,
  IdEstado: 2,
  FechaCreacion: '2026-09-23T10:00:00.000Z',
  FechaActualizacion: '2026-09-23T11:00:00.000Z',
};

const response = {
  success: true,
  data: [{ ...reporte, campoInterno: 'no exponer' }],
};

test('acepta campos opcionales ausentes, nulos o de texto y rechaza tipos incompatibles', () => {
  const { DireccionFisica, EvidenciaUrl, ...sinOpcionales } = reporte;
  assert.equal(isReporte(sinOpcionales), true);
  assert.equal(isReporte(reporte), true);
  assert.equal(isReporte({ ...reporte, DireccionFisica: 'Centro', EvidenciaUrl: 'https://example.com/foto.jpg' }), true);
  for (const campo of ['IdReporte', 'Titulo', 'Descripcion', 'UbicacionLatitud', 'UbicacionLongitud',
    'IdUsuario', 'IdCategoria', 'IdEstado', 'FechaCreacion', 'FechaActualizacion']) {
    assert.equal(isReporte({ ...reporte, [campo]: undefined }), false, campo);
    assert.equal(isReporte({ ...reporte, [campo]: null }), false, campo);
  }
  assert.equal(isReporte({ ...reporte, IdReporte: '7' }), false);
  assert.equal(isReporte({ ...reporte, UbicacionLatitud: Number.NaN }), false);
  assert.equal(isReporte({ ...reporte, DireccionFisica: 123 }), false);
  assert.equal(isReporte({ ...reporte, EvidenciaUrl: {} }), false);
  assert.equal(isReporte({ id: 7, descripcion: 'Contrato anterior', estado: 'pendiente' }), false);
});

test('traduce los estados confirmados y conserva un texto genérico para otros IDs', async () => {
  for (const [IdEstado, expected] of [[1, 'Recibido'], [2, 'En Revisión'], [3, 'En Progreso'], [99, 'Estado 99']] as const) {
    const hook = await mount(serviceFrom(async () => ({ success: true, data: [{ ...reporte, IdEstado }] })));
    try {
      assert.equal(hook.current.error, null);
      assert.equal(hook.current.reportes[0].estado, expected);
    } finally { await hook.unmount(); }
  }
});

test('sustituye títulos y descripciones vacíos sin filtrar datos de usuario a la Vista', async () => {
  const hook = await mount(serviceFrom(async () => ({
    success: true, data: [{ ...reporte, Titulo: ' ', Descripcion: '' }],
  })));
  try {
    assert.deepEqual(hook.current.reportes, [{ id: '7', titulo: 'Sin título', descripcion: 'Sin descripción', estado: 'En Revisión' }]);
  } finally { await hook.unmount(); }
});

test('expone carga y transforma datos exitosos a las props mínimas', async () => {
  const request = deferred();
  const hook = await mount(serviceFrom(() => request.promise));
  try {
    assert.equal(hook.current.isLoading, true);
    assert.deepEqual(hook.current.reportes, []);
    assert.equal(hook.current.error, null);
    await act(async () => request.resolve(response));
    assert.equal(hook.current.isLoading, false);
    assert.equal(hook.current.error, null);
    assert.deepEqual(hook.current.reportes, [{ id: '7', titulo: 'Bache', descripcion: 'Bache en la calle', estado: 'En Revisión' }]);
  } finally { await hook.unmount(); }
});

test('una lista vacía es éxito y funciona con el mock existente', async () => {
  const service = new ApiServiceMock();
  service.setMockResponse('/reportes', { success: true, data: [] });
  const hook = await mount(service);
  try {
    assert.equal(hook.current.isLoading, false);
    assert.equal(hook.current.error, null);
    assert.deepEqual(hook.current.reportes, []);
  } finally { await hook.unmount(); }
});

test('expone errores y permite reintentar limpiando el error anterior', async () => {
  const requests = [deferred(), deferred()];
  let calls = 0;
  const hook = await mount(serviceFrom(() => requests[calls++].promise));
  try {
    await act(async () => requests[0].reject(new Error('Servidor no disponible')));
    assert.equal(hook.current.isLoading, false);
    assert.equal(hook.current.error, 'Servidor no disponible');
    await act(async () => hook.current.reload());
    assert.equal(hook.current.isLoading, true);
    assert.equal(hook.current.error, null);
    await act(async () => requests[1].resolve(response));
    assert.equal(hook.current.error, null);
    assert.equal(hook.current.reportes.length, 1);
  } finally { await hook.unmount(); }
});

test('rechaza respuestas mal formadas, fallos lógicos e IDs duplicados', async () => {
  for (const invalid of [null, { success: false }, { success: true },
    { success: true, data: [{}] },
    { success: true, data: [response.data[0], response.data[0]] }]) {
    const hook = await mount(serviceFrom(async () => invalid));
    try {
      assert.equal(hook.current.isLoading, false);
      assert.ok(hook.current.error);
      assert.deepEqual(hook.current.reportes, []);
    } finally { await hook.unmount(); }
  }
});

test('normaliza rechazos desconocidos a un mensaje visible', async () => {
  const hook = await mount(serviceFrom(async () => { throw null; }));
  try {
    assert.equal(hook.current.isLoading, false);
    assert.equal(hook.current.error, 'No se pudieron cargar los reportes. Intenta nuevamente.');
  } finally { await hook.unmount(); }
});

test('una respuesta anterior no sobrescribe la recarga más reciente', async () => {
  const requests = [deferred(), deferred()];
  let calls = 0;
  const hook = await mount(serviceFrom(() => requests[calls++].promise));
  try {
    await act(async () => hook.current.reload());
    await act(async () => requests[1].resolve(response));
    await act(async () => requests[0].reject(new Error('Error antiguo')));
    assert.equal(hook.current.error, null);
    assert.equal(hook.current.reportes[0].id, '7');
  } finally { await hook.unmount(); }
});

test('al cambiar el servicio se ignora la respuesta del servicio anterior', async () => {
  const oldRequest = deferred();
  const hook = await mount(serviceFrom(() => oldRequest.promise));
  try {
    await hook.replace(serviceFrom(async () => response));
    await act(async () => oldRequest.resolve({ success: true, data: [] }));
    assert.equal(hook.current.reportes.length, 1);
  } finally { await hook.unmount(); }
});

test('una respuesta posterior al desmontaje no actualiza el estado', async () => {
  const request = deferred();
  const hook = await mount(serviceFrom(() => request.promise));
  const stateBefore = hook.current;
  await hook.unmount();
  await act(async () => request.resolve(response));
  assert.equal(hook.current, stateBefore);
});
