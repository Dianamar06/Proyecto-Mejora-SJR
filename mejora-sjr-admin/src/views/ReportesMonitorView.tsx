'use client';

/**
 * @component ReportesMonitorView
 * Vista del módulo HU-15 — Dashboard de Monitoreo y Filtros de Búsqueda.
 *
 * ================================================================
 * REGLAS ARQUITECTÓNICAS APLICADAS:
 * ================================================================
 * [SRP]  Renderiza la UI y NADA MÁS. Todo el estado viene por props
 *        desde el Custom Hook (useReportes) vía el adaptador page.tsx.
 *
 * [ISP]  Solo recibe las props que necesita pintar; no recibe el service.
 * ================================================================
 */

import Image from 'next/image';
import type { Reporte } from '@/models/Reporte';
import type { EstadoFiltro, CategoriaFiltro, ReportesFiltros } from '@/services/contracts/IReportesService';

// ─── Tipos de props ───────────────────────────────────────────────────────────

interface ReportesMonitorViewProps {
  reportes: Reporte[];
  total: number;
  isLoading: boolean;
  error: string | null;
  filtros: ReportesFiltros;
  onFiltroEstado: (v: EstadoFiltro) => void;
  onFiltroCategoria: (v: CategoriaFiltro) => void;
  onRecargar: () => void;
}

// ─── Diccionarios visuales (traducción de IDs de BD a la UI) ─────────────────

