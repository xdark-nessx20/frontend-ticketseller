import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBloqueos } from '../../hooks/bloqueos/useBloqueos';
import { PanelFiltrosBar } from '../../components/bloqueos/PanelFiltrosBar';
import { PanelBloqueosTable } from '../../components/bloqueos/PanelBloqueosTable';
import { CrearCortesiaModal } from '../../components/bloqueos/CrearCortesiaModal';
import { BloquearAsientosConSelectorModal } from '../../components/bloqueos/BloquearAsientosConSelectorModal';
import type { PanelFiltros } from '../../types/bloqueos.types';

export function PanelBloqueosPage() {
  const { id: eventoId } = useParams<{ id: string }>();
  const [filtros, setFiltros] = useState<PanelFiltros>({});
  const [showCortesia, setShowCortesia] = useState(false);
  const [showBloqueo, setShowBloqueo] = useState(false);

  const { data: items, isLoading, isError } = useBloqueos(eventoId!, filtros);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/eventos" className="hover:underline">
          Eventos
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/admin/eventos/${eventoId}`} className="hover:underline">
          Evento
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">Bloqueos y cortesías</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Bloqueos y cortesías</h1>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="space-y-4">
          <PanelFiltrosBar
            filtros={filtros}
            onChange={setFiltros}
            onNuevaCortesia={() => setShowCortesia(true)}
            onBloquearAsientos={() => setShowBloqueo(true)}
          />

          {isLoading && (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-red-500">No se pudo cargar el panel. Intenta de nuevo.</p>
          )}

          {!isLoading && !isError && (
            <PanelBloqueosTable eventoId={eventoId!} items={items ?? []} />
          )}
        </div>
      </div>

      {showCortesia && (
        <CrearCortesiaModal eventoId={eventoId!} onClose={() => setShowCortesia(false)} />
      )}

      {showBloqueo && (
        <BloquearAsientosConSelectorModal eventoId={eventoId!} onClose={() => setShowBloqueo(false)} />
      )}
    </div>
  );
}
