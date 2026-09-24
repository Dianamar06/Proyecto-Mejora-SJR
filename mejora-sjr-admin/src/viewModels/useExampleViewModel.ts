import { useState, useEffect } from 'react';
import { ApiService } from '../services/apiService';

// Definimos la forma de los datos esperados basándonos en el esquema general
export interface Reporte {
  id: string;
  categoria: string;
  descripcion: string;
  estado: string;
}

/**
 * Custom Hook: useExampleViewModel
 * 
 * Cumple con DIP (Dependency Inversion Principle). Este ViewModel no importa
 * axios ni usa fetch directamente. Recibe el servicio API inyectado por parámetro.
 * 
 * Cumple con SRP (Single Responsibility Principle). Maneja exclusivamente la lógica 
 * de estado y conexión para la vista, dejando a la Vista (componente JSX/TSX) 100% tonta.
 */
export function useExampleViewModel(apiService: ApiService) {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Uso del servicio inyectado sin saber qué librería HTTP hay por debajo.
      // Así la vista web no tocará ni SQL Server ni Firebase directamente, 
      // todo pasa limpiamente por nuestra API RESTful.
      const data = await apiService.get<Reporte[]>('/reportes');
      setReportes(data);
    } catch (err: any) {
      setError(err.message || 'Error al obtener los reportes');
    } finally {
      setIsLoading(false);
    }
  };

  const crearReporte = async (nuevoReporte: Omit<Reporte, 'id'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const creado = await apiService.post<Reporte>('/reportes', nuevoReporte);
      setReportes(prev => [...prev, creado]);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al crear el reporte');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial automatizada
  useEffect(() => {
    fetchReportes();
  }, [apiService]);

  return {
    reportes,
    isLoading,
    error,
    crearReporte,
    recargarReportes: fetchReportes
  };
}
