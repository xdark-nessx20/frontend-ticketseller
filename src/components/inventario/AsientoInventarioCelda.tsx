import type { AsientoInventarioResponse } from '../../types/inventario.types';

interface AsientoInventarioCeldaProps {
  asiento: AsientoInventarioResponse;
  isSelected?: boolean;
  onClick?: () => void;
}

function resolverClases(estado: string): string {
  switch (estado) {
    case 'DISPONIBLE':
      return 'bg-emerald-500 border border-emerald-600 text-white';
    case 'RESERVADO':
      return 'bg-yellow-100 border border-yellow-300 text-yellow-700';
    case 'VENDIDO':
    case 'OCUPADO':
      return 'bg-red-100 border border-red-300 text-red-700';
    case 'BLOQUEADO':
      return 'bg-orange-100 border border-orange-300 text-orange-700';
    case 'MANTENIMIENTO':
      return 'bg-gray-200 border border-gray-400 text-gray-600';
    case 'ANULADO':
      return 'bg-gray-100 border border-gray-300 text-gray-400 line-through';
    default:
      return 'bg-gray-50 border border-dashed border-gray-200 text-gray-300';
  }
}

export function AsientoInventarioCelda({ asiento, isSelected = false, onClick }: AsientoInventarioCeldaProps) {
  return (
    <div
      title={`${asiento.numeroAsiento} — ${asiento.estado}`}
      onClick={onClick}
      className={`flex h-11 w-9 shrink-0 cursor-pointer items-center justify-center rounded text-[9px] font-medium transition-shadow ${resolverClases(asiento.estado)} ${isSelected ? 'ring-2 ring-[#413383] ring-offset-1' : 'hover:ring-2 hover:ring-[#413383]/40 hover:ring-offset-1'}`}
    >
      <span>{asiento.numeroAsiento}</span>
    </div>
  );
}
