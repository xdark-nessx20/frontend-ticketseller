import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrearCodigos } from '../../hooks/promociones/useCrearCodigos';

const schema = z.object({
  cantidad: z.coerce.number().int().positive('Debe ser un número positivo'),
  prefijo: z.string().optional(),
  usosMaximosPorCodigo: z.coerce.number().int().positive('Debe ser positivo').optional().or(z.literal('')),
  fechaFin: z.string().min(1, 'Requerido'),
});

type FormValues = z.infer<typeof schema>;

interface GenerarCodigosModalProps {
  promocionId: string;
  onClose: () => void;
}

export function GenerarCodigosModal({ promocionId, onClose }: GenerarCodigosModalProps) {
  const { mutate, isPending } = useCrearCodigos(promocionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(data: FormValues) {
    mutate(
      {
        cantidad: data.cantidad,
        ...(data.prefijo ? { prefijo: data.prefijo } : {}),
        ...(data.usosMaximosPorCodigo ? { usosMaximosPorCodigo: Number(data.usosMaximosPorCodigo) } : {}),
        fechaFin: data.fechaFin + ':00',
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Generar Códigos Promocionales</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Cantidad</label>
            <input
              type="number"
              {...register('cantidad')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.cantidad && <p className="mt-1 text-xs text-red-600">{errors.cantidad.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Prefijo <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <input
              {...register('prefijo')}
              placeholder="Ej. INFLUENCER"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Usos máximos por código{' '}
              <span className="font-normal text-gray-400">(vacío = sin límite)</span>
            </label>
            <input
              type="number"
              {...register('usosMaximosPorCodigo')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.usosMaximosPorCodigo && (
              <p className="mt-1 text-xs text-red-600">{errors.usosMaximosPorCodigo.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de vencimiento</label>
            <input
              type="datetime-local"
              {...register('fechaFin')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.fechaFin && <p className="mt-1 text-xs text-red-600">{errors.fechaFin.message}</p>}
          </div>

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
              {isPending ? 'Generando…' : 'Generar códigos'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
