import { Link } from 'react-router-dom';
import type { EstadoEvento, EventoResponse } from '../../types/evento.types';

const BANNER_GRADIENTS = [
  'from-[#413383] to-[#6B5CE7]',
  'from-[#1a1a6e] to-[#413383]',
  'from-[#7B2D8B] to-[#413383]',
  'from-[#1a3a6e] to-[#2d5a9e]',
  'from-[#2d3a5a] to-[#413383]',
  'from-[#4a1a6e] to-[#7B2D8B]',
];

const ESTADO_BADGE: Record<EstadoEvento, { label: string; className: string }> = {
  ACTIVO: { label: 'Activo', className: 'bg-green-100 text-green-700' },
  EN_PROGRESO: { label: 'En progreso', className: 'bg-blue-100 text-blue-700' },
  FINALIZADO: { label: 'Finalizado', className: 'bg-gray-100 text-gray-600' },
  CANCELADO: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
};

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function EventoCard({ evento, index }: { evento: EventoResponse; index: number }) {
  const gradient = BANNER_GRADIENTS[index % BANNER_GRADIENTS.length];
  const badge = ESTADO_BADGE[evento.estado];

  return (
    <Link
      to={`/eventos/${evento.id}/asientos`}
      className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className={`bg-linear-to-br ${gradient} flex aspect-4/3 items-center justify-center`}>
        <span className="select-none text-5xl font-black text-white/30">
          {evento.nombre.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-[#413383]">
          {evento.nombre}
        </p>
        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}>
          {badge.label}
        </span>
        <div className="pt-0.5 text-xs text-gray-500">
          <p>Inicia: {formatFecha(evento.fechaInicio)}</p>
          <p className="text-gray-400">Finaliza: {formatFecha(evento.fechaFin)}</p>
        </div>
        <p className="truncate text-xs text-gray-400">{evento.nombreRecinto}</p>
      </div>
    </Link>
  );
}
