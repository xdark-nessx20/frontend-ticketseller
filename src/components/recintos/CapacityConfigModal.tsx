import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConfigurarCapacidad } from '../../hooks/recintos/useConfigurarCapacidad';

const schema = z.object({
  capacidadMaxima: z.number().int().min(1, 'La capacidad mínima es 1'),
});

type FormValues = z.infer<typeof schema>;

interface CapacityConfigModalProps {
  recintoId: string;
  capacidadActual: number;
  onClose: () => void;
}

export function CapacityConfigModal({ recintoId, capacidadActual, onClose }: CapacityConfigModalProps) {
  const { mutate, isPending, error } = useConfigurarCapacidad(recintoId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { capacidadMaxima: capacidadActual },
  });

  function onSubmit(data: FormValues) {
    mutate(data, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Configurar capacidad</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacidad máxima</label>
            <input
              type="number"
              {...register('capacidadMaxima', { valueAsNumber: true })}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            {errors.capacidadMaxima && (
              <p className="mt-1 text-xs text-red-600">{errors.capacidadMaxima.message}</p>
            )}
          </div>
          {error && <p className="text-xs text-red-600">Error al actualizar la capacidad.</p>}
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
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
