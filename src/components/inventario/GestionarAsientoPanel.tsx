import { useState } from 'react';
import { useOcuparAsiento } from '../../hooks/inventario/useOcuparAsiento';
import { useLiberarAsiento } from '../../hooks/inventario/useLiberarAsiento';
import type { AsientoInventarioResponse } from '../../types/inventario.types';

interface GestionarAsientoPanelProps {
  eventoId: string;
  asiento: AsientoInventarioResponse | null;
}

type Accion = 'ocupar' | 'liberar' | null;

export function GestionarAsientoPanel({ eventoId, asiento }: GestionarAsientoPanelProps) {
  const [ultimaAccion, setUltimaAccion] = useState<Accion>(null);

  const ocupar = useOcuparAsiento(eventoId);
  const liberar = useLiberarAsiento(eventoId);

  const isPending = ocupar.isPending || liberar.isPending;

  function handleOcupar() {
    if (!asiento) return;
    setUltimaAccion('ocupar');
    ocupar.reset();
    liberar.reset();
    ocupar.mutate(asiento.asientoId);
  }

  function handleLiberar() {
    if (!asiento) return;
    setUltimaAccion('liberar');
    ocupar.reset();
    liberar.reset();
    liberar.mutate(asiento.asientoId);
  }

  const isSuccess = ultimaAccion === 'ocupar' ? ocupar.isSuccess : liberar.isSuccess;
  const isError = ultimaAccion === 'ocupar' ? ocupar.isError : liberar.isError;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">Gestionar asiento</h2>

      {!asiento ? (
        <p className="text-sm text-gray-400">Selecciona un asiento en el mapa.</p>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            Asiento <span className="font-medium text-gray-800">{asiento.numeroAsiento}</span>
            {' — '}
            <span className="text-gray-500">{asiento.estado}</span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOcupar}
              disabled={isPending}
              className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {ocupar.isPending ? 'Ocupando…' : 'Ocupar'}
            </button>
            <button
              type="button"
              onClick={handleLiberar}
              disabled={isPending}
              className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {liberar.isPending ? 'Liberando…' : 'Liberar'}
            </button>
          </div>

          {isSuccess && (
            <p className="text-sm text-emerald-600">
              Asiento {ultimaAccion === 'ocupar' ? 'ocupado' : 'liberado'} correctamente.
            </p>
          )}

          {isError && (
            <p className="text-sm text-red-500">
              No se pudo {ultimaAccion === 'ocupar' ? 'ocupar' : 'liberar'} el asiento.
            </p>
          )}
        </>
      )}
    </div>
  );
}
