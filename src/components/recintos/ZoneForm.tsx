import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { TipoZona } from '../../types/recinto.types';

const TIPOS_ZONA: TipoZona[] = ['GENERAL', 'VIP', 'PLATEA', 'PALCO'];

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  tipo: z.enum(['GENERAL', 'VIP', 'PLATEA', 'PALCO']),
  capacidad: z.number().int().min(1, 'Mínimo 1'),
});

export type ZoneFormValues = z.infer<typeof schema>;

interface ZoneFormProps {
  onSubmit: (data: ZoneFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
}

export function ZoneForm({ onSubmit, isPending, onCancel }: ZoneFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ZoneFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'GENERAL' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          {...register('nombre')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tipo</label>
        <select
          {...register('tipo')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {TIPOS_ZONA.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Capacidad</label>
        <input
          type="number"
          {...register('capacidad', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.capacidad && <p className="mt-1 text-xs text-red-600">{errors.capacidad.message}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Agregar zona'}
        </button>
      </div>
    </form>
  );
}
