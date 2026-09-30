"use client";

/**
 * useLoginViewModel — ViewModel del patrón MVVM para la pantalla de Login.
 *
 * REGLAS ARQUITECTÓNICAS:
 * ✅ NO importa axios, fetch ni ningún cliente HTTP directamente.
 * ✅ Recibe el servicio inyectado por parámetro (defaultService = authApiService).
 * ✅ Expone sólo estado y handlers; la Vista es 100% tonta.
 * ✅ Aplica SOLID: Principio de Inversión de Dependencias (D).
 */

import { useState, useCallback } from "react";
import type { IAuthService } from "@/services/IAuthService";
import { authApiService } from "@/services/AuthApiService";

// ── Tipos expuestos a la Vista ────────────────────────────────────────────────

export interface LoginFormState {
  correo: string;
  password: string;
}

export interface LoginViewModelReturn {
  /** Valores actuales del formulario */
  formState: LoginFormState;
  /** Si hay una petición HTTP en vuelo */
  isLoading: boolean;
  /** Mensaje de error para mostrar al usuario, o null si no hay error */
  errorMessage: string | null;
  /** Si el login fue exitoso (útil para redirigir desde la Vista) */
  isSuccess: boolean;
  /** Handler enlazado al onChange de los inputs */
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /** Handler enlazado al onSubmit del formulario */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  /** Limpia el mensaje de error (para cerrar alertas manualmente) */
  clearError: () => void;
}

// ── Implementación ────────────────────────────────────────────────────────────

/**
 * @param service - Implementación de IAuthService a usar.
 *                  Por defecto usa AuthApiService (Fetch nativo).
 *                  Sustituye por un mock en tests unitarios.
 */
export function useLoginViewModel(
  service: IAuthService = authApiService
): LoginViewModelReturn {
  const [formState, setFormState] = useState<LoginFormState>({
    correo: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState((prev) => ({ ...prev, [name]: value }));
      // Limpiar error al editar cualquier campo
      setErrorMessage(null);
    },
    []
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Construye el payload en PascalCase tal como espera el backend
        const response = await service.login({
          Correo: formState.correo.trim(),
          Password: formState.password,
        });

        // Persistir el token de sesión (ajusta la estrategia según el proyecto)
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sjr_token", response.token);
          if (response.nombreUsuario) {
            sessionStorage.setItem("sjr_user", response.nombreUsuario);
          }
        }

        setIsSuccess(true);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado. Intenta de nuevo.";
        setErrorMessage(message);
        setIsSuccess(false);
      } finally {
        setIsLoading(false);
      }
    },
    [formState, service]
  );

  const clearError = useCallback(() => setErrorMessage(null), []);

  return {
    formState,
    isLoading,
    errorMessage,
    isSuccess,
    handleChange,
    handleSubmit,
    clearError,
  };
}
