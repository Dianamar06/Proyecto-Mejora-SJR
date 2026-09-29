/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import type { PhotoFile } from '../src/models/PhotoFile';
import type { IImagePickerService } from '../src/services/contracts/IImagePickerService';
import { useCameraViewModel } from '../src/viewModels/useCameraViewModel';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const photo: PhotoFile = {
  uri: 'file:///evidencia.jpg', name: 'evidencia.jpg', type: 'image/jpeg', width: 1200, height: 900,
};

async function mount(service: IImagePickerService) {
  let current!: ReturnType<typeof useCameraViewModel>;
  let renderer!: ReactTestRenderer;
  function Consumer() { current = useCameraViewModel(service); return null; }
  await act(async () => { renderer = create(createElement(Consumer)); });
  return {
    get current() { return current; },
    async unmount() { await act(async () => renderer.unmount()); },
  };
}

test('publica el archivo elegido con los datos requeridos por FormData', async () => {
  const hook = await mount({ takePhoto: async () => photo, selectFromGallery: async () => null });
  try {
    await act(async () => hook.current.takePhoto());
    assert.deepEqual(hook.current.photo, photo);
    assert.equal(hook.current.photo?.name, 'evidencia.jpg');
    assert.equal(hook.current.photo?.type, 'image/jpeg');
    await act(async () => hook.current.clearPhoto());
    assert.equal(hook.current.photo, null);
  } finally { await hook.unmount(); }
});

test('cancelar la galería conserva la fotografía anterior', async () => {
  let galleryCalls = 0;
  const hook = await mount({
    takePhoto: async () => photo,
    selectFromGallery: async () => { galleryCalls++; return null; },
  });
  try {
    await act(async () => hook.current.takePhoto());
    await act(async () => hook.current.selectFromGallery());
    assert.equal(galleryCalls, 1);
    assert.deepEqual(hook.current.photo, photo);
    assert.equal(hook.current.error, null);
  } finally { await hook.unmount(); }
});

test('expone errores de permisos y evita selecciones simultáneas', async () => {
  let resolve!: (value: PhotoFile | null) => void;
  let calls = 0;
  const pending = new Promise<PhotoFile | null>((done) => { resolve = done; });
  const hook = await mount({
    takePhoto: async () => { calls++; return pending; },
    selectFromGallery: async () => { throw new Error('Permiso de galería denegado'); },
  });
  try {
    let first!: Promise<void>;
    await act(async () => { first = hook.current.takePhoto(); void hook.current.takePhoto(); });
    assert.equal(calls, 1);
    assert.equal(hook.current.isLoading, true);
    await act(async () => { resolve(photo); await first; });
    await act(async () => hook.current.selectFromGallery());
    assert.equal(hook.current.isLoading, false);
    assert.match(hook.current.error || '', /Permiso/);
  } finally { await hook.unmount(); }
});
