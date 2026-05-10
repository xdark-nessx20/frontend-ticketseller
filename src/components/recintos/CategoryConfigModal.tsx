import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useConfigurarCategoria } from '../../hooks/recintos/useConfigurarCategoria';
import type { CategoriaRecinto } from '../../types/recinto.types';

const CATEGORIAS: CategoriaRecinto[] = [
  'ESTADIO',
  'TEATRO',
  'AUDITORIO',
  'SALA_CONCIERTOS',
  'CENTRO_CONGRESOS',
  'OTRO',
];

const schema = z.object({
  categoria: z.enum(['ESTADIO', 'TEATRO', 'AUDITORIO', 'SALA_CONCIERTOS', 'CENTRO_CONGRESOS', 'OTRO']),
});

type FormValues = z.infer<typeof schema>;

interface CategoryConfigModalProps {
  recintoId: string;
  categoriaActual: CategoriaRecinto | null;
  onClose: () => void;
}

export function CategoryConfigModal({ recintoId, categoriaActual, onClose }: CategoryConfigModalProps) {
  const { mutate, isPending, error } = useConfigurarCategoria(recintoId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { categoria: categoriaActual ?? 'OTRO' },
  });

  function onSubmit(data: FormValues) {
    mutate(data, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Categorizar recinto</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <select
              {...register('categoria')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {CATEGORIAS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.categoria && (
              <p className="mt-1 text-xs text-red-600">{errors.categoria.message}</p>
            )}
          </div>
          {error && <p className="text-xs text-red-600">Error al actualizar la categoría.</p>}
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
