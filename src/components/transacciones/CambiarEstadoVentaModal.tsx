import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCambiarEstadoVenta } from '../../hooks/transacciones/useCambiarEstadoVenta';
import type { EstadoVenta } from '../../types/checkout.types';

const ESTADOS: { value: EstadoVenta; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'RESERVADA', label: 'Reservada' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'EXPIRADA', label: 'Expirada' },
  { value: 'FALLIDA', label: 'Fallida' },
  { value: 'REEMBOLSADA', label: 'Reembolsada' },
];

const schema = z.object({
  nuevoEstado: z.string().min(1, 'Seleccione un estado destino'),
  justificacion: z.string().min(1, 'La justificación es obligatoria'),
});

type FormValues = z.infer<typeof schema>;

interface CambiarEstadoVentaModalProps {
  ventaId: string;
  estadoActual: EstadoVenta;
  onClose: () => void;
}

export function CambiarEstadoVentaModal({ ventaId, estadoActual, onClose }: CambiarEstadoVentaModalProps) {
  const { mutate, isPending } = useCambiarEstadoVenta(ventaId);
  const [backendError, setBackendError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    setBackendError(null);
    mutate(
      { nuevoEstado: data.nuevoEstado as EstadoVenta, justificacion: data.justificacion },
      {
        onSuccess: onClose,
        onError: (err: unknown) => {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
          setBackendError(msg ?? 'Transición de estado inválida o no permitida.');
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Cambiar estado de venta</h2>
        <p className="mt-1 text-sm text-gray-500">
          Estado actual:{' '}
          <span className="font-medium text-gray-700">{estadoActual}</span>
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado destino</label>
            <select
              {...register('nuevoEstado')}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            >
              <option value="">Seleccione…</option>
              {ESTADOS.filter(o => o.value !== estadoActual).map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            {errors.nuevoEstado && (
              <p className="mt-1 text-xs text-red-600">{errors.nuevoEstado.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Justificación</label>
            <textarea
              {...register('justificacion')}
              rows={3}
              placeholder="Explique el motivo del cambio…"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.justificacion && (
              <p className="mt-1 text-xs text-red-600">{errors.justificacion.message}</p>
            )}
          </div>

          {backendError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{backendError}</p>
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
              {isPending ? 'Guardando…' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
