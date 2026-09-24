import { useState } from 'react';
import { IApiService, ApiError } from '../services/contracts/IApiService';
import { ApiService } from '../services/api/apiService';

/**
 * ViewModel para la pantalla de inicio de sesión.
 * 
 * Cumple con DIP (Dependency Inversion Principle):
 * - Recibe el servicio de red tipado con la interfaz abstracta `IApiService`.
 * - No depende de fetch, axios ni de la clase concreta `ApiService`.
 * - Permite inyectar un Mock de red para pruebas unitarias sin tocar este código.
 * - Mantiene la vista (LoginView) 100% limpia de lógica de red, tokens y validaciones.
 * 
 * @param onContinue Callback invocado al completar exitosamente el acceso o navegar.
 * @param apiService Servicio de red inyectado (abstracción IApiService).
 */
export function useLoginViewModel(
  onContinue: () => void,
  apiService: IApiService = new ApiService()
) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Ejecuta el inicio de sesión contra la API usando la abstracción inyectada.
   */
  const handleLogin = async () => {
    // 1. Validaciones de presentación en el ViewModel
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 2. Llamada a la API mediante el contrato IApiService
      // No requiere autorización previa (requiresAuth: false) porque es el endpoint de autenticación
      interface LoginResponse {
        token?: string;
        user?: { id: string; email: string };
      }

      await apiService.post<LoginResponse>(
        '/auth/login',
        { email: email.trim(), password },
        { requiresAuth: false }
      );

      // 3. Notificar navegación limpia a través del callback
      onContinue();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Ocurrió un error inesperado al iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // Estado de presentación para la Vista
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    errorMessage,

    // Acciones disponibles para la UI
    handleLogin,
    continueToHome: onContinue,
  };
}
