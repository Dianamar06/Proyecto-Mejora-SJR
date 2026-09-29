import { useState } from "react";
import toast from "react-hot-toast";
import type { IReportesService } from "@/services/IReportesService";
import { reportesApiService } from "@/services/ReportesApiService";

export function useReporteRowViewModel(
  idReporte: number,
  estadoInicial: number,
  apiService: IReportesService = reportesApiService
) {
  const [estadoActual, setEstadoActual] = useState(estadoInicial);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEstadoChange = async (nuevoEstadoStr: string) => {
    const nuevoEstado = parseInt(nuevoEstadoStr, 10);
    if (nuevoEstado === estadoActual) return;

    try {
      setIsUpdating(true);
      
      // Promesa con notificaciones Toast automáticas
      await toast.promise(
        apiService.cambiarEstado(idReporte, nuevoEstado),
        {
          loading: 'Actualizando estado...',
          success: '¡Estado actualizado correctamente!',
          error: (err) => err.message || 'Error al actualizar',
        }
      );
      
      setEstadoActual(nuevoEstado);
    } catch (error) {
      // El error ya lo maneja el toast.promise, pero si falla lo regresamos a su valor visual anterior.
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    estadoActual,
    isUpdating,
    handleEstadoChange
  };
}
