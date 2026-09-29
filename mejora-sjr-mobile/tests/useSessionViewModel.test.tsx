/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import type { ITokenStorage } from '../src/services/contracts/ITokenStorage';
import { useSessionViewModel } from '../src/viewModels/useSessionViewModel';

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

class MemoryTokenStorage implements ITokenStorage {
  constructor(public token: string | null = null, public shouldFail = false) {}
  async getToken() { if (this.shouldFail) throw new Error('storage'); return this.token; }
  async setToken(token: string) { if (this.shouldFail) throw new Error('storage'); this.token = token; }
  async removeToken() { if (this.shouldFail) throw new Error('storage'); this.token = null; }
}

async function mount(storage: ITokenStorage) {
  let current!: ReturnType<typeof useSessionViewModel>;
  let renderer!: ReactTestRenderer;
  function Consumer() { current = useSessionViewModel(storage); return null; }
  await act(async () => { renderer = create(createElement(Consumer)); });
  return {
    get current() { return current; },
    async unmount() { await act(async () => renderer.unmount()); },
  };
}

test('restaura una sesión cuando encuentra un token persistido', async () => {
  const hook = await mount(new MemoryTokenStorage('jwt-guardado'));
  try {
    assert.equal(hook.current.status, 'authenticated');
    assert.equal(hook.current.isAuthenticated, true);
  } finally { await hook.unmount(); }
});

test('muestra Login si no existe token y puede iniciar y cerrar sesión', async () => {
  const storage = new MemoryTokenStorage();
  const hook = await mount(storage);
  try {
    assert.equal(hook.current.status, 'unauthenticated');
    await act(async () => { assert.equal(await hook.current.startSession('jwt-nuevo'), true); });
    assert.equal(storage.token, 'jwt-nuevo');
    assert.equal(hook.current.status, 'authenticated');
    await act(async () => hook.current.signOut());
    assert.equal(storage.token, null);
    assert.equal(hook.current.status, 'unauthenticated');
  } finally { await hook.unmount(); }
});

test('un fallo de almacenamiento no concede una sesión', async () => {
  const hook = await mount(new MemoryTokenStorage(null, true));
  try {
    assert.equal(hook.current.status, 'unauthenticated');
    assert.match(hook.current.error || '', /restaurar/);
    await act(async () => { assert.equal(await hook.current.startSession('jwt'), false); });
    assert.equal(hook.current.isAuthenticated, false);
    assert.match(hook.current.error || '', /guardar/);
  } finally { await hook.unmount(); }
});
