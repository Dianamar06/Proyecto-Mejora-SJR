'use client';

/**
 * @view DashboardView
 * Vista COMPLETAMENTE PASIVA (Dumb View) del Dashboard administrativo.
 *
 * ============================================================
 * PROHIBICIONES ABSOLUTAS (Contrato MVVM):
 * ✗ NO tiene useState propio de lógica de negocio
 * ✗ NO tiene useEffect
 * ✗ NO tiene llamadas fetch / axios / HTTP de ningún tipo
 * ✗ NO importa servicios concretos
 * ✗ NO toma decisiones de negocio
 *
 * RESPONSABILIDAD ÚNICA (SRP):
 * ✓ SOLO recibe props y las transforma en UI
 * ✓ Renderiza skeleton, error o contenido según los props recibidos
 * ============================================================
 */

import type { DashboardResumen } from '@/services/contracts/IDashboardService';
import { StatCard } from '@/components/StatCard';
import { ReporteRow } from '@/components/ReporteRow';

// ─── Props mínimas y exactas que esta Vista necesita (ISP) ───────────────

interface DashboardViewProps {
  resumen: DashboardResumen | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Sub-componentes de estado visual ────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/5 bg-[#111827] p-6">
      <div className="mb-4 h-12 w-12 rounded-xl bg-white/5" />
      <div className="mb-2 h-8 w-20 rounded-lg bg-white/5" />
      <div className="h-4 w-28 rounded bg-white/5" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="h-3 animate-pulse rounded bg-white/5" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── Vista principal ─────────────────────────────────────────────────────

export function DashboardView({ resumen, isLoading, error }: DashboardViewProps) {
  return (
    <div className="min-h-screen bg-[#0B0F19] px-6 py-8 text-slate-100">
      {/* ── Encabezado ─────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold shadow-lg shadow-blue-600/30">
            M
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Panel Administrativo
            </h1>
            <p className="text-sm text-slate-400">Mejora SJR · San Juan del Río, Qro.</p>
          </div>
        </div>
      </header>

      {/* ── Error State ────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span className="text-lg">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* ── Tarjetas de Estadísticas ────────────────────────────── */}
      <section aria-label="Resumen de reportes" className="mb-8">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Resumen General
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : (
            <>
              <StatCard
                title="Total de Reportes"
                value={resumen?.totalReportes ?? 0}
                icon="📋"
                colorClass="text-slate-100"
                bgAccentClass="bg-slate-400/10"
              />
              <StatCard
                title="Pendientes"
                value={resumen?.pendientes ?? 0}
                icon="⏳"
                colorClass="text-amber-400"
                bgAccentClass="bg-amber-400/10"
              />
              <StatCard
                title="En Proceso"
                value={resumen?.enProceso ?? 0}
                icon="⚙️"
                colorClass="text-violet-400"
                bgAccentClass="bg-violet-400/10"
              />
              <StatCard
                title="Resueltos"
                value={resumen?.resueltos ?? 0}
                icon="✅"
                colorClass="text-emerald-400"
                bgAccentClass="bg-emerald-400/10"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Tabla de Reportes Recientes ─────────────────────────── */}
      <section aria-label="Reportes recientes">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            Reportes Recientes
          </h2>
          {!isLoading && resumen && (
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-500/20">
              {resumen.reportesRecientes.length} reportes
            </span>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#111827] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="py-3 pl-4 pr-3 text-xs font-semibold text-slate-500">ID</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500">Descripción</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500">Categoría</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500">Estado</th>
                  <th className="px-3 py-3 text-xs font-semibold text-slate-500">Prioridad</th>
                  <th className="px-3 py-3 pr-4 text-xs font-semibold text-slate-500">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : resumen?.reportesRecientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-500">
                      No hay reportes recientes.
                    </td>
                  </tr>
                ) : (
                  resumen?.reportesRecientes.map((reporte) => (
                    <ReporteRow
                      key={reporte.id}
                      id={reporte.id}
                      descripcion={reporte.descripcion}
                      estado={reporte.estado}
                      prioridad={reporte.prioridad}
                      categoria={reporte.categoria}
                      fechaCreacion={reporte.fechaCreacion}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="mt-8 text-center text-xs text-slate-600">
        Mejora SJR · Municipio de San Juan del Río, Querétaro · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