const ESTADO_MAP: Record<number, { label: string; className: string }> = {
  0: { label: 'Todos los estados',  className: '' },
  1: { label: 'Recibido',           className: 'bg-amber-400/10 text-amber-400 ring-amber-400/20' },
  2: { label: 'En Revisión',        className: 'bg-blue-400/10 text-blue-400 ring-blue-400/20' },
  3: { label: 'En Progreso',        className: 'bg-violet-400/10 text-violet-400 ring-violet-400/20' },
  4: { label: 'Resuelto',           className: 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' },
};

const CATEGORIA_MAP: Record<number, string> = {
  0: 'Todas las categorías',
  1: 'Infraestructura',
  2: 'Alumbrado Público',
  3: 'Agua y Drenaje',
  4: 'Parques y Jardines',
  5: 'Seguridad Pública',
  6: 'Residuos Sólidos',
  7: 'Vialidad',
  8: 'Otros',
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[35, 55, 20, 20, 20, 10].map((w, i) => (
        <td key={i} className="px-3 py-4">
          <div
            className="h-3 animate-pulse rounded-md bg-white/5"
            style={{ width: `${w}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

interface EstadoBadgeProps {
  idEstado: number;
}
function EstadoBadge({ idEstado }: EstadoBadgeProps) {
  const conf = ESTADO_MAP[idEstado] ?? {
    label: `Estado ${idEstado}`,
    className: 'bg-slate-400/10 text-slate-400 ring-slate-400/20',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${conf.className}`}
    >
      {conf.label}
    </span>
  );
}

interface EvidenciaCellProps {
  url?: string | null;
  folio: number;
}
function EvidenciaCell({ url, folio }: EvidenciaCellProps) {
  if (!url) {
    return (
      <span className="text-xs text-slate-600 italic">Sin evidencia</span>
    );
  }

  const isImage = /\.(jpg|jpeg|png|gif|webp|avif)(\?.*)?$/i.test(url);

  if (isImage) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title={`Ver evidencia del reporte #${folio}`}
        className="group relative inline-block overflow-hidden rounded-lg border border-white/10 transition-all hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10"
      >
        <Image
          src={url}
          alt={`Evidencia reporte #${folio}`}
          width={48}
          height={48}
          className="h-12 w-12 rounded-lg object-cover transition-transform duration-300 group-hover:scale-110"
          unoptimized
        />
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </div>
      </a>
    );
  }

  // Enlace genérico para PDFs u otros archivos
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-blue-400 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10"
    >
      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      Ver archivo
    </a>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

export function ReportesMonitorView({
  reportes,
  total,
  isLoading,
  error,
  filtros,
  onFiltroEstado,
  onFiltroCategoria,
  onRecargar,
}: ReportesMonitorViewProps) {
  const estadoActual    = filtros.estado    ?? 0;
  const categoriaActual = filtros.categoria ?? 0;

  return (
    <div className="min-h-screen bg-[#0B0F19] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      {/* ── Encabezado ──────────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/30">
              M
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Monitor de Incidencias
              </h1>
              <p className="text-sm text-slate-400">
                Mejora SJR · {total} reporte{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Botón de recarga */}
          <button
            id="btn-recargar-reportes"
            onClick={onRecargar}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 disabled:pointer-events-none disabled:opacity-40"
          >
            <svg
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isLoading ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </header>

      {/* ── Error global ────────────────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
        >
          <span className="mt-0.5 text-base leading-none">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Panel de filtros ─────────────────────────────────────────────────── */}
      <section
        aria-label="Filtros de búsqueda"
        className="mb-6 flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#111827] p-4 sm:flex-row sm:items-center sm:gap-4"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Filtros
        </span>

        {/* Dropdown — Estado */}
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="filtro-estado"
            className="text-xs font-medium text-slate-400"
          >
            Estado
          </label>
          <select
            id="filtro-estado"
            value={estadoActual}
            onChange={(e) => onFiltroEstado(Number(e.target.value) as EstadoFiltro)}
            className="rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-sm text-slate-200 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
          >
            {Object.entries(ESTADO_MAP).map(([id, { label }]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Dropdown — Categoría */}
        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="filtro-categoria"
            className="text-xs font-medium text-slate-400"
          >
            Categoría
          </label>
          <select
            id="filtro-categoria"
            value={categoriaActual}
            onChange={(e) => onFiltroCategoria(Number(e.target.value) as CategoriaFiltro)}
            className="rounded-lg border border-white/10 bg-[#0B0F19] px-3 py-2 text-sm text-slate-200 outline-none transition-all focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/40"
          >
            {Object.entries(CATEGORIA_MAP).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Indicador de filtros activos */}
        {(estadoActual !== 0 || categoriaActual !== 0) && (
          <div className="flex items-end pb-0.5">
            <button
              id="btn-limpiar-filtros"
              onClick={() => {
                onFiltroEstado(0);
                onFiltroCategoria(0);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpiar filtros
            </button>
          </div>
        )}
      </section>

      {/* ── Tabla de reportes ────────────────────────────────────────────────── */}
      <section aria-label="Listado de incidencias ciudadanas">
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111827] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th scope="col" className="py-3 pl-4 pr-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Folio
                  </th>
                  <th scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Título
                  </th>
                  <th scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Categoría
                  </th>
                  <th scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Estado
                  </th>
                  <th scope="col" className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Evidencia
                  </th>
                  <th scope="col" className="px-3 py-3 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* ── Estado: cargando ── */}
                {isLoading && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}

                {/* ── Estado: sin resultados ── */}
                {!isLoading && !error && reportes.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-3xl">🔍</span>
                        <p className="text-sm font-medium text-slate-400">
                          No se encontraron reportes
                        </p>
                        <p className="text-xs text-slate-600">
                          Intenta ajustar los filtros de búsqueda.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* ── Estado: datos ── */}
                {!isLoading &&
                  reportes.map((r) => (
                    <tr
                      key={r.IdReporte}
                      className="border-b border-white/5 transition-colors duration-150 hover:bg-white/[0.03]"
                    >
                      {/* Folio */}
                      <td className="py-4 pl-4 pr-3 font-mono text-xs text-slate-500">
                        #{String(r.IdReporte).padStart(5, '0')}
                      </td>

                      {/* Título */}
                      <td className="max-w-[220px] px-3 py-4">
                        <p
                          className="truncate text-sm font-medium text-slate-200"
                          title={r.Titulo}
                        >
                          {r.Titulo}
                        </p>
                        {r.DireccionFisica && (
                          <p className="mt-0.5 truncate text-xs text-slate-500" title={r.DireccionFisica}>
                            📍 {r.DireccionFisica}
                          </p>
                        )}
                      </td>

                      {/* Categoría */}
                      <td className="px-3 py-4 text-xs text-slate-400">
                        {CATEGORIA_MAP[r.IdCategoria] ?? `Cat. ${r.IdCategoria}`}
                      </td>

                      {/* Estado — badge */}
                      <td className="px-3 py-4">
                        <EstadoBadge idEstado={r.IdEstado} />
                      </td>

                      {/* Evidencia */}
                      <td className="px-3 py-4">
                        <EvidenciaCell url={r.EvidenciaUrl} folio={r.IdReporte} />
                      </td>

                      {/* Fecha */}
                      <td className="px-3 py-4 pr-4 text-xs text-slate-500">
                        {new Date(r.FechaCreacion).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pie de tabla */}
          {!isLoading && reportes.length > 0 && (
            <div className="border-t border-white/5 px-4 py-3">
              <p className="text-xs text-slate-500">
                Mostrando{' '}
                <span className="font-medium text-slate-300">{reportes.length}</span>{' '}
                de{' '}
                <span className="font-medium text-slate-300">{total}</span>{' '}
                reportes
              </p>
            </div>
          )}
        </div>
      </section>

      <footer className="mt-10 text-center text-xs text-slate-700">
        Mejora SJR · Municipio de San Juan del Río, Querétaro · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
