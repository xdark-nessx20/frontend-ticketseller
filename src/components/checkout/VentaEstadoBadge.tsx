import type { EstadoVenta } from '../../types/checkout.types';

const config: Record<EstadoVenta, { label: string; className: string }> = {
  RESERVADA: { label: 'Reservada', className: 'bg-yellow-100 text-yellow-800' },
  COMPLETADA: { label: 'Completada', className: 'bg-green-100 text-green-800' },
  EXPIRADA: { label: 'Expirada', className: 'bg-red-100 text-red-800' },
  CANCELADA: { label: 'Cancelada', className: 'bg-gray-100 text-gray-600' },
};

interface VentaEstadoBadgeProps {
  estado: EstadoVenta;
}

export function VentaEstadoBadge({ estado }: VentaEstadoBadgeProps) {
  const { label, className } = config[estado];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
