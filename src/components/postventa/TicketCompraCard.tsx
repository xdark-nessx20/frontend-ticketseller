import type { EstadoTicket } from '../../types/checkout.types';
import type { TicketConReembolsoResponse } from '../../types/postventa.types';
import { useEstadoReembolso } from '../../hooks/postventa/useEstadoReembolso';
import { usePostventaStore } from '../../stores/postventaStore';
import { ReembolsoBadge } from './ReembolsoBadge';

const TICKET_ESTADO_CONFIG: Record<EstadoTicket, { label: string; className: string }> = {
  VENDIDO: { label: 'Vendido', className: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', className: 'bg-gray-100 text-gray-600' },
  REEMBOLSO_PENDIENTE: { label: 'Cancelado', className: 'bg-yellow-100 text-yellow-800' },
  REEMBOLSADO: { label: 'Reembolsado', className: 'bg-purple-100 text-purple-700' },
  ANULADO: { label: 'Anulado', className: 'bg-red-100 text-red-800' },
};

const ESTADOS_CANCELABLES: EstadoTicket[] = ['VENDIDO'];

interface TicketCompraCardProps {
  ticket: TicketConReembolsoResponse;
}

export function TicketCompraCard({ ticket }: TicketCompraCardProps) {
  const { ticketsSeleccionados, toggleTicket } = usePostventaStore();
  const { tieneReembolso, estadoReembolso, detalleReembolso } = useEstadoReembolso(ticket);

  const esCancelable = ESTADOS_CANCELABLES.includes(ticket.estado as EstadoTicket);
  const estaSeleccionado = ticketsSeleccionados.includes(ticket.id);
  const estadoConfig = TICKET_ESTADO_CONFIG[ticket.estado as EstadoTicket];

  return (
    <div
      className={`flex items-start gap-4 rounded-md border px-4 py-3 transition-colors ${
        estaSeleccionado ? 'border-[#413383] bg-[#f0edf8]' : 'border-gray-200 bg-white'
      }`}
    >
      <input
        type="checkbox"
        checked={estaSeleccionado}
        onChange={() => toggleTicket(ticket.id)}
        disabled={!esCancelable}
        className="mt-0.5 h-4 w-4 accent-[#413383] disabled:cursor-not-allowed disabled:opacity-40"
      />

      <div className="flex flex-1 flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {ticket.zonaNombre} — Asiento {ticket.numeroAsiento}
          </p>
          <p className="text-xs text-gray-500">
            ${ticket.precio.toLocaleString('es-CO')}
            {ticket.esCortesia && ' · Cortesía'}
          </p>
          {tieneReembolso && detalleReembolso && (
            <p className="mt-1 text-xs text-gray-500">
              Reembolso: ${detalleReembolso.monto.toLocaleString('es-CO')}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {estadoConfig && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${estadoConfig.className}`}>
              {estadoConfig.label}
            </span>
          )}
          {estadoReembolso && <ReembolsoBadge estado={estadoReembolso} />}
        </div>
      </div>
    </div>
  );
}
