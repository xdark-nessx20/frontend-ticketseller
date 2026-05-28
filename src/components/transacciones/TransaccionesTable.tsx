import { useState } from 'react';
import type { VentaResumenResponse } from '../../types/transacciones.types';
import type { EstadoVenta } from '../../types/checkout.types';
import { CambiarEstadoVentaModal } from './CambiarEstadoVentaModal';
import { HistorialVentaPanel } from './HistorialVentaPanel';
import { useTransaccionesStore } from '../../stores/transaccionesStore';

const ESTADO_BADGE: Record<EstadoVenta, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-700',
  RESERVADA: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-green-100 text-green-700',
  EXPIRADA: 'bg-orange-100 text-orange-700',
  FALLIDA: 'bg-red-100 text-red-700',
  REEMBOLSADA: 'bg-purple-100 text-purple-700',
};

interface TransaccionesTableProps {
  ventas: VentaResumenResponse[];
  isLoading: boolean;
  error: unknown;
}

export function TransaccionesTable({ ventas, isLoading, error }: TransaccionesTableProps) {
  const [cambiandoEstado, setCambiandoEstado] = useState<VentaResumenResponse | null>(null);
  const [viendoHistorial, setViendoHistorial] = useState<string | null>(null);
  const { filtros, setPage } = useTransaccionesStore();

  const page = filtros.page ?? 0;
  const size = filtros.size ?? 20;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">Error al cargar las transacciones. Intenta de nuevo.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              {['ID', 'Comprador', 'Evento', 'Estado', 'Total', 'Fecha', 'Acciones'].map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 last:text-right"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {ventas.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay transacciones que coincidan con los filtros.
                </td>
              </tr>
            )}
            {ventas.map(venta => (
              <tr key={venta.id} className="bg-[#F6F3EA] hover:bg-[#EDE9D8]">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{venta.id.slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{venta.compradorId.slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{venta.eventoId.slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_BADGE[venta.estado] ?? 'bg-gray-100 text-gray-700'}`}>
                    {venta.estado}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ${venta.total.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(venta.fechaCreacion).toLocaleDateString('es-CO')}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setViendoHistorial(venta.id)}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Ver historial
                    </button>
                    <button
                      onClick={() => setCambiandoEstado(venta)}
                      className="rounded-md bg-[#413383] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#362B6E]"
                    >
                      Cambiar estado
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-gray-500">
          Página {page + 1} · {ventas.length} resultado{ventas.length !== 1 ? 's' : ''}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <button
            disabled={ventas.length < size}
            onClick={() => setPage(page + 1)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      </div>

      {cambiandoEstado && (
        <CambiarEstadoVentaModal
          ventaId={cambiandoEstado.id}
          estadoActual={cambiandoEstado.estado}
          onClose={() => setCambiandoEstado(null)}
        />
      )}

      {viendoHistorial && (
        <HistorialVentaPanel
          ventaId={viendoHistorial}
          onClose={() => setViendoHistorial(null)}
        />
      )}
    </>
  );
}
