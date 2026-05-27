import { useState } from 'react';
import { useMisCompras } from '../../hooks/postventa/useMisCompras';
import { usePostventaStore } from '../../stores/postventaStore';
import { TicketCompraCard } from '../../components/postventa/TicketCompraCard';
import { CancelarTicketModal } from '../../components/postventa/CancelarTicketModal';
import type { TicketConReembolsoResponse } from '../../types/postventa.types';

export function MisComprasPage() {
  const { data: tickets, isLoading, error } = useMisCompras();
  const { ticketsSeleccionados, limpiarSeleccion } = usePostventaStore();
  const [showCancelar, setShowCancelar] = useState(false);

  const ticketsPorEvento = (tickets ?? []).reduce<Record<string, TicketConReembolsoResponse[]>>(
    (acc, ticket) => {
      if (!acc[ticket.eventoId]) acc[ticket.eventoId] = [];
      acc[ticket.eventoId].push(ticket);
      return acc;
    },
    {},
  );

  const ticketsSeleccionadosData = (tickets ?? []).filter(t =>
    ticketsSeleccionados.includes(t.id),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Mis Compras</h1>

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">No se pudieron cargar tus compras. Intenta de nuevo.</p>
      )}

      {!isLoading && !error && tickets?.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <p className="text-sm text-gray-500">No tienes compras registradas.</p>
        </div>
      )}

      {!isLoading && !error && Object.entries(ticketsPorEvento).map(([eventoId, eventTickets]) => (
        <div key={eventoId} className="rounded-lg border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">
            {eventTickets[0].eventoNombre}
          </h2>
          <div className="space-y-2">
            {eventTickets.map(ticket => (
              <TicketCompraCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        </div>
      ))}

      {ticketsSeleccionados.length > 0 && (
        <div className="fixed bottom-6 right-6 flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <span className="text-sm text-gray-700">
            {ticketsSeleccionados.length} ticket{ticketsSeleccionados.length > 1 ? 's' : ''} seleccionado{ticketsSeleccionados.length > 1 ? 's' : ''}
          </span>
          <button
            onClick={limpiarSeleccion}
            className="text-sm text-gray-400 hover:text-gray-700"
          >
            Limpiar
          </button>
          <button
            onClick={() => setShowCancelar(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Cancelar seleccionados
          </button>
        </div>
      )}

      {showCancelar && (
        <CancelarTicketModal
          tickets={ticketsSeleccionadosData}
          onClose={() => {
            setShowCancelar(false);
            limpiarSeleccion();
          }}
        />
      )}
    </div>
  );
}
