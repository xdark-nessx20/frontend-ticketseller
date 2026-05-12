import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCrearDescuento } from '../../hooks/promociones/useCrearDescuento';
import { useZonas } from '../../hooks/recintos/useZonas';

const schema = z
  .object({
    tipo: z.enum(['PORCENTAJE', 'MONTO_FIJO'] as const, { required_error: 'Requerido' }),
    valor: z.coerce.number().positive('Debe ser un valor positivo'),
    zonaId: z.string().optional(),
    acumulable: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'PORCENTAJE' && data.valor > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'El porcentaje no puede superar 100',
        path: ['valor'],
      });
    }
  });

type FormValues = z.infer<typeof schema>;

interface CrearDescuentoModalProps {
  promocionId: string;
  recintoId: string;
  onClose: () => void;
}

export function CrearDescuentoModal({ promocionId, recintoId, onClose }: CrearDescuentoModalProps) {
  const { mutate, isPending } = useCrearDescuento(promocionId);
  const { data: zonas } = useZonas(recintoId);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const tipo = watch('tipo');

  function onSubmit(data: FormValues) {
    mutate(
      {
        tipo: data.tipo,
        valor: data.valor,
        ...(data.zonaId ? { zonaId: data.zonaId } : {}),
        acumulable: data.acumulable ?? false,
      },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Agregar Descuento</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              {...register('tipo')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Seleccionar…</option>
              <option value="PORCENTAJE">Porcentaje</option>
              <option value="MONTO_FIJO">Monto fijo</option>
            </select>
            {errors.tipo && <p className="mt-1 text-xs text-red-600">{errors.tipo.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valor{tipo === 'PORCENTAJE' ? ' (%)' : tipo === 'MONTO_FIJO' ? ' (COP)' : ''}
            </label>
            <input
              type="number"
              step="any"
              {...register('valor')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.valor && <p className="mt-1 text-xs text-red-600">{errors.valor.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Zona <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <select
              {...register('zonaId')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Todas las zonas</option>
              {(zonas ?? []).map(z => (
                <option key={z.id} value={z.id}>
                  {z.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="acumulable"
              {...register('acumulable')}
              className="rounded border-gray-300"
            />
            <label htmlFor="acumulable" className="text-sm text-gray-700">
              Acumulable con otros descuentos
            </label>
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
              {isPending ? 'Agregando…' : 'Agregar descuento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
