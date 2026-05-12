import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  ciudad: z.string().min(1, 'Requerido'),
  direccion: z.string().min(1, 'Requerido'),
  capacidadMaxima: z.number().int().min(1, 'Mínimo 1'),
  telefono: z.string().min(8, 'Requerido'),
  compuertasIngreso: z.number().int().min(1, 'Mínimo 1'),
});

export type VenueFormValues = z.infer<typeof schema>;

interface VenueFormProps {
  defaultValues?: Partial<VenueFormValues>;
  onSubmit: (data: VenueFormValues) => void;
  isPending: boolean;
  mode?: 'create' | 'edit';
}

export function VenueForm({ defaultValues, onSubmit, isPending, mode = 'create' }: VenueFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VenueFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nombre</label>
        <input
          {...register('nombre')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.nombre && <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Ciudad</label>
        <input
          {...register('ciudad')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.ciudad && <p className="mt-1 text-xs text-red-600">{errors.ciudad.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Dirección</label>
        <input
          {...register('direccion')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.direccion && <p className="mt-1 text-xs text-red-600">{errors.direccion.message}</p>}
      </div>

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

      <div>
        <label className="block text-sm font-medium text-gray-700">Teléfono</label>
        <input
          {...register('telefono')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.telefono && <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Compuertas de ingreso</label>
        <input
          type="number"
          {...register('compuertasIngreso', { valueAsNumber: true })}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        {errors.compuertasIngreso && (
          <p className="mt-1 text-xs text-red-600">{errors.compuertasIngreso.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[#413383] px-5 py-2 text-sm font-medium text-white hover:bg-[#413383]/80 disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : mode === 'create' ? 'Crear recinto' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  );
}
