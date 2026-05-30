import { useEventos } from '../../hooks/eventos/useEventos';
import { useCatalogoStore } from '../../stores/catalogoStore';
import { EventoCard } from '../../components/eventos/EventoCard';
import { CatalogoFiltrosBar } from '../../components/eventos/CatalogoFiltrosBar';

export function EventosCatalogoPage() {
  const { filtros } = useCatalogoStore();
  const { data: eventos, isLoading } = useEventos({
    tipo: filtros.tipo,
    fechaInicioDesde: filtros.fechaInicioDesde,
    fechaInicioHasta: filtros.fechaInicioHasta,
  });

  const visibles = (eventos ?? []).filter(
    e => e.estado === 'ACTIVO' || e.estado === 'EN_PROGRESO',
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Eventos disponibles</h1>
        <p className="mt-1 text-sm text-gray-500">Compra tus entradas para los próximos eventos</p>
      </div>

      <div className="mb-6">
        <CatalogoFiltrosBar />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-gray-200">
              <div className="aspect-4/3 bg-gray-200" />
              <div className="space-y-2 p-3">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-100" />
                <div className="h-3 w-1/2 rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && visibles.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400">No hay eventos disponibles en este momento.</p>
        </div>
      )}

      {!isLoading && visibles.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {visibles.map((evento, i) => (
            <EventoCard key={evento.id} evento={evento} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
