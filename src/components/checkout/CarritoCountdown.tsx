import { useCarritoCountdown } from '../../hooks/checkout/useCarritoCountdown';

interface CarritoCountdownProps {
  fechaExpiracion: string;
}

export function CarritoCountdown({ fechaExpiracion }: CarritoCountdownProps) {
  const { minutes, seconds, isExpired } = useCarritoCountdown(fechaExpiracion);

  if (isExpired) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-700">
          La reserva ha expirado. Los asientos fueron liberados.
        </p>
      </div>
    );
  }

  const isUrgent = minutes < 2;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div
      className={`flex items-center gap-2 rounded-md px-4 py-2 ${
        isUrgent ? 'border border-red-200 bg-red-50' : 'border border-amber-200 bg-amber-50'
      }`}
    >
      <span className="text-sm font-medium text-gray-600">Tiempo restante:</span>
      <span className={`font-mono text-lg font-bold ${isUrgent ? 'text-red-600' : 'text-amber-700'}`}>
        {timeStr}
      </span>
    </div>
  );
}
