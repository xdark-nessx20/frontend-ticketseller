import type { AsientoResponse } from '../../types/asiento.types';

interface MapaAsientosCellProps {
  asiento: AsientoResponse;
  onToggle: (asientoId: string) => void;
  modoSeleccion?: boolean;
  selected?: boolean;
  onSelect?: (asientoId: string) => void;
}

function resolverClases(asiento: AsientoResponse, selected: boolean): string {
  if (selected) {
    return 'bg-[#413383] border border-[#413383] text-white ring-2 ring-[#413383]/40';
  }
  if (asiento.estado === 'INACTIVO') {
    return 'bg-gray-50 border border-dashed border-gray-200 text-gray-300 hover:bg-gray-100';
  }
  switch (asiento.estado) {
    case 'VENDIDO':
      return 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200';
    case 'RESERVADO':
      return 'bg-yellow-100 border border-yellow-300 text-yellow-700 hover:bg-yellow-200';
    case 'BLOQUEADO':
      return 'bg-orange-100 border border-orange-300 text-orange-700 hover:bg-orange-200';
    case 'MANTENIMIENTO':
      return 'bg-gray-200 border border-gray-400 text-gray-600 hover:bg-gray-300';
    case 'ANULADO':
      return 'bg-gray-100 border border-gray-300 text-gray-400 line-through hover:bg-gray-200';
    default:
      return 'bg-emerald-500 border border-emerald-600 text-white hover:bg-emerald-600';
  }
}

export function MapaAsientosCell({ asiento, onToggle, modoSeleccion, selected = false, onSelect }: MapaAsientosCellProps) {
  const existente = asiento.existente;

  function handleClick() {
    if (modoSeleccion) {
      if (existente) onSelect?.(asiento.id);
    } else {
      onToggle(asiento.id);
    }
  }

  return (
    <button
      type="button"
      title={`${asiento.numero} — ${existente ? asiento.estado : 'Espacio vacío'}`}
      onClick={handleClick}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded text-[9px] font-medium transition-colors ${resolverClases(asiento, selected)}`}
    >
      {existente ? asiento.numero : ''}
    </button>
  );
}
