import { useState, useCallback } from 'react';
import { IAuthService } from '../services/contracts/IAuthService';
import { AuthResponse } from '../models/Auth';

/**
 * Estado y manejadores expuestos por useLoginViewModel para la Vista tonta.
 */
export interface LoginViewModelReturn {
  // Estados de los campos de texto
  correo: string;
  password: string;
  showPassword: boolean;

  // Estados de retroalimentación
  isLoading: boolean;
  errorMessage: string | null;
  isSuccess: boolean;
  authData: AuthResponse | null;

  // Setters y Handlers
  setCorreo: (value: string) => void;
  setPassword: (value: string) => void;
  toggleShowPassword: () => void;
  handleSubmit: () => Promise<boolean>;
  clearError: () => void;
  resetForm: () => void;
}

/**
 * useLoginViewModel — Hook ViewModel para la pantalla de Login móvil.
 * 
 * Cumplimiento Arquitectónico:
 * - MVVM: Contiene toda la lógica de negocio y estado del formulario.
 * - SOLID & DI: Recibe el servicio IAuthService inyectado por parámetro.
 *   Por defecto inyecta authApiService; sustituible por mocks en tests.
 * - Sin dependencias directas de Axios o Fetch.
 * - Envía el payload con claves estrictamente en PascalCase: { Correo, Password }.
 * 
 * @param service Instancia de IAuthService inyectada (DIP).
 */
export function useLoginViewModel(
  service: IAuthService,
  onAuthenticated?: (token: string) => Promise<boolean>,
): LoginViewModelReturn {
  const [correo, setCorreoState] = useState<string>('');
  const [password, setPasswordState] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [authData, setAuthData] = useState<AuthResponse | null>(null);

  const setCorreo = useCallback((value: string) => {
    setCorreoState(value);
    setErrorMessage(null);
  }, []);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    setErrorMessage(null);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  const resetForm = useCallback(() => {
    setCorreoState('');
    setPasswordState('');
    setShowPassword(false);
    setIsLoading(false);
    setErrorMessage(null);
    setIsSuccess(false);
    setAuthData(null);
  }, []);

  const validate = (): boolean => {
    const trimmedCorreo = correo.trim();
    if (!trimmedCorreo) {
      setErrorMessage('Por favor, ingresa tu correo electrónico.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedCorreo)) {
      setErrorMessage('Ingresa un formato de correo electrónico válido.');
      return false;
    }

    if (!password) {
      setErrorMessage('Por favor, ingresa tu contraseña.');
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
      // Payload en PascalCase según especificación del backend
      const payload = {
        Correo: correo.trim(),
        Password: password,
      };

      const response = await service.login(payload);
      if (onAuthenticated && !(await onAuthenticated(response.token))) {
        throw new Error('No fue posible guardar la sesión en este dispositivo.');
      }
      setAuthData(response);
      setIsSuccess(true);
      return true;
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocurrió un error inesperado al iniciar sesión. Intenta nuevamente.';
      setErrorMessage(message);
      setIsSuccess(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [correo, password, service, onAuthenticated]);

  return {
    correo,
    password,
    showPassword,
    isLoading,
    errorMessage,
    isSuccess,
    authData,
    setCorreo,
    setPassword,
    toggleShowPassword,
    handleSubmit,
    clearError,
    resetForm,
  };
}
