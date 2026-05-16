import type { TicketResponse } from '../../types/checkout.types';

interface TicketConfirmadoProps {
  ticket: TicketResponse;
  eventoNombre?: string;
}

export function TicketConfirmado({ ticket, eventoNombre }: TicketConfirmadoProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <p className="font-semibold text-gray-900">{eventoNombre ?? '—'}</p>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>Zona: {ticket.zonaNombre}</span>
            <span>Compuerta: {ticket.compuertaNombre}</span>
            {ticket.numeroAsiento && <span>Asiento: {ticket.numeroAsiento}</span>}
          </div>
          {ticket.esCortesia && (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              Cortesía
            </span>
          )}
          <div className="pt-2">
            <p className="font-mono text-xs text-gray-400">ID: {ticket.id}</p>
            <p className="text-xl font-semibold text-[#413383] pt-3">${ticket.precio.toLocaleString('es-CO')}</p>
          </div>
        </div>
        {ticket.codigoQr && (
          <div className="flex flex-col items-center gap-1">
            <img
              src={`data:image/png;base64,${ticket.codigoQr}`}
              alt="Código QR del ticket"
              className="h-28 w-28 rounded-md border border-gray-200 object-contain"
            />
            <span className="text-xs text-gray-400">Escanear en entrada</span>
          </div>
        )}
      </div>
    </div>
  );
}
