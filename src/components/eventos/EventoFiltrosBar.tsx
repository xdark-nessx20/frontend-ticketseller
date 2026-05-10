import type { EstadoEvento } from '../../types/evento.types';
import { useEventosStore } from '../../stores/eventosStore';

const ESTADOS: EstadoEvento[] = ['ACTIVO', 'EN_PROGRESO', 'FINALIZADO', 'CANCELADO'];

const ESTADO_LABELS: Record<EstadoEvento, string> = {
  ACTIVO: 'Activo',
  EN_PROGRESO: 'En progreso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

interface EventoFiltrosBarProps {
  onNuevoEvento: () => void;
}

export function EventoFiltrosBar({ onNuevoEvento }: EventoFiltrosBarProps) {
  const { filtros, setFiltroEstado, resetFiltros } = useEventosStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filtros.estado ?? ''}
        onChange={e =>
          setFiltroEstado((e.target.value || undefined) as EstadoEvento | undefined)
        }
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">Todos los estados</option>
        {ESTADOS.map(e => (
          <option key={e} value={e}>
            {ESTADO_LABELS[e]}
          </option>
        ))}
      </select>

      <button
        onClick={resetFiltros}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        Limpiar filtros
      </button>

      <div className="ml-auto">
        <button
          onClick={onNuevoEvento}
          className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#413383]/85"
        >
          Nuevo Evento
        </button>
      </div>
    </div>
  );
}
