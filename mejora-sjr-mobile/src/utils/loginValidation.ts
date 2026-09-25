export function validateLoginInput(email: string, password: string): string | null {
  const normalizedEmail = email.trim();
  const normalizedPassword = password.trim();

  if (!normalizedEmail || !normalizedPassword) {
    return 'Ingresa un correo electrónico y una contraseña.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  if (!emailRegex.test(normalizedEmail)) {
    return 'Ingresa un correo electrónico válido.';
  }

  if (normalizedPassword.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }

  return null;
}
