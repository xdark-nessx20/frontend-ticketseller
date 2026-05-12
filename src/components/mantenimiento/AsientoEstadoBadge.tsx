import type { EstadoAsiento } from '../../types/asiento.types.ts';

const ESTADO_CLASSES: Record<EstadoAsiento, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  BLOQUEADO: 'bg-orange-100 text-orange-800 border border-orange-300',
  RESERVADO: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  VENDIDO: 'bg-red-100 text-red-800 border border-red-300',
  MANTENIMIENTO: 'bg-gray-200 text-gray-700 border border-gray-400',
  ANULADO: 'bg-gray-100 text-gray-500 border border-gray-300 line-through',
  INACTIVO: 'bg-gray-50 text-gray-400 border border-dashed border-gray-300',
};

const ESTADO_LABELS: Record<EstadoAsiento, string> = {
  DISPONIBLE: 'Disponible',
  BLOQUEADO: 'Bloqueado',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  MANTENIMIENTO: 'Mantenimiento',
  ANULADO: 'Anulado',
  INACTIVO: 'Inactivo',
};

interface AsientoEstadoBadgeProps {
  estado: EstadoAsiento;
}

export function AsientoEstadoBadge({ estado }: AsientoEstadoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_CLASSES[estado]}`}
    >
      {ESTADO_LABELS[estado]}
    </span>
  );
}
