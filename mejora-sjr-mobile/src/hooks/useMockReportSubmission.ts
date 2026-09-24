import { useState } from 'react';

// Interfaz para definir la estructura de un reporte según la arquitectura planeada
export interface ReportPayload {
  title: string;
  description: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  imageUrl?: string;
}

/**
 * Custom Hook: useMockReportSubmission
 * 
 * Este hook es un "Mock" (simulador). Permite a Miguel (quien hace las pantallas)
 * poder probar la interacción de envío sin necesitar que el backend esté listo.
 * Solo simula un retraso de red y devuelve éxito o error.
 * 
 * Siguiendo SOLID (Dependency Inversion): Miguel inyectará y usará esta interfaz 
 * y en un futuro la podremos reemplazar por "useRealReportSubmission" sin tocar sus vistas.
 */
export function useMockReportSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submitReport = async (payload: ReportPayload) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    // Simulando el tiempo que tardaría la petición HTTP (2 segundos)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulando la validación del Backend (Moisés/Isaac)
        if (!payload.title || !payload.description) {
          setError('El título y la descripción son obligatorios.');
          setIsLoading(false);
          reject(new Error('Validación fallida: Faltan datos requeridos'));
          return;
        }

        // Simulando que se guardó correctamente en Firebase (Oscar R.)
        setSuccess(true);
        setIsLoading(false);
        resolve({
          status: 201,
          message: 'Reporte creado exitosamente (Simulación)',
          data: {
            id: `mock-report-${Math.floor(Math.random() * 1000)}`,
            ...payload,
            createdAt: new Date().toISOString()
          }
        });
      }, 2000);
    });
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    setSuccess(false);
  };

  return {
    submitReport,
    isLoading,
    error,
    success,
    resetState
  };
}
