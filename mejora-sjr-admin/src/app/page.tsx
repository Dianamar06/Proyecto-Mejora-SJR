'use client';

/**
 * @adapter app/page.tsx — Ruta raíz "/"
 *
 * ============================================================
 * ROL EN MVVM: ADAPTADOR (Composition Root)
 * ============================================================
 *
 * Este archivo es el ÚNICO punto de integración entre:
 *   1. La implementación concreta del servicio (capa de datos)
 *   2. El ViewModel (lógica de presentación)
 *   3. La Vista (UI pasiva)
 *
 * REGLAS que DEBE respetar:
 *   ✓ Importa el servicio concreto  → dashboardServiceMock
 *   ✓ Invoca el ViewModel           → useDashboardViewModel(service)
 *   ✓ Pasa el estado como props     → <DashboardView ... />
 *   ✗ NO dibuja JSX de negocio (eso es responsabilidad de la Vista)
 *   ✗ NO duplica lógica del ViewModel
 *
 * Para cambiar a producción: sustituir dashboardServiceMock
 * por dashboardServiceApi sin tocar ViewModel ni Vista. (OCP)
 * ============================================================
 */

// ─── Capa de Datos: implementación concreta del servicio ────────────
import { dashboardServiceMock } from '@/services/mocks/dashboardServiceMock';

// ─── ViewModel: lógica de presentación ──────────────────────────────
import { useMemo }               from 'react';
import { useDashboardViewModel } from '@/viewModels/useDashboardViewModel';

// ─── Vista: componente pasivo que solo pinta UI ──────────────────────
import { DashboardView } from '@/views/DashboardView';

// ─── Adaptador ───────────────────────────────────────────────────────

export default function DashboardPage() {
  /**
   * useMemo estabiliza la referencia al servicio entre renders.
   * Sin esto, dashboardServiceMock sería un objeto "nuevo" en cada render,
   * disparando el useEffect del ViewModel en bucle infinito.
   * Cuando se use un singleton real (API), esto ya no será necesario.
   */
  const service = useMemo(() => dashboardServiceMock, []);

  // ② Delega toda la lógica de presentación al ViewModel
  const { resumen, isLoading, error } = useDashboardViewModel(service);

  // ③ Entrega el estado derivado a la Vista. Nada más.
  return (
    <DashboardView
      resumen={resumen}
      isLoading={isLoading}
      error={error}
    />
  );
}
