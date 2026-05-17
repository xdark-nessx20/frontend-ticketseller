import type { PanelFiltros, TipoPanelItem } from '../../types/bloqueos.types';

const TIPOS: { value: TipoPanelItem; label: string }[] = [
  { value: 'BLOQUEO', label: 'Bloqueos' },
  { value: 'CORTESIA', label: 'Cortesías' },
];

const ESTADOS_BLOQUEO = ['ACTIVO', 'LIBERADO'];
const ESTADOS_CORTESIA = ['GENERADA', 'USADA', 'NO_USADA'];

interface PanelFiltrosBarProps {
  filtros: PanelFiltros;
  onChange: (filtros: PanelFiltros) => void;
  onNuevaCortesia: () => void;
  onBloquearAsientos: () => void;
}

export function PanelFiltrosBar({ filtros, onChange, onNuevaCortesia, onBloquearAsientos }: PanelFiltrosBarProps) {
  const estadosDisponibles =
    filtros.tipo === 'BLOQUEO'
      ? ESTADOS_BLOQUEO
      : filtros.tipo === 'CORTESIA'
        ? ESTADOS_CORTESIA
        : [...ESTADOS_BLOQUEO, ...ESTADOS_CORTESIA];

  function handleTipo(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ tipo: (e.target.value as TipoPanelItem) || undefined, estado: undefined });
  }

  function handleEstado(e: React.ChangeEvent<HTMLSelectElement>) {
    onChange({ ...filtros, estado: e.target.value || undefined });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filtros.tipo ?? ''}
          onChange={handleTipo}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        >
          <option value="">Todos los tipos</option>
          {TIPOS.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <select
          value={filtros.estado ?? ''}
          onChange={handleEstado}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        >
          <option value="">Todos los estados</option>
          {estadosDisponibles.map(e => (
            <option key={e} value={e}>{e.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onBloquearAsientos}
          className="rounded-md border border-[#413383] px-3 py-2 text-sm text-[#413383] hover:bg-[#413383]/5"
        >
          Bloquear asientos
        </button>
        <button
          type="button"
          onClick={onNuevaCortesia}
          className="rounded-md bg-[#413383] px-3 py-2 text-sm font-medium text-white hover:bg-[#362B6E]"
        >
          Nueva cortesía
        </button>
      </div>
    </div>
  );
}
