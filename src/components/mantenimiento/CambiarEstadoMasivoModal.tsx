import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCambiarEstadoMasivo } from '../../hooks/mantenimiento/useCambiarEstadoMasivo';
import { ResultadoMasivoAlert } from './ResultadoMasivoAlert';
import type {
  AsientoConEstadoResponse,
  EstadoAsiento,
  CambiarEstadoMasivoResponse,
} from '../../types/mantenimiento.types';

const ESTADOS_DESTINO_MASIVO: EstadoAsiento[] = ['DISPONIBLE', 'BLOQUEADO', 'RESERVADO', 'MANTENIMIENTO'];

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

interface CambiarEstadoMasivoModalProps {
  eventoId: string;
  asientos: AsientoConEstadoResponse[];
  onClose: () => void;
}

export function CambiarEstadoMasivoModal({ eventoId, asientos, onClose }: CambiarEstadoMasivoModalProps) {
  const [resultado, setResultado] = useState<CambiarEstadoMasivoResponse | null>(null);
  const { mutate, isPending, error } = useCambiarEstadoMasivo(eventoId);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    mutate(
      {
        asientoIds: asientos.map(a => a.id),
        estadoDestino: data.estadoDestino as EstadoAsiento,
        motivo: data.motivo || undefined,
      },
      { onSuccess: setResultado },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Cambio masivo de estado</h2>
        <p className="mt-1 text-sm text-gray-500">
          {asientos.length} asiento{asientos.length !== 1 ? 's' : ''} seleccionado{asientos.length !== 1 ? 's' : ''}
        </p>

        {resultado ? (
          <>
            <ResultadoMasivoAlert resultado={resultado} />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E]"
              >
                Cerrar
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
            <div className="max-h-24 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-xs text-gray-500">{asientos.map(a => a.numero).join(', ')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Estado destino</label>
              <select
                {...register('estadoDestino')}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              >
                <option value="">Seleccione…</option>
                {ESTADOS_DESTINO_MASIVO.map(e => (
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
                placeholder="Ej. Mantenimiento preventivo…"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">Error al procesar el cambio masivo. Intente de nuevo.</p>
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
                {isPending ? 'Procesando…' : 'Confirmar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
