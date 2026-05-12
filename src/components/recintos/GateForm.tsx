import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { ZonaResponse } from '../../types/recinto.types';

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  zonaId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface GateFormProps {
  zonas: ZonaResponse[];
  onSubmit: (data: FormValues) => void;
  isPending: boolean;
  onCancel: () => void;
}

export function GateForm({ zonas, onSubmit, isPending, onCancel }: GateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

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
        <label className="block text-sm font-medium text-gray-700">Zona (opcional — sin zona = General)</label>
        <select
          {...register('zonaId')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">General (sin zona)</option>
          {zonas.map(z => (
            <option key={z.id} value={z.id}>{z.nombre}</option>
          ))}
        </select>
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
          className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#413383]/90 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Agregar compuerta'}
        </button>
      </div>
    </form>
  );
}
