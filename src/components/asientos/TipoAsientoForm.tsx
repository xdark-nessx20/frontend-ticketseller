import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
});

export type TipoAsientoFormValues = z.infer<typeof schema>;

interface TipoAsientoFormProps {
  defaultValues?: Partial<TipoAsientoFormValues>;
  onSubmit: (data: TipoAsientoFormValues) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function TipoAsientoForm({ defaultValues, onSubmit, onCancel, isPending }: TipoAsientoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TipoAsientoFormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          {...register('nombre')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
          placeholder="Ej. VIP, Platea, General"
        />
        {errors.nombre && (
          <p className="mt-1 text-xs text-red-600">{errors.nombre.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <input
          {...register('descripcion')}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
          placeholder="Opcional"
        />
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
        >
          {isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
