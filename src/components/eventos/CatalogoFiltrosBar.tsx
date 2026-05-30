import { useCatalogoStore } from '../../stores/catalogoStore';
import type { TipoEvento } from '../../types/evento.types';

const TIPOS_EVENTO: TipoEvento[] = ['CONCIERTO', 'PARTIDO', 'OBRA_TEATRO', 'FESTIVAL', 'CONFERENCIA', 'OTRO'];

const TIPO_LABELS: Record<TipoEvento, string> = {
  CONCIERTO: 'Concierto',
  PARTIDO: 'Partido',
  OBRA_TEATRO: 'Obra de teatro',
  FESTIVAL: 'Festival',
  CONFERENCIA: 'Conferencia',
  OTRO: 'Otro',
};

export function CatalogoFiltrosBar() {
  const { filtros, setFiltros, resetFiltros } = useCatalogoStore();
  const hayFiltros = !!(filtros.tipo || filtros.fechaInicioDesde || filtros.fechaInicioHasta);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={filtros.tipo ?? ''}
        onChange={e => setFiltros({ tipo: (e.target.value || undefined) as TipoEvento | undefined })}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
      >
        <option value="">Todos los tipos</option>
        {TIPOS_EVENTO.map(t => (
          <option key={t} value={t}>{TIPO_LABELS[t]}</option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Desde</span>
        <input
          type="date"
          value={filtros.fechaInicioDesde ?? ''}
          onChange={e => setFiltros({ fechaInicioDesde: e.target.value || undefined })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">Hasta</span>
        <input
          type="date"
          value={filtros.fechaInicioHasta ?? ''}
          onChange={e => setFiltros({ fechaInicioHasta: e.target.value || undefined })}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        />
      </div>
      {hayFiltros && (
        <button
          onClick={resetFiltros}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
