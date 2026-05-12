import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRecinto } from '../../hooks/recintos/useRecinto';
import { useZonas } from '../../hooks/recintos/useZonas';
import { useMapaAsientos } from '../../hooks/asientos/useMapaAsientos';
import { useMarcarEspacioVacio } from '../../hooks/asientos/useMarcarEspacioVacio';
import { useAsignarAsientosZona } from '../../hooks/asientos/useAsignarAsientosZona';
import { MapaAsientosGrid } from '../../components/asientos/MapaAsientosGrid';
import { CrearMapaModal } from '../../components/asientos/CrearMapaModal';

export function MapaAsientosPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [zonaDestino, setZonaDestino] = useState('');

  const { data: recinto } = useRecinto(id!);
  const { data: zonas } = useZonas(id!);
  const { data: asientos, isLoading, isFetching, isError, error } = useMapaAsientos(id!);
  const { mutate: marcarEspacioVacio } = useMarcarEspacioVacio(id!);
  const { mutate: asignarAsientos, isPending: isAsignando } = useAsignarAsientosZona(id!);

  const tieneZonas = (zonas?.length ?? 0) > 0;
  const sinMapa =
    !isLoading &&
    isError &&
    axios.isAxiosError(error) &&
    error.response?.status === 404;

  const handleToggle = useCallback(
    (asientoId: string) => {
      marcarEspacioVacio({ asientoId });
    },
    [marcarEspacioVacio],
  );

  function handleSelect(asientoId: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(asientoId)) next.delete(asientoId);
      else next.add(asientoId);
      return next;
    });
  }

  function handleCancelarSeleccion() {
    setModoSeleccion(false);
    setSelectedIds(new Set());
    setZonaDestino('');
  }

  function handleAsignarZona() {
    if (!zonaDestino || selectedIds.size === 0) return;
    asignarAsientos(
      { zonaId: zonaDestino, data: { asientoIds: [...selectedIds] } },
      { onSuccess: handleCancelarSeleccion },
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/recintos" className="hover:underline">Recintos</Link>
        <span className="mx-2">/</span>
        <Link to={`/admin/recintos/${id}`} className="hover:underline">
          {recinto?.nombre ?? id}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">Mapa de asientos</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mapa de asientos
            {isFetching && !isLoading && (
              <span className="ml-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-[#413383]" />
            )}
          </h1>
          {recinto && (
            <p className="mt-1 text-sm text-gray-500">{recinto.nombre} · {recinto.ciudad}</p>
          )}
        </div>
        {!sinMapa && (
          <div className="flex gap-2">
            {modoSeleccion ? (
              <button
                onClick={handleCancelarSeleccion}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar selección
              </button>
            ) : (
              <>
                {tieneZonas && (
                  <button
                    onClick={() => setModoSeleccion(true)}
                    className="rounded-md border border-[#413383] px-3 py-1.5 text-sm text-[#413383] hover:bg-[#413383]/5"
                  >
                    Asignar a zona
                  </button>
                )}
                <button
                  onClick={() => setShowCrearModal(true)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Regenerar mapa
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {sinMapa && (
        <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">
          <p className="text-gray-500">Este recinto aún no tiene un mapa de asientos configurado.</p>
          <button
            onClick={() => setShowCrearModal(true)}
            className="mt-4 rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E]"
          >
            Crear mapa de asientos
          </button>
        </div>
      )}

      {modoSeleccion && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-[#413383]/30 bg-[#413383]/5 px-4 py-3">
          <span className="text-sm text-[#413383]">
            {selectedIds.size} asiento{selectedIds.size !== 1 ? 's' : ''} seleccionado{selectedIds.size !== 1 ? 's' : ''}
          </span>
          <select
            value={zonaDestino}
            onChange={e => setZonaDestino(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:border-[#413383] focus:outline-none"
          >
            <option value="">Selecciona una zona…</option>
            {zonas?.map(z => (
              <option key={z.id} value={z.id}>
                {z.nombre} ({z.tipo})
              </option>
            ))}
          </select>
          <button
            onClick={handleAsignarZona}
            disabled={isAsignando || selectedIds.size === 0 || !zonaDestino}
            className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
          >
            {isAsignando ? 'Asignando…' : 'Asignar'}
          </button>
        </div>
      )}

      {!sinMapa && asientos && asientos.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <MapaAsientosGrid
            asientos={asientos}
            onToggle={handleToggle}
            modoSeleccion={modoSeleccion}
            selectedIds={selectedIds}
            onSelect={handleSelect}
          />
        </div>
      )}

      {isError && !sinMapa && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">No se pudo cargar el mapa de asientos.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['recintos', id, 'mapa'] })}
            className="mt-1 text-xs text-red-600 hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {showCrearModal && (
        <CrearMapaModal recintoId={id!} onClose={() => setShowCrearModal(false)} />
      )}
    </div>
  );
}
