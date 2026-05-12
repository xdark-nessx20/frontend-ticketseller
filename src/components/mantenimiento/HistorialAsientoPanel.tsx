import { useHistorialAsiento } from '../../hooks/mantenimiento/useHistorialAsiento';
import { AsientoEstadoBadge } from './AsientoEstadoBadge';

interface HistorialAsientoPanelProps {
  eventoId: string;
  asientoId: string;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function HistorialAsientoPanel({ eventoId, asientoId }: HistorialAsientoPanelProps) {
  const { data: historial, isLoading } = useHistorialAsiento(eventoId, asientoId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!historial || historial.length === 0) {
    return <p className="text-xs text-gray-400">Sin historial de cambios.</p>;
  }

  return (
    <ul className="max-h-48 space-y-2 overflow-y-auto">
      {historial.map((entry, i) => (
        <li key={i} className="rounded-md border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <AsientoEstadoBadge estado={entry.estadoAnterior} />
            <span className="text-xs text-gray-400">→</span>
            <AsientoEstadoBadge estado={entry.estadoNuevo} />
          </div>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-xs text-gray-500">{entry.usuario}</span>
            <span className="text-xs text-gray-400">{formatFecha(entry.fechaHora)}</span>
          </div>
          {entry.motivo && (
            <p className="mt-0.5 text-xs italic text-gray-500">"{entry.motivo}"</p>
          )}
        </li>
      ))}
    </ul>
  );
}
