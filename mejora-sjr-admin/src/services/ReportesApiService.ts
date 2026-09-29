import type { IReportesService } from "./IReportesService";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export class ReportesApiService implements IReportesService {
  async cambiarEstado(idReporte: number, idNuevoEstado: number): Promise<void> {
    // Asumimos que guardas el token del admin en localStorage (HU-09)
    const token = localStorage.getItem("token") || "";

    const response = await fetch(`${API_BASE}/api/reportes/${idReporte}/estado`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ IdEstado: idNuevoEstado }),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error("Permisos insuficientes para cambiar el estado.");
      }
      throw new Error("Error al cambiar el estado del reporte.");
    }
  }
}

export const reportesApiService = new ReportesApiService();
