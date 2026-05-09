import { useEffect, useState } from 'react';
import { useRecintosStore } from '../../stores/recintosStore';
import type { CategoriaRecinto, EstadoRecinto } from '../../types/recinto.types';

const CATEGORIAS: CategoriaRecinto[] = [
  'ESTADIO',
  'TEATRO',
  'AUDITORIO',
  'SALA_CONCIERTOS',
  'CENTRO_CONGRESOS',
  'OTRO',
];

export function VenueFilters() {
  const { filtros, setFiltro, resetFiltros } = useRecintosStore();
  const [nombreLocal, setNombreLocal] = useState(filtros.nombre ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setFiltro('nombre', nombreLocal || undefined);
    }, 300);
    return () => clearTimeout(timer);
  }, [nombreLocal, setFiltro]);

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="text"
        placeholder="Buscar por nombre…"
        value={nombreLocal}
        onChange={e => setNombreLocal(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      <input
        type="text"
        placeholder="Ciudad"
        value={filtros.ciudad ?? ''}
        onChange={e => setFiltro('ciudad', e.target.value || undefined)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      />

      <select
        value={filtros.categoria ?? ''}
        onChange={e => setFiltro('categoria', (e.target.value || undefined) as CategoriaRecinto | undefined)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">Todas las categorías</option>
        {CATEGORIAS.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={filtros.estado ?? ''}
        onChange={e => setFiltro('estado', (e.target.value || undefined) as EstadoRecinto | undefined)}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
      >
        <option value="">Todos los estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="INACTIVO">Inactivo</option>
      </select>

      <button
        onClick={resetFiltros}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
