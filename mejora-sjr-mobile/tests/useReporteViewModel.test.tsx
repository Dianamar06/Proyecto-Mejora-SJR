/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { useReporteViewModel, validarReporte } from '../src/viewModels/useReporteViewModel';
import type { ReporteFormulario, CrearReportePayload, EvidenciaArchivo } from '../src/models/Reporte';
import type { IReporteApiService, ReporteCreadoResponse } from '../src/services/contracts/IReporteApiService';
import { ReporteApiService } from '../src/services/api/ReporteApiService';
import { conUsuarioTemporal } from '../src/services/mocks/conUsuarioTemporal';
import { CATEGORIAS_REPORTE } from '../src/constants/categoriasReporte';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const categorias = [{ IdCategoria: 7, Nombre: 'Categoría de prueba' }];
const formulario: ReporteFormulario = {
  Titulo: ' Bache ',
  Descripcion: ' Frente al parque ',
  UbicacionLatitud: '0',
  UbicacionLongitud: '-99,9961',
  DireccionFisica: '',
  EvidenciaUrl: '',
  IdCategoria: 7,
};

test('las cinco categorías confirmadas permiten preparar un reporte', () => {
  assert.deepEqual(CATEGORIAS_REPORTE.map(categoria => categoria.IdCategoria), [1, 2, 3, 4, 5]);
  for (const { IdCategoria } of CATEGORIAS_REPORTE) {
    assert.ok(validarReporte({ ...formulario, IdCategoria }, CATEGORIAS_REPORTE).payload);
  }
});

