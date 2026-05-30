import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useProcesarReembolsoManual } from '../../hooks/postventa/useProcesarReembolsoManual';

const schema = z
  .object({
    tipo: z.enum(['TOTAL', 'PARCIAL']),
    monto: z
      .number({ error: 'Ingrese un número válido' })
      .min(0.01, 'El monto debe ser mayor a cero')
      .optional(),
  })
  .refine(d => d.tipo === 'TOTAL' || (d.monto !== undefined && d.monto >= 0.01), {
    message: 'El monto es requerido para reembolso parcial',
    path: ['monto'],
  });

type FormValues = z.infer<typeof schema>;

interface ReembolsoManualModalProps {
  ticketId: string;
  montoTotal: number;
  onClose: () => void;
}

export function ReembolsoManualModal({ ticketId, montoTotal, onClose }: ReembolsoManualModalProps) {
  const { mutate, isPending } = useProcesarReembolsoManual(ticketId);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'TOTAL' },
  });

  const tipo = watch('tipo');

  function onSubmit(data: FormValues) {
    mutate(
      { tipo: data.tipo, monto: data.tipo === 'PARCIAL' ? (data.monto ?? null) : null },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Procesar reembolso</h2>
        <p className="mt-1 text-sm text-gray-500">
          Monto del ticket:{' '}
          <span className="font-medium text-gray-700">${montoTotal.toLocaleString('es-CO')}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tipo de reembolso</label>
            <div className="mt-2 space-y-2">
              {(['TOTAL', 'PARCIAL'] as const).map(t => (
                <label key={t} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value={t}
                    {...register('tipo')}
                    className="accent-[#413383]"
                  />
                  <span className="text-sm text-gray-700">
                    {t === 'TOTAL' ? 'Reembolso total' : 'Reembolso parcial'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {tipo === 'PARCIAL' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Monto a reembolsar</label>
              <input
                type="number"
                step="0.01"
                {...register('monto', { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
              {errors.monto && (
                <p className="mt-1 text-xs text-red-600">{errors.monto.message}</p>
              )}
            </div>
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
              {isPending ? 'Procesando…' : 'Confirmar reembolso'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
