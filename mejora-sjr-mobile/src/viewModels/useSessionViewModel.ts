import { useCallback, useEffect, useRef, useState } from 'react';

import type { ITokenStorage } from '@/services/contracts/ITokenStorage';

export type SessionStatus = 'restoring' | 'authenticated' | 'unauthenticated';

export interface SessionViewModelReturn {
  status: SessionStatus;
  isAuthenticated: boolean;
  error: string | null;
  startSession: (token: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  retryRestore: () => Promise<void>;
}

/**
 * Orquesta el ciclo de sesión. Depende de ITokenStorage y desconoce SecureStore.
 * Un token vacío se considera una sesión inválida y se elimina.
 */
export function useSessionViewModel(tokenStorage: ITokenStorage): SessionViewModelReturn {
  const [status, setStatus] = useState<SessionStatus>('restoring');
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const restoreSession = useCallback(async () => {
    if (mounted.current) {
      setStatus('restoring');
      setError(null);
    }

    try {
      const token = await tokenStorage.getToken();
      const hasToken = Boolean(token?.trim());

      if (token !== null && !hasToken) {
        await tokenStorage.removeToken();
      }

      if (mounted.current) {
        setStatus(hasToken ? 'authenticated' : 'unauthenticated');
      }
    } catch {
      if (mounted.current) {
        setStatus('unauthenticated');
        setError('No fue posible restaurar la sesión guardada.');
      }
    }
  }, [tokenStorage]);

  useEffect(() => {
    void restoreSession();
  }, [restoreSession]);

  const startSession = useCallback(async (token: string): Promise<boolean> => {
    try {
      await tokenStorage.setToken(token);
      if (mounted.current) {
        setError(null);
        setStatus('authenticated');
      }
      return true;
    } catch {
      if (mounted.current) {
        setError('No fue posible guardar la sesión en este dispositivo.');
        setStatus('unauthenticated');
      }
      return false;
    }
  }, [tokenStorage]);

  const signOut = useCallback(async (): Promise<void> => {
    try {
      await tokenStorage.removeToken();
      if (mounted.current) setError(null);
    } catch {
      if (mounted.current) setError('No fue posible eliminar la sesión guardada.');
    } finally {
      if (mounted.current) setStatus('unauthenticated');
    }
  }, [tokenStorage]);

  return {
    status,
    isAuthenticated: status === 'authenticated',
    error,
    startSession,
    signOut,
    retryRestore: restoreSession,
  };
}
