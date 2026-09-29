import { useState, useCallback } from 'react';
import { IAuthService } from '../services/contracts/IAuthService';
import { AuthResponse } from '../models/Auth';

/**
 * Estado y manejadores expuestos por useRegisterViewModel para la Vista tonta de Registro.
 */
export interface RegisterViewModelReturn {
  // Campos del formulario
  nombreCompleto: string;
  correo: string;
  telefono: string;
  password: string;
  confirmPassword: string;
  showPassword: boolean;

  // Estados de retroalimentación
  isLoading: boolean;
  errorMessage: string | null;
  isSuccess: boolean;
  authData: AuthResponse | null;

  // Setters y Handlers
  setNombreCompleto: (value: string) => void;
  setCorreo: (value: string) => void;
  setTelefono: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  toggleShowPassword: () => void;
  handleSubmit: () => Promise<boolean>;
  clearError: () => void;
  resetForm: () => void;
}

/**
 * useRegisterViewModel — Hook ViewModel para la pantalla de Registro móvil.
 * 
 * Cumplimiento Arquitectónico:
 * - MVVM: Orquesta validaciones, estado de campos y llamada a IAuthService.
 * - SOLID & DI: Recibe IAuthService inyectado por parámetro (DIP).
 * - Desacoplado de Axios/Fetch.
 * - Envía el payload con claves estrictamente en PascalCase:
 *   { NombreCompleto, Correo, PasswordHash, Telefono }
 * 
 * @param service Instancia de IAuthService inyectada.
 */
export function useRegisterViewModel(
  service: IAuthService
): RegisterViewModelReturn {
  const [nombreCompleto, setNombreCompletoState] = useState<string>('');
  const [correo, setCorreoState] = useState<string>('');
  const [telefono, setTelefonoState] = useState<string>('');
  const [password, setPasswordState] = useState<string>('');
  const [confirmPassword, setConfirmPasswordState] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  const setNombreCompleto = useCallback((value: string) => {
    setNombreCompletoState(value);
    setErrorMessage(null);
  }, []);

  const setCorreo = useCallback((value: string) => {
    setCorreoState(value);
    setErrorMessage(null);
  }, []);

  const setTelefono = useCallback((value: string) => {
    // Permitir solo números y longitud máxima de 10
    const cleaned = value.replace(/\D/g, '').slice(0, 10);
    setTelefonoState(cleaned);
    setErrorMessage(null);
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    setErrorMessage(null);
  }, []);

  const setConfirmPassword = useCallback((value: string) => {
    setConfirmPasswordState(value);
    setErrorMessage(null);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const resetForm = useCallback(() => {
    setNombreCompletoState('');
    setCorreoState('');
    setTelefonoState('');
    setPasswordState('');
    setConfirmPasswordState('');
    setShowPassword(false);
    setIsLoading(false);
    setErrorMessage(null);
    setIsSuccess(false);
    setAuthData(null);
  }, []);

  const validate = (): boolean => {
    const trimmedNombre = nombreCompleto.trim();
    if (!trimmedNombre || trimmedNombre.length < 3) {
      setErrorMessage('Ingresa tu nombre completo (mínimo 3 caracteres).');
      return false;
    }

    const trimmedCorreo = correo.trim();
    if (!trimmedCorreo) {
      setErrorMessage('Ingresa tu correo electrónico.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedCorreo)) {
      setErrorMessage('Ingresa un correo electrónico con formato válido.');
      return false;
    }

    if (!telefono || telefono.length < 10) {
      setErrorMessage('Ingresa un número telefónico válido a 10 dígitos.');
      return false;
    }

    if (!password || password.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Las contraseñas no coinciden. Verifica nuevamente.');
      return false;
    }

    return true;
  };

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validate()) {
      return false;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Payload en PascalCase estricto según la especificación
      const payload = {
        NombreCompleto: nombreCompleto.trim(),
        Correo: correo.trim(),
        Password: password,
        Telefono: telefono.trim(),
      };

      const response = await service.register(payload);
      setAuthData(response);
      setIsSuccess(true);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error al registrar la cuenta. Intenta nuevamente.';
      setErrorMessage(message);
      setIsSuccess(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [nombreCompleto, correo, password, confirmPassword, telefono, service]);

  return {
    nombreCompleto,
    correo,
    telefono,
    password,
    confirmPassword,
    showPassword,
    isLoading,
    errorMessage,
    isSuccess,
    authData,
    setNombreCompleto,
    setCorreo,
    setTelefono,
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    handleSubmit,
    clearError,
    resetForm,
  };
}
