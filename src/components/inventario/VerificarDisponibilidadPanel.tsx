import { useState } from 'react';
import { useVerificarDisponibilidad } from '../../hooks/inventario/useVerificarDisponibilidad';

interface VerificarDisponibilidadPanelProps {
  eventoId: string;
}

export function VerificarDisponibilidadPanel({ eventoId }: VerificarDisponibilidadPanelProps) {
  const [asientoId, setAsientoId] = useState('');
  const [activeId, setActiveId] = useState('');

  const { data, isFetching, isError, refetch } = useVerificarDisponibilidad(eventoId, activeId);

  function handleVerificar() {
    const trimmed = asientoId.trim();
    if (!trimmed) return;
    if (trimmed === activeId) {
      refetch();
    } else {
      setActiveId(trimmed);
    }
  }

  const esDisponible = data?.estado === 'DISPONIBLE';

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">Verificar disponibilidad</h2>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ID de asiento"
          value={asientoId}
          onChange={e => setAsientoId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerificar()}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        />
        <button
          type="button"
          onClick={handleVerificar}
          disabled={isFetching || !asientoId.trim()}
          className="mt-1 rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
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
    </div>
  );
}
