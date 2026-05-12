import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useCambiarEstadoAsiento } from '../../hooks/mantenimiento/useCambiarEstadoAsiento';
import { AsientoEstadoBadge } from './AsientoEstadoBadge';
import { HistorialAsientoPanel } from './HistorialAsientoPanel';
import type { AsientoConEstadoResponse, EstadoAsiento } from '../../types/mantenimiento.types';
import { TRANSICIONES_VALIDAS } from '../../types/mantenimiento.types';

const ESTADO_LABELS: Record<EstadoAsiento, string> = {
  DISPONIBLE: 'Disponible',
  BLOQUEADO: 'Bloqueado',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  MANTENIMIENTO: 'Mantenimiento',
  ANULADO: 'Anulado',
  INACTIVO: 'Inactivo',
};

const schema = z.object({
  estadoDestino: z.string().min(1, 'Seleccione un estado destino'),
  motivo: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CambiarEstadoModalProps {
  eventoId: string;
  asiento: AsientoConEstadoResponse;
  onClose: () => void;
}

export function CambiarEstadoModal({ eventoId, asiento, onClose }: CambiarEstadoModalProps) {
  const [showHistorial, setShowHistorial] = useState(false);
  const { mutate, isPending, error } = useCambiarEstadoAsiento(eventoId, asiento.id);

  const transicionesDisponibles = TRANSICIONES_VALIDAS[asiento.estado] ?? [];

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    mutate(
      { estadoDestino: data.estadoDestino as EstadoAsiento, motivo: data.motivo || undefined },
      { onSuccess: onClose },
    );
  }

  const mensajeError409 =
    axios.isAxiosError(error) && error.response?.status === 409
      ? (error.response.data?.message ?? 'Transición de estado no permitida.')
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Cambiar estado del asiento</h2>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Asiento {asiento.numero}</span>
          <AsientoEstadoBadge estado={asiento.estado} />
        </div>

        {transicionesDisponibles.length === 0 ? (
          <p className="mt-4 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Este asiento no tiene transiciones manuales disponibles desde su estado actual.
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado destino</label>
              <select
                {...register('estadoDestino')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              >
                <option value="">Seleccione…</option>
                {transicionesDisponibles.map(e => (
                  <option key={e} value={e}>{ESTADO_LABELS[e]}</option>
                ))}
              </select>
              {errors.estadoDestino && (
                <p className="mt-1 text-xs text-red-600">{errors.estadoDestino.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Motivo (opcional)</label>
              <input
                {...register('motivo')}
                type="text"
                placeholder="Ej. Reparación de butaca…"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
            </div>

            {mensajeError409 && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{mensajeError409}</p>
            )}
            {error && !mensajeError409 && (
              <p className="text-sm text-red-600">Error al cambiar el estado. Intente de nuevo.</p>
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
        )}

        {transicionesDisponibles.length === 0 && (
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        )}

        <div className="mt-4 border-t border-gray-100 pt-3">
          <button
            type="button"
            onClick={() => setShowHistorial(v => !v)}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <span>Historial de cambios</span>
            <span className="text-gray-400">{showHistorial ? '▲' : '▼'}</span>
          </button>
          {showHistorial && (
            <div className="mt-2">
              <HistorialAsientoPanel eventoId={eventoId} asientoId={asiento.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
