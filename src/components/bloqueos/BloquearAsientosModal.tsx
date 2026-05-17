import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useBloquearAsientos } from '../../hooks/bloqueos/useBloquearAsientos';

const schema = z.object({
  destinatario: z.string().min(1, 'El destinatario es obligatorio'),
  fechaExpiracion: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface BloquearAsientosModalProps {
  eventoId: string;
  asientoIds: string[];
  onClose: () => void;
}

export function BloquearAsientosModal({ eventoId, asientoIds, onClose }: BloquearAsientosModalProps) {
  const { mutate, isPending, error } = useBloquearAsientos(eventoId);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    mutate(
      {
        asientoIds,
        destinatario: data.destinatario,
        fechaExpiracion: data.fechaExpiracion || undefined,
      },
      { onSuccess: onClose },
    );
  }

  const error409 =
    axios.isAxiosError(error) && error.response?.status === 409
      ? (error.response.data?.message ?? 'Uno o más asientos ya están bloqueados u ocupados.')
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Bloquear asientos</h2>

        <div className="mt-3">
          <p className="text-sm text-gray-600">
            {asientoIds.length === 1
              ? '1 asiento seleccionado'
              : `${asientoIds.length} asientos seleccionados`}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {asientoIds.map(id => (
              <span key={id} className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700">
                {id}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinatario</label>
            <input
              {...register('destinatario')}
              type="text"
              placeholder="Nombre del patrocinador o destinatario"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.destinatario && (
              <p className="mt-1 text-xs text-red-600">{errors.destinatario.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de expiración <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              {...register('fechaExpiracion')}
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
          </div>

          {error409 && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error409}</p>
          )}
          {error && !error409 && (
            <p className="text-sm text-red-600">Error al bloquear los asientos. Intenta de nuevo.</p>
          )}

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
              {isPending ? 'Bloqueando…' : 'Confirmar bloqueo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
