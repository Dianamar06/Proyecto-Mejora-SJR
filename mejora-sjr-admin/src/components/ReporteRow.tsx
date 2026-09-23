/**
 * @component ReporteRow
 * Fila de tabla que representa un reporte ciudadano.
 *
 * REGLA ISP: Recibe solo los campos que necesita mostrar, NO el objeto Reporte completo.
 * REGLA SRP: Solo dibuja UI. Sin estado, sin lógica de negocio.
 */

import type { EstadoReporte, PrioridadReporte, CategoriaReporte } from '@/models/Reporte';

interface ReporteRowProps {
  id: string;
  descripcion: string;
  estado: EstadoReporte;
  prioridad: PrioridadReporte;
  categoria: CategoriaReporte;
  fechaCreacion: string;
}

// ─── Helpers de presentación (solo formateo visual) ──────────────────────

const ESTADO_CONFIG: Record<EstadoReporte, { label: string; className: string }> = {
  pendiente:   { label: 'Pendiente',   className: 'bg-amber-400/10 text-amber-400 ring-amber-400/20' },
  en_revision: { label: 'En Revisión', className: 'bg-blue-400/10 text-blue-400 ring-blue-400/20' },
  en_proceso:  { label: 'En Proceso',  className: 'bg-violet-400/10 text-violet-400 ring-violet-400/20' },
  resuelto:    { label: 'Resuelto',    className: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' },
  rechazado:   { label: 'Rechazado',   className: 'bg-red-400/10 text-red-400 ring-red-400/20' },
};

const PRIORIDAD_CONFIG: Record<PrioridadReporte, { label: string; className: string }> = {
  baja:  { label: 'Baja',  className: 'text-slate-400' },
  media: { label: 'Media', className: 'text-amber-400' },
  alta:  { label: 'Alta',  className: 'text-red-400 font-semibold' },
};

const CATEGORIA_LABEL: Record<CategoriaReporte, string> = {
  alumbrado_publico: 'Alumbrado',
  baches_pavimento:  'Baches',
  agua_drenaje:      'Agua/Drenaje',
  recoleccion_basura:'Basura',
  areas_verdes:      'Áreas Verdes',
  seguridad_vial:    'Seg. Vial',
  otro:              'Otro',
};

function formatearFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Componente ─────────────────────────────────────────────────────────

export function ReporteRow({ id, descripcion, estado, prioridad, categoria, fechaCreacion }: ReporteRowProps) {
  const estadoConf = ESTADO_CONFIG[estado];
  const prioridadConf = PRIORIDAD_CONFIG[prioridad];

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
      {/* ID truncado */}
      <td className="py-3 pl-4 pr-3 text-xs font-mono text-slate-500">
        #{id.slice(-5).toUpperCase()}
      </td>

      {/* Descripción */}
      <td className="max-w-xs px-3 py-3">
        <p className="truncate text-sm text-slate-200" title={descripcion}>
          {descripcion}
        </p>
      </td>

      {/* Categoría */}
      <td className="px-3 py-3 text-xs text-slate-400">
        {CATEGORIA_LABEL[categoria]}
      </td>

      {/* Estado — badge */}
      <td className="px-3 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estadoConf.className}`}>
          {estadoConf.label}
        </span>
      </td>

      {/* Prioridad */}
      <td className={`px-3 py-3 text-xs ${prioridadConf.className}`}>
        {prioridadConf.label}
      </td>

      {/* Fecha */}
      <td className="px-3 py-3 pr-4 text-xs text-slate-500">
        {formatearFecha(fechaCreacion)}
      </td>
    </tr>
  );
}
