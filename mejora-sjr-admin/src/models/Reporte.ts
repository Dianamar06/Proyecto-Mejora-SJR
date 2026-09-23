/**
 * @model Reporte
 * Tipo de dominio que representa un reporte ciudadano urbano.
 * Derivado del esquema Firestore documentado en docs/schema_db.md.
 *
 * REGLA SOLID-SRP: Este archivo solo define la "forma" del dato.
 * No contiene lógica de negocio, componentes ni peticiones HTTP.
 */

export type EstadoReporte =
  | 'pendiente'
  | 'en_revision'
  | 'en_proceso'
  | 'resuelto'
  | 'rechazado';

export type PrioridadReporte = 'baja' | 'media' | 'alta';

export type CategoriaReporte =
  | 'alumbrado_publico'
  | 'baches_pavimento'
  | 'agua_drenaje'
  | 'recoleccion_basura'
  | 'areas_verdes'
  | 'seguridad_vial'
  | 'otro';

export interface Reporte {
  id: string;
  descripcion: string;
  estado: EstadoReporte;
  prioridad: PrioridadReporte;
  categoria: CategoriaReporte;
  direccionReferencia: string;
  fechaCreacion: string; // ISO 8601
  usuarioId: string;
}
