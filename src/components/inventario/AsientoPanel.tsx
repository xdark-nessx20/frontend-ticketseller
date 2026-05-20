import { useVerificarDisponibilidad } from '../../hooks/inventario/useVerificarDisponibilidad';
import { useOcuparAsiento } from '../../hooks/inventario/useOcuparAsiento';
import { useLiberarAsiento } from '../../hooks/inventario/useLiberarAsiento';
import type { AsientoInventarioResponse } from '../../types/inventario.types';

interface AsientoPanelProps {
  eventoId: string;
  asiento: AsientoInventarioResponse | null;
}

export function AsientoPanel({ eventoId, asiento }: AsientoPanelProps) {
  const { data: disponibilidad, isFetching: isVerificando, refetch } = useVerificarDisponibilidad(
    eventoId,
    asiento?.asientoId ?? '',
  );

  const ocupar = useOcuparAsiento(eventoId);
  const liberar = useLiberarAsiento(eventoId);
  const isPending = ocupar.isPending || liberar.isPending;

  const estadoActual = disponibilidad?.estado ?? asiento?.estado ?? '';
  const esDisponible = estadoActual === 'DISPONIBLE';

  function handleOcupar() {
    if (!asiento) return;
    ocupar.reset();
    liberar.reset();
    ocupar.mutate(asiento.asientoId);
  }

  function handleLiberar() {
    if (!asiento) return;
    ocupar.reset();
    liberar.reset();
    liberar.mutate(asiento.asientoId);
  }

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      {!asiento ? (
        <p className="text-sm text-gray-400">Selecciona un asiento en el mapa.</p>
      ) : (
        <>
          <h2 className="text-base font-semibold text-gray-800">
            Asiento: {asiento.numeroAsiento}
          </h2>

          <div className="flex items-center justify-between">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                esDisponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
              }`}
            >
              {estadoActual}
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isVerificando}
              className="rounded-md bg-[#413383] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isVerificando ? 'Verificando…' : 'Verificar'}
            </button>
          </div>

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
        </>
      )}
    </div>
  );
}
