import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEditarBloqueo } from '../../hooks/bloqueos/useEditarBloqueo';
import type { PanelItemResponse } from '../../types/bloqueos.types';

const schema = z.object({
  destinatario: z.string().min(1, 'El destinatario es obligatorio'),
});

type FormValues = z.infer<typeof schema>;

interface EditarBloqueoModalProps {
  eventoId: string;
  item: PanelItemResponse;
  onClose: () => void;
}

export function EditarBloqueoModal({ eventoId, item, onClose }: EditarBloqueoModalProps) {
  const { mutate, isPending, error } = useEditarBloqueo(eventoId, item.id);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { destinatario: item.destinatario },
  });

  function onSubmit(data: FormValues) {
    mutate({ destinatario: data.destinatario }, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Editar bloqueo</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinatario</label>
            <input
              {...register('destinatario')}
              type="text"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.destinatario && (
              <p className="mt-1 text-xs text-red-600">{errors.destinatario.message}</p>
            )}
          </div>

          {error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              Error al actualizar el bloqueo. Intenta de nuevo.
            </p>
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
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
