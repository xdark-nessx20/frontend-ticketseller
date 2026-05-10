import { useState } from 'react';
import { useEventos } from '../../hooks/eventos/useEventos';
import { useEventosStore } from '../../stores/eventosStore';
import { EventoFiltrosBar } from '../../components/eventos/EventoFiltrosBar';
import { EventosTable } from '../../components/eventos/EventosTable';
import { CrearEventoModal } from '../../components/eventos/CrearEventoModal';

export function EventosPage() {
  const { filtros } = useEventosStore();
  const { data: eventos, isLoading, error } = useEventos(filtros);
  const [showCrear, setShowCrear] = useState(false);

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">Eventos</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">Gestión de Eventos</h1>

      <EventoFiltrosBar onNuevoEvento={() => setShowCrear(true)} />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">Error al cargar los eventos. Intente de nuevo.</p>
      )}

      {!isLoading && !error && <EventosTable eventos={eventos ?? []} />}

      {showCrear && <CrearEventoModal onClose={() => setShowCrear(false)} />}
    </div>
  );
}
