import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { useAsientosEvento } from '../../hooks/mantenimiento/useAsientosEvento';
import { useBloquearAsientos } from '../../hooks/bloqueos/useBloquearAsientos';
import type { AsientoConEstadoResponse } from '../../types/mantenimiento.types';

const schema = z.object({
  destinatario: z.string().min(1, 'El destinatario es obligatorio'),
  fechaExpiracion: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  eventoId: string;
  onClose: () => void;
}

export function BloquearAsientosConSelectorModal({ eventoId, onClose }: Props) {
  const { data: asientos, isLoading } = useAsientosEvento(eventoId);
  const { mutate, isPending, error } = useBloquearAsientos(eventoId);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const disponibles = useMemo(
    () => asientos?.filter(a => a.estado === 'DISPONIBLE') ?? [],
    [asientos],
  );

  const filas = useMemo(() => {
    const mapa = new Map<string | number, AsientoConEstadoResponse[]>();
    for (const a of disponibles) {
      if (!mapa.has(a.fila)) mapa.set(a.fila, []);
      mapa.get(a.fila)!.push(a);
    }
    return Array.from(mapa.entries())
      .sort(([a], [b]) => String(a).localeCompare(String(b), undefined, { numeric: true }))
      .map(([fila, celdas]) => ({ fila, celdas: celdas.sort((x, y) => x.columna - y.columna) }));
  }, [disponibles]);

  function toggleSeat(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  function onSubmit(data: FormValues) {
    mutate(
      {
        asientoIds: Array.from(selectedIds),
        destinatario: data.destinatario,
        fechaExpiracion: data.fechaExpiracion || undefined,
      },
      { onSuccess: onClose },
    );
  }

  const error409 =
    axios.isAxiosError(error) && error.response?.status === 409
      ? (error.response.data?.message ?? 'Uno o más asientos ya están bloqueados u ocupados.')
      : null;

  const selectedNombres = disponibles.filter(a => selectedIds.has(a.id)).map(a => a.numero);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Bloquear asientos</h2>
        <p className="mt-1 text-sm text-gray-500">
          Selecciona uno o más asientos disponibles para bloquear.
        </p>

        {isLoading && (
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-9 animate-pulse rounded bg-gray-100" />
            ))}
          </div>
        )}

        {!isLoading && disponibles.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">No hay asientos disponibles para bloquear.</p>
        )}

        {!isLoading && filas.length > 0 && (
          <div className="mt-4 max-h-52 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
            <div className="space-y-1">
              {filas.map(({ fila, celdas }) => (
                <div key={String(fila)} className="flex items-center gap-1">
                  <span className="w-6 shrink-0 text-right text-[10px] text-gray-400">
                    {String(fila)}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {celdas.map(asiento => (
                      <button
                        key={asiento.id}
                        type="button"
                        title={asiento.numero}
                        onClick={() => toggleSeat(asiento.id)}
                        className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded text-[9px] font-medium transition-colors ${
                          selectedIds.has(asiento.id)
                            ? 'border border-[#413383] bg-[#413383] text-white ring-2 ring-[#413383]/40'
                            : 'border border-emerald-600 bg-emerald-500 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {asiento.numero}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedIds.size > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            {selectedIds.size === 1 ? '1 asiento seleccionado' : `${selectedIds.size} asientos seleccionados`}:{' '}
            {selectedNombres.join(', ')}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Destinatario</label>
            <input
              {...register('destinatario')}
              type="text"
              placeholder="Nombre del patrocinador o destinatario"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            {errors.destinatario && (
              <p className="mt-1 text-xs text-red-600">{errors.destinatario.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha de expiración <span className="text-gray-400">(opcional)</span>
            </label>
            <input
              {...register('fechaExpiracion')}
              type="datetime-local"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
          </div>

          {error409 && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error409}</p>
          )}
          {error && !error409 && (
            <p className="text-sm text-red-600">Error al bloquear los asientos. Intenta de nuevo.</p>
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
              disabled={isPending || selectedIds.size === 0}
              className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isPending
                ? 'Bloqueando…'
                : `Confirmar bloqueo${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
