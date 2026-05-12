import type { TicketResponse } from '../../types/checkout.types';

interface TicketConfirmadoProps {
  ticket: TicketResponse;
  zonaName?: string;
}

export function TicketConfirmado({ ticket, zonaName }: TicketConfirmadoProps) {
  return (
    <div className="rounded-lg border border-green-200 bg-white p-4">
      <div className="flex gap-4">
        <div className="flex-1 space-y-1">
          <p className="font-medium text-gray-800">{zonaName ?? ticket.zonaId}</p>
          <p className="font-mono text-xs text-gray-400">ID: {ticket.id}</p>
          <p className="text-sm text-gray-600">
            Precio: ${ticket.precio.toLocaleString('es-CO')}
          </p>
          {ticket.esCortesia && (
            <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
              Cortesía
            </span>
          )}
        </div>
        {ticket.codigoQR && (
          <img
            src={`data:image/png;base64,${ticket.codigoQR}`}
            alt="Código QR del ticket"
            className="h-24 w-24 rounded-md border border-gray-200 object-contain"
          />
        )}
      </div>
    </div>
  );
}
