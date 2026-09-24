/**
 * @component StatCard
 * Tarjeta visual de estadística del Dashboard.
 *
 * REGLA ISP: Recibe SOLO los props mínimos que necesita pintar.
 * No recibe el objeto DashboardResumen completo.
 *
 * REGLA SRP: Solo dibuja UI. Sin estado, sin lógica de negocio.
 */

interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  colorClass: string;      // Clase Tailwind para el color del acento (e.g. 'text-amber-400')
  bgAccentClass: string;   // Clase Tailwind para el fondo del icono (e.g. 'bg-amber-400/10')
}

export function StatCard({ title, value, icon, colorClass, bgAccentClass }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#111827] p-6 shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl">
      {/* Icono con fondo de color */}
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${bgAccentClass}`}>
        {icon}
      </div>

      {/* Valor numérico principal */}
      <p className={`text-4xl font-bold tracking-tight ${colorClass}`}>
        {value.toLocaleString('es-MX')}
      </p>

      {/* Etiqueta */}
      <p className="mt-1 text-sm font-medium text-slate-400">{title}</p>

      {/* Decoración de fondo */}
      <div
        className={`pointer-events-none absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-10 blur-2xl ${bgAccentClass}`}
      />
    </div>
  );
}
