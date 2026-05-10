import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { EventoResponse } from '../../types/evento.types';
import { useCancelarEvento } from '../../hooks/eventos/useCancelarEvento';

const schema = z.object({
  motivo: z.string().min(1, 'El motivo de cancelación es obligatorio'),
});

type FormValues = z.infer<typeof schema>;

interface CancelarEventoModalProps {
  evento: EventoResponse;
  onClose: () => void;
}

export function CancelarEventoModal({ evento, onClose }: CancelarEventoModalProps) {
  const { mutate, isPending, error } = useCancelarEvento(evento.id);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormValues) {
    mutate({ motivo: data.motivo }, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Cancelar evento</h2>
        <p className="mt-1 text-sm text-gray-600">
          Evento: <span className="font-medium text-gray-900">{evento.nombre}</span>
        </p>
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Esta acción es irreversible. El evento quedará cancelado y no podrá reactivarse.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Motivo de cancelación</label>
            <textarea
              {...register('motivo')}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              placeholder="Indique el motivo…"
            />
            {errors.motivo && (
              <p className="mt-1 text-xs text-red-600">{errors.motivo.message}</p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600">Error al cancelar el evento. Intente de nuevo.</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Volver
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? 'Cancelando…' : 'Confirmar cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
