import { useState } from 'react';
import { useReembolsosPendientes } from '../../hooks/postventa/useReembolsosPendientes';
import { useProcesarCola } from '../../hooks/postventa/useProcesarCola';
import { ReembolsoBadge } from '../../components/postventa/ReembolsoBadge';
import { ReembolsoManualModal } from '../../components/postventa/ReembolsoManualModal';
import { CambiarEstadoTicketModal } from '../../components/postventa/CambiarEstadoTicketModal';
import type { ReembolsoAdminResponse } from '../../types/postventa.types';

export function AdminReembolsosPage() {
  const { data: reembolsos, isLoading, error } = useReembolsosPendientes();
  const { mutate: procesarCola, isPending: procesandoCola } = useProcesarCola();
  const [procesando, setProcesando] = useState<ReembolsoAdminResponse | null>(null);
  const [cambiandoEstado, setCambiandoEstado] = useState<ReembolsoAdminResponse | null>(null);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">Reembolsos</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Reembolsos</h1>
        <button
          onClick={() => procesarCola()}
          disabled={procesandoCola}
          className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
        >
          {procesandoCola ? 'Procesando…' : 'Procesar cola'}
        </button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">Error al cargar los reembolsos. Intenta de nuevo.</p>
      )}

      {!isLoading && !error && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Ticket
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Evento
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Fecha solicitud
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-600">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {reembolsos?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No hay reembolsos pendientes.
                  </td>
                </tr>
              )}
              {reembolsos?.map(reembolso => (
                <tr key={reembolso.reembolsoId} className="bg-[#F6F3EA] hover:bg-[#EDE9D8]">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {reembolso.zonaNombre} — {reembolso.numeroAsiento}
                    </p>
                    <p className="font-mono text-xs text-gray-400">{reembolso.ticketId.slice(0, 8)}…</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{reembolso.eventoNombre}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    ${reembolso.monto.toLocaleString('es-CO')}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(reembolso.fechaSolicitud).toLocaleDateString('es-CO')}
                  </td>
                  <td className="px-4 py-3">
                    <ReembolsoBadge estado={reembolso.estado} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setCambiandoEstado(reembolso)}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cambiar estado
                      </button>
                      <button
                        onClick={() => setProcesando(reembolso)}
                        className="rounded-md bg-[#413383] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#362B6E]"
                      >
                        Procesar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {procesando && (
        <ReembolsoManualModal
          ticketId={procesando.ticketId}
          montoTotal={procesando.monto}
          onClose={() => setProcesando(null)}
        />
      )}

      {cambiandoEstado && (
        <CambiarEstadoTicketModal
          ticketId={cambiandoEstado.ticketId}
          estadoActual={cambiandoEstado.estadoTicket}
          onClose={() => setCambiandoEstado(null)}
        />
      )}
    </div>
  );
}
