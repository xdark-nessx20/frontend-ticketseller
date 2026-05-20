import { useVerificarDisponibilidad } from '../../hooks/inventario/useVerificarDisponibilidad';
import type { AsientoInventarioResponse } from '../../types/inventario.types';

interface VerificarDisponibilidadPanelProps {
  eventoId: string;
  asiento: AsientoInventarioResponse | null;
}

export function VerificarDisponibilidadPanel({ eventoId, asiento }: VerificarDisponibilidadPanelProps) {
  const { data, isFetching, isError, refetch } = useVerificarDisponibilidad(
    eventoId,
    asiento?.asientoId ?? '',
  );

  const esDisponible = data?.estado === 'DISPONIBLE';

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">Verificar disponibilidad</h2>

      {!asiento ? (
        <p className="text-sm text-gray-400">Selecciona un asiento en el mapa.</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Asiento <span className="font-medium text-gray-800">{asiento.numeroAsiento}</span>
            </span>
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-md bg-[#413383] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isFetching ? 'Verificando…' : 'Verificar'}
            </button>
          </div>

          {isError && (
            <p className="text-sm text-red-500">
              No se pudo verificar. El asiento puede no existir en este evento.
            </p>
          )}

          {data && (
            <div className="flex items-center gap-3 rounded-md border border-gray-100 bg-gray-50 p-4">
              <span
                className={`inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  esDisponible ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                }`}
              >
                {data.estado}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
