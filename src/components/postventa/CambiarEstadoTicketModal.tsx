import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCambiarEstadoTicketAdmin } from '../../hooks/postventa/useCambiarEstadoTicketAdmin';
import type { EstadoTicket } from '../../types/checkout.types';

const ESTADO_OPCIONES: { value: EstadoTicket; label: string }[] = [
  { value: 'VENDIDO', label: 'Vendido' },
  { value: 'CANCELADO', label: 'Cancelado' },
  { value: 'REEMBOLSO_PENDIENTE', label: 'Reembolso pendiente' },
  { value: 'REEMBOLSADO', label: 'Reembolsado' },
  { value: 'ANULADO', label: 'Anulado' },
];

const schema = z.object({
  estado: z.string().min(1, 'Seleccione un estado destino'),
  justificacion: z.string().min(1, 'La justificación es obligatoria'),
});

type FormValues = z.infer<typeof schema>;

interface CambiarEstadoTicketModalProps {
  ticketId: string;
  estadoActual: string;
  onClose: () => void;
}

export function CambiarEstadoTicketModal({ ticketId, estadoActual, onClose }: CambiarEstadoTicketModalProps) {
  const { mutate, isPending } = useCambiarEstadoTicketAdmin(ticketId);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    mutate(data, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Cambiar estado del ticket</h2>
        <p className="mt-1 text-sm text-gray-500">
          Estado actual:{' '}
          <span className="font-medium text-gray-700">{estadoActual}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado destino</label>
            <select
              {...register('estado')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Seleccione…</option>
              {ESTADO_OPCIONES.filter(o => o.value !== estadoActual).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.estado && (
              <p className="mt-1 text-xs text-red-600">{errors.estado.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Justificación</label>
            <textarea
              {...register('justificacion')}
              rows={3}
              placeholder="Explique el motivo del cambio de estado…"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.justificacion && (
              <p className="mt-1 text-xs text-red-600">{errors.justificacion.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isPending ? 'Guardando…' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
