/**
 * @model Reporte
 * Tipo de dominio que representa un reporte ciudadano urbano.
 * Refactorizado para respetar estrictamente la fuente de verdad (MejoraSJR_DB).
 *
 * REGLA SOLID-SRP: Este archivo solo define la "forma" del dato.
 * No contiene lógica de negocio, componentes ni peticiones HTTP.
 */

export interface Reporte {
  IdReporte: number;
  Titulo: string;
  Descripcion: string;
  UbicacionLatitud: number;
  UbicacionLongitud: number;
  DireccionFisica?: string | null;
  EvidenciaUrl?: string | null;
  IdUsuario: number;
  IdCategoria: number;
  IdEstado: number;
  FechaCreacion: string;
  FechaActualizacion: string;
}
