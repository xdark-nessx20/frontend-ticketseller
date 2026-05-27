import type { EstadoReembolso } from '../../types/postventa.types';

const config: Record<EstadoReembolso, { label: string; className: string }> = {
  PENDIENTE: { label: 'Reembolso pendiente', className: 'bg-yellow-100 text-yellow-800' },
  EN_PROCESO: { label: 'En proceso', className: 'bg-blue-100 text-blue-800' },
  COMPLETADO: { label: 'Reembolsado', className: 'bg-green-100 text-green-800' },
  FALLIDO: { label: 'Reembolso fallido', className: 'bg-red-100 text-red-800' },
};

interface ReembolsoBadgeProps {
  estado: EstadoReembolso;
}

export function ReembolsoBadge({ estado }: ReembolsoBadgeProps) {
  const { label, className } = config[estado];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
