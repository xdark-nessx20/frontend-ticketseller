import type { EstadoPromocion } from '../../types/promociones.types';

const BADGE_STYLES: Record<EstadoPromocion, string> = {
  ACTIVA: 'bg-green-100 text-green-800',
  PAUSADA: 'bg-yellow-100 text-yellow-800',
  FINALIZADA: 'bg-gray-100 text-gray-600',
};

const LABELS: Record<EstadoPromocion, string> = {
  ACTIVA: 'Activa',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
};

interface PromocionEstadoBadgeProps {
  estado: EstadoPromocion;
}

export function PromocionEstadoBadge({ estado }: PromocionEstadoBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_STYLES[estado]}`}>
      {LABELS[estado]}
    </span>
  );
}