test('adaptador temporal envía IdUsuario 1 por HTTP sin mutar los siete campos del formulario', async () => {
  const originalFetch = globalThis.fetch;
  const payload = Object.freeze(validarReporte({ ...formulario, IdCategoria: 1 }, CATEGORIAS_REPORTE).payload!);
  const service = conUsuarioTemporal(new ReporteApiService('https://example.test/api', { getToken: async () => null }));
  try {
    globalThis.fetch = async (_url, options) => {
      assert.deepEqual(JSON.parse(options?.body as string), { ...payload, IdUsuario: 1 });
      return new Response(JSON.stringify({ success: true, data: { IdReporte: 99 } }), { status: 201 });
    };
    const res = await service.crearReporte(payload);
    assert.equal(res.IdReporte, 99);
    assert.equal(Object.keys(payload).length, 7);
    assert.equal('IdUsuario' in payload, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('transforma números y conserva exactamente las siete llaves SQL', () => {
  assert.deepEqual(validarReporte(formulario, categorias).payload, {
    Titulo: 'Bache',
    Descripcion: 'Frente al parque',
    UbicacionLatitud: 0,
    UbicacionLongitud: -99.9961,
    DireccionFisica: '',
    EvidenciaUrl: '',
    IdCategoria: 7,
  });
});

test('rechaza blancos, coordenadas inválidas, categoría ajena y URL no HTTP', () => {
  for (const cambio of [
    { Titulo: ' ' },
    { Descripcion: '' },
    { UbicacionLatitud: '' },
    { UbicacionLatitud: '91' },
    { UbicacionLongitud: '-181' },
    { UbicacionLongitud: 'Infinity' },
    { UbicacionLatitud: '0x10' },
    { IdCategoria: null },
    { IdCategoria: 8 },
    { EvidenciaUrl: 'file:///foto' },
  ]) {
    assert.equal(validarReporte({ ...formulario, ...cambio }, categorias).payload, null);
  }
  assert.equal(validarReporte(formulario, []).payload, null);
});

async function montar(service: IReporteApiService) {
  let vm!: ReturnType<typeof useReporteViewModel>;
  let root!: ReactTestRenderer;
  function Consumer() {
    vm = useReporteViewModel(service, categorias);
    return null;
  }
  await act(async () => {
    root = create(createElement(Consumer));
  });
  const llenar = async (foto?: EvidenciaArchivo) => {
    await act(async () => {
      for (const campo of Object.keys(formulario) as (keyof ReporteFormulario)[]) {
        vm.cambiarCampo(campo, formulario[campo]);
      }
      if (foto) {
        vm.cambiarCampo('foto', foto);
      }
    });
  };
  return {
    get vm() {
      return vm;
    },
    llenar,
    cerrar: async () => {
      await act(async () => root.unmount());
    },
  };
}

test('no llama HTTP cuando el formulario es inválido', async () => {
  let llamadas = 0;
  const hook = await montar({
    crearReporte: async () => {
      llamadas++;
      return { IdReporte: 1 };
    },
    subirEvidencia: async () => ({ EvidenciaUrl: '' }),
  });
  try {
    await act(async () => hook.vm.enviarReporte());
    assert.equal(llamadas, 0);
    assert.ok(hook.vm.errores.Titulo);
  } finally {
    await hook.cerrar();
  }
});

test('expone carga, impide doble envío y confirma éxito; permite crear otro', async () => {
  let resolver!: () => void;
  let llamadas = 0;
  let enviado: CrearReportePayload | undefined;
  const hook = await montar({
    crearReporte: payload => {
      llamadas++;
      enviado = payload;
      return new Promise<ReporteCreadoResponse>(resolve => {
        resolver = () => resolve({ IdReporte: 101 });
      });
    },
    subirEvidencia: async () => ({ EvidenciaUrl: 'https://cdn.example.com/foto.jpg' }),
  });
  try {
    await hook.llenar();
    let solicitud!: Promise<void>;
    await act(async () => {
      solicitud = hook.vm.enviarReporte();
      void hook.vm.enviarReporte();
    });
    assert.equal(hook.vm.isLoading, true);
    assert.equal(llamadas, 1);
    assert.equal(enviado?.UbicacionLatitud, 0);
    await act(async () => {
      resolver();
      await solicitud;
    });
    assert.equal(hook.vm.isLoading, false);
    assert.equal(hook.vm.isSuccess, true);
    await act(async () => hook.vm.enviarReporte());
    assert.equal(llamadas, 1);
    await act(async () => hook.vm.reiniciarFormulario());
    assert.equal(hook.vm.formulario.Titulo, '');
    assert.equal(hook.vm.isSuccess, false);
  } finally {
    await hook.cerrar();
  }
});

test('HU-17: orquesta el flujo de envío doble (POST JSON + POST multipart evidencia)', async () => {
  let creacionLlamada = 0;
  let evidenciaLlamada = 0;
  let idRecibidoEnEvidencia: number | string | undefined;

  const hook = await montar({
    crearReporte: async (payload: CrearReportePayload) => {
      creacionLlamada++;
      assert.equal(payload.Titulo, 'Bache');
      return { IdReporte: 245, success: true };
    },
    subirEvidencia: async (idReporte, archivo) => {
      evidenciaLlamada++;
      idRecibidoEnEvidencia = idReporte;
      assert.equal(archivo.uri, 'file://temp/foto.jpg');
      return { EvidenciaUrl: 'https://cdn.example.com/foto_245.jpg' };
    },
  });

  try {
    const fotoPrueba: EvidenciaArchivo = {
      uri: 'file://temp/foto.jpg',
      name: 'bache.jpg',
      type: 'image/jpeg',
    };
    await hook.llenar(fotoPrueba);
    await act(async () => hook.vm.enviarReporte());

    assert.equal(creacionLlamada, 1);
    assert.equal(evidenciaLlamada, 1);
    assert.equal(idRecibidoEnEvidencia, 245);
    assert.equal(hook.vm.isSuccess, true);
    assert.equal(hook.vm.isLoading, false);
  } finally {
    await hook.cerrar();
  }
});

test('conserva campos ante error y permite reintentar', async () => {
  let llamadas = 0;
  const hook = await montar({
    crearReporte: async () => {
      if (++llamadas === 1) throw new Error('Sin conexión');
      return { IdReporte: 1 };
    },
    subirEvidencia: async () => ({ EvidenciaUrl: '' }),
  });
  try {
    await hook.llenar();
    await act(async () => hook.vm.enviarReporte());
    assert.equal(hook.vm.error, 'Sin conexión');
    assert.equal(hook.vm.formulario.Titulo, formulario.Titulo);
    assert.equal(hook.vm.isLoading, false);
    await act(async () => hook.vm.enviarReporte());
    assert.equal(hook.vm.error, null);
    assert.equal(hook.vm.isSuccess, true);
  } finally {
    await hook.cerrar();
  }
});

test('servicio ReporteApiService envía JSON exacto a /api/reportes y sube evidencia multipart a /api/reportes/:id/evidencia', async () => {
  const originalFetch = globalThis.fetch;
  const payload = validarReporte(formulario, categorias).payload!;
  const service = new ReporteApiService('https://example.test/api', { getToken: async () => 'token-prueba' });

  try {
    // 1. Test POST /reportes
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://example.test/api/reportes');
      assert.equal(options?.method, 'POST');
      assert.deepEqual(JSON.parse(options?.body as string), payload);
      assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token-prueba');
      return new Response(JSON.stringify({ success: true, data: { IdReporte: 55 } }), { status: 201 });
    };
    const creacionRes = await service.crearReporte(payload);
    assert.equal(creacionRes.IdReporte, 55);

    // 2. Test POST /reportes/:id/evidencia
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://example.test/api/reportes/55/evidencia');
      assert.equal(options?.method, 'POST');
      assert.ok(options?.body instanceof FormData);
      assert.equal((options?.headers as Record<string, string>).Authorization, 'Bearer token-prueba');
      return new Response(JSON.stringify({ success: true, data: { EvidenciaUrl: 'https://cdn.example.com/img55.jpg' } }), { status: 200 });
    };
    const evidenciaRes = await service.subirEvidencia(55, { uri: 'file:///foto.jpg' });
    assert.equal(evidenciaRes.EvidenciaUrl, 'https://cdn.example.com/img55.jpg');

    // 3. Test manejo de error HTTP
    globalThis.fetch = async () => new Response(JSON.stringify({ message: 'Error de servidor' }), { status: 500 });
    await assert.rejects(service.crearReporte(payload), /Error de servidor/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
