import type { EstadoAsientoDisplay } from '../../types/mantenimiento.types';

const ESTADO_CLASSES: Record<EstadoAsientoDisplay, string> = {
  DISPONIBLE: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  BLOQUEADO: 'bg-orange-100 text-orange-800 border border-orange-300',
  RESERVADO: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
  VENDIDO: 'bg-red-100 text-red-800 border border-red-300',
  MANTENIMIENTO: 'bg-gray-200 text-gray-700 border border-gray-400',
  INACTIVO: 'bg-gray-50 text-gray-400 border border-dashed border-gray-300',
};

const ESTADO_LABELS: Record<EstadoAsientoDisplay, string> = {
  DISPONIBLE: 'Disponible',
  BLOQUEADO: 'Bloqueado',
  RESERVADO: 'Reservado',
  VENDIDO: 'Vendido',
  MANTENIMIENTO: 'Mantenimiento',
  INACTIVO: 'Inactivo',
};

interface AsientoEstadoBadgeProps {
  estado: EstadoAsientoDisplay;
}

export function AsientoEstadoBadge({ estado }: AsientoEstadoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${ESTADO_CLASSES[estado] ?? 'bg-gray-100 text-gray-600'}`}
    >
      {ESTADO_LABELS[estado] ?? estado}
    </span>
  );
}
