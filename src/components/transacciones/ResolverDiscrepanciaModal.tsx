import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useResolverDiscrepancia } from '../../hooks/transacciones/useResolverDiscrepancia';
import type { PagoResponse } from '../../types/transacciones.types';

const AGENTE_ID_PLACEHOLDER = '00000000-0000-0000-0000-000000000001';

const schema = z.object({
  accion: z.enum(['CONFIRMAR', 'RECHAZAR']),
  justificacion: z.string().min(1, 'La justificación es obligatoria'),
});

type FormValues = z.infer<typeof schema>;

interface ResolverDiscrepanciaModalProps {
  pago: PagoResponse;
  onClose: () => void;
}

export function ResolverDiscrepanciaModal({ pago, onClose }: ResolverDiscrepanciaModalProps) {
  const { mutate, isPending } = useResolverDiscrepancia(pago.id);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { accion: 'CONFIRMAR' },
  });

  const accion = watch('accion');

  function onSubmit(data: FormValues) {
    mutate(
      { confirmar: data.accion === 'CONFIRMAR', justificacion: data.justificacion, agenteId: AGENTE_ID_PLACEHOLDER },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Resolver discrepancia</h2>

        <div className="mt-3 rounded-md bg-gray-50 p-3 text-xs text-gray-600 space-y-1">
          <p><span className="font-medium">Venta:</span> <span className="font-mono">{pago.ventaId.slice(0, 8)}…</span></p>
          <p><span className="font-medium">Pasarela ID:</span> {pago.idExternoPasarela ?? '—'}</p>
          <p><span className="font-medium">Monto esperado:</span> ${pago.montoEsperado.toLocaleString('es-CO')}</p>
          <p><span className="font-medium">Monto pasarela:</span> ${pago.montoPasarela.toLocaleString('es-CO')}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Resolución</label>
            <div className="mt-2 space-y-2">
              {(['CONFIRMAR', 'RECHAZAR'] as const).map(val => (
                <label key={val} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    value={val}
                    {...register('accion')}
                    className="accent-[#413383]"
                  />
                  <span className="text-sm text-gray-700">
                    {val === 'CONFIRMAR' ? 'Confirmar pago' : 'Rechazar pago'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Justificación</label>
            <textarea
              {...register('justificacion')}
              rows={3}
              placeholder="Explique el motivo de la resolución…"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.justificacion && (
              <p className="mt-1 text-xs text-red-600">{errors.justificacion.message}</p>
            )}
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
              className={`rounded-md px-4 py-2 text-sm font-medium text-white disabled:opacity-50 ${accion === 'CONFIRMAR' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
            >
              {isPending ? 'Procesando…' : accion === 'CONFIRMAR' ? 'Confirmar pago' : 'Rechazar pago'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
