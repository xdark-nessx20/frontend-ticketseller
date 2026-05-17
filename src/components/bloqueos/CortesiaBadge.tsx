import type { CategoriaCortesia } from '../../types/bloqueos.types';

const BADGE_CLASSES: Record<CategoriaCortesia, string> = {
  PRENSA: 'bg-blue-100 text-blue-800 border border-blue-200',
  ARTISTA: 'bg-purple-100 text-purple-800 border border-purple-200',
  PATROCINADOR: 'bg-amber-100 text-amber-800 border border-amber-200',
  OTRO: 'bg-gray-100 text-gray-700 border border-gray-200',
};

const LABELS: Record<CategoriaCortesia, string> = {
  PRENSA: 'Prensa',
  ARTISTA: 'Artista',
  PATROCINADOR: 'Patrocinador',
  OTRO: 'Otro',
};

interface CortesiaBadgeProps {
  categoria: CategoriaCortesia;
}

export function CortesiaBadge({ categoria }: CortesiaBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${BADGE_CLASSES[categoria]}`}
    >
      {LABELS[categoria]}
    </span>
  );
}
