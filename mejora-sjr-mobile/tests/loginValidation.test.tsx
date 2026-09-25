import assert from 'node:assert/strict';
import { test } from 'node:test';

import { validateLoginInput } from '../src/utils/loginValidation';

test('valida campos vacíos en inicio de sesión', () => {
  assert.equal(
    validateLoginInput('  ', '123456'),
    'Ingresa un correo electrónico y una contraseña.'
  );

  assert.equal(
    validateLoginInput('usuario@demo.com', '   '),
    'Ingresa un correo electrónico y una contraseña.'
  );
});

test('acepta credenciales válidas', () => {
  assert.equal(validateLoginInput('usuario@demo.com', 'Pass1234'), null);
  assert.equal(validateLoginInput('USER@DEMO.COM', 'abc123'), null);
});

test('rechaza correos con formato inválido', () => {
  assert.match(validateLoginInput('usuario', 'Pass1234') ?? '', /correo/i);
  assert.match(validateLoginInput('usuario@', 'Pass1234') ?? '', /correo/i);
});
