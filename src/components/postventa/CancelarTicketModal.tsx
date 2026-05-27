import { useState } from 'react';
import axios from 'axios';
import { useCancelarTicket } from '../../hooks/postventa/useCancelarTicket';
import type { TicketConReembolsoResponse } from '../../types/postventa.types';

interface CancelarTicketModalProps {
  tickets: TicketConReembolsoResponse[];
  onClose: () => void;
}

export function CancelarTicketModal({ tickets, onClose }: CancelarTicketModalProps) {
  const { mutate, isPending } = useCancelarTicket();
  const [errorEvento, setErrorEvento] = useState<string | undefined>();

  const total = tickets.reduce((sum, t) => sum + t.precio, 0);

  function handleConfirmar() {
    setErrorEvento(undefined);
    mutate(
      { ticketIds: tickets.map(t => t.id) },
      {
        onSuccess: onClose,
        onError: err => {
          if (axios.isAxiosError(err) && err.response?.status === 422) {
            setErrorEvento('El evento ya ocurrió. Los tickets de eventos pasados no pueden cancelarse.');
          }
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Cancelar tickets</h2>
        <p className="mt-1 text-sm text-gray-500">
          Se iniciará el proceso de reembolso para los siguientes tickets:
        </p>

        <div className="mt-4 space-y-2">
          {tickets.map(ticket => (
            <div key={ticket.id} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-700">
                {ticket.zonaNombre} — Asiento {ticket.numeroAsiento}
              </span>
              <span className="text-sm font-medium text-gray-900">
                ${ticket.precio.toLocaleString('es-CO')}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-md border border-gray-200 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">Total estimado a reembolsar</span>
          <span className="text-base font-bold text-[#413383]">${total.toLocaleString('es-CO')}</span>
        </div>

        {errorEvento && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{errorEvento}</p>
        )}

        <p className="mt-3 text-xs text-gray-400">
          El reembolso quedará pendiente hasta que el equipo de soporte lo procese.
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Volver
          </button>
          <button
            type="button"
            onClick={handleConfirmar}
            disabled={isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Cancelando…' : 'Confirmar cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
}
