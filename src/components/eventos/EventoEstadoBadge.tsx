import type { EstadoEvento } from '../../types/evento.types';

const BADGE_STYLES: Record<EstadoEvento, string> = {
  ACTIVO: 'bg-green-100 text-green-800',
  EN_PROGRESO: 'bg-yellow-100 text-yellow-800',
  FINALIZADO: 'bg-gray-100 text-gray-600',
  CANCELADO: 'bg-red-100 text-red-800',
};

const LABELS: Record<EstadoEvento, string> = {
  ACTIVO: 'Activo',
  EN_PROGRESO: 'En progreso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

interface EventoEstadoBadgeProps {
  estado: EstadoEvento;
}

export function EventoEstadoBadge({ estado }: EventoEstadoBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${BADGE_STYLES[estado]}`}
    >
      {LABELS[estado]}
    </span>
  );
}
