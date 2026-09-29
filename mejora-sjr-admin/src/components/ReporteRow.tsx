/**
 * @component ReporteRow
 * Fila de tabla que representa un reporte ciudadano.
 *
 * REGLA ISP: Recibe solo los campos que necesita mostrar.
 * REGLA SRP: Solo dibuja UI basándose en el esquema SQL estricto.
 */

import { useReporteRowViewModel } from "@/viewModels/useReporteRowViewModel";

interface ReporteRowProps {
  IdReporte: number;
  Descripcion: string;
  IdEstado: number;
  IdCategoria: number;
  FechaCreacion: string;
}

// ─── Mapeos visuales (Diccionarios que traducen tus IDs de BD a la UI) ───

// Alineado a la tabla Estados_Reporte de tu esquema
const ESTADO_CONFIG: Record<number, { label: string; className: string }> = {
  1: { label: 'Recibido',    className: 'bg-amber-400/10 text-amber-400 ring-amber-400/20' },
  2: { label: 'En Revisión', className: 'bg-blue-400/10 text-blue-400 ring-blue-400/20' },
  3: { label: 'En Progreso', className: 'bg-violet-400/10 text-violet-400 ring-violet-400/20' },
  4: { label: 'Resuelto',    className: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' },
};

function formatearFecha(iso: string): string {
  if (!iso) return 'Sin fecha';
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ─── Componente ─────────────────────────────────────────────────────────

export function ReporteRow({ IdReporte, Descripcion, IdEstado, IdCategoria, FechaCreacion }: ReporteRowProps) {
  const vm = useReporteRowViewModel(IdReporte, IdEstado);
  const estadoConf = ESTADO_CONFIG[vm.estadoActual] || ESTADO_CONFIG[1];

  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
      <td className="py-3 pl-4 pr-3 text-xs font-mono text-slate-500">
        #{String(IdReporte).padStart(4, '0')}
      </td>

      <td className="max-w-xs px-3 py-3">
        <p className="truncate text-sm text-slate-200" title={Descripcion}>
          {Descripcion}
        </p>
      </td>

      <td className="px-3 py-3 text-xs text-slate-400">
        Categoría {IdCategoria}
      </td>

      <td className="px-3 py-3">
        <select
          value={vm.estadoActual}
          onChange={(e) => vm.handleEstadoChange(e.target.value)}
          disabled={vm.isUpdating}
          className={`appearance-none cursor-pointer rounded-full px-3 py-1 text-xs font-medium border focus:outline-none transition-all disabled:opacity-50 bg-slate-900 ${estadoConf.className}`}
        >
          {Object.entries(ESTADO_CONFIG).map(([idStr, config]) => (
            <option key={idStr} value={idStr} className="bg-slate-900 text-slate-200">
              {config.label}
            </option>
          ))}
        </select>
      </td>

      <td className="px-3 py-3 pr-4 text-xs text-slate-500">
        {formatearFecha(FechaCreacion)}
      </td>
    </tr>
  );
}
