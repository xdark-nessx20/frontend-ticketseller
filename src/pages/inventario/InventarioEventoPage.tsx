import { useParams, Link } from 'react-router-dom';
import { useInventarioEvento } from '../../hooks/inventario/useInventarioEvento';
import { InventarioResumen } from '../../components/inventario/InventarioResumen';
import { InventarioMapaGrid } from '../../components/inventario/InventarioMapaGrid';
import { VerificarDisponibilidadPanel } from '../../components/inventario/VerificarDisponibilidadPanel';
import { GestionarAsientoPanel } from '../../components/inventario/GestionarAsientoPanel';

export function InventarioEventoPage() {
  const { id: eventoId } = useParams<{ id: string }>();

  const { data, isLoading, isError, dataUpdatedAt, refetch, isFetching } =
    useInventarioEvento(eventoId!);

  const ultimaActualizacion = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : null;

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
        <span className="font-medium text-gray-800">Inventario en tiempo real</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Inventario en tiempo real</h1>
        <div className="flex items-center gap-3">
          {ultimaActualizacion && (
            <span className="text-xs text-gray-400">Actualizado: {ultimaActualizacion}</span>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
          >
            {isFetching ? 'Actualizando…' : 'Recargar'}
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-gray-100" />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          No se pudo cargar el inventario. Intenta de nuevo.
        </p>
      )}

      {data && (
        <>
          <InventarioResumen asientos={data} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-1">
              <VerificarDisponibilidadPanel eventoId={eventoId!} />
              <GestionarAsientoPanel eventoId={eventoId!} />
            </div>
            <div className="lg:col-span-2">
              <div className="rounded-lg border border-gray-200 bg-white p-5">
                <h2 className="mb-4 text-base font-semibold text-gray-800">Mapa de asientos</h2>
                <InventarioMapaGrid asientos={data} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
