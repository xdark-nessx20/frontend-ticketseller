import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrearMapaAsientos } from '../../hooks/asientos/useCrearMapaAsientos';

const schema = z.object({
  filas: z.number().int().min(1, 'Mínimo 1 fila'),
  columnasPorFila: z.number().int().min(1, 'Mínimo 1 columna'),
});

type FormValues = z.infer<typeof schema>;

interface CrearMapaModalProps {
  recintoId: string;
  onClose: () => void;
}

export function CrearMapaModal({ recintoId, onClose }: CrearMapaModalProps) {
  const { mutate, isPending } = useCrearMapaAsientos(recintoId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { filas: 10, columnasPorFila: 20 },
  });

  const [filas, columnasPorFila] = watch(['filas', 'columnasPorFila']);
  const totalCeldas = (filas || 0) * (columnasPorFila || 0);

  function onSubmit(data: FormValues) {
    mutate(data, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Crear mapa de asientos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Define la cuadrícula base. Luego podrás marcar espacios vacíos celda a celda.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Filas</label>
              <input
                type="number"
                {...register('filas', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.filas && (
                <p className="mt-1 text-xs text-red-600">{errors.filas.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Columnas</label>
              <input
                type="number"
                {...register('columnasPorFila', { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.columnasPorFila && (
                <p className="mt-1 text-xs text-red-600">{errors.columnasPorFila.message}</p>
              )}
            </div>
          </div>

          {totalCeldas > 0 && (
            <p className="text-sm text-gray-500">
              Se generarán <span className="font-semibold text-gray-800">{totalCeldas.toLocaleString()}</span> celdas ({filas} × {columnasPorFila}).
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
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
              {isPending ? 'Generando…' : 'Crear mapa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
