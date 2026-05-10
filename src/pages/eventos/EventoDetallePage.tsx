import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvento } from '../../hooks/eventos/useEvento';
import { usePreciosZona } from '../../hooks/eventos/usePreciosZona';
import { useIniciarEvento } from '../../hooks/eventos/useIniciarEvento';
import { useFinalizarEvento } from '../../hooks/eventos/useFinalizarEvento';
import { useZonas } from '../../hooks/recintos/useZonas';
import { EventoEstadoBadge } from '../../components/eventos/EventoEstadoBadge';
import { PreciosZonaTable } from '../../components/eventos/PreciosZonaTable';
import { EditarEventoModal } from '../../components/eventos/EditarEventoModal';
import { CancelarEventoModal } from '../../components/eventos/CancelarEventoModal';
import { ConfigurarPreciosModal } from '../../components/eventos/ConfigurarPreciosModal';

export function EventoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { data: evento, isLoading, error } = useEvento(id!);
  const { data: precios, isLoading: loadingPrecios } = usePreciosZona(id!);
  const { data: zonas } = useZonas(evento?.recintoId ?? '');

  const preciosConNombre = useMemo(() => {
    if (!precios) return [];
    const zonaMap = new Map((zonas ?? []).map(z => [z.id, z.nombre]));
    return precios.map(p => ({
      ...p,
      zonaNombre: p.zonaNombre || zonaMap.get(p.zonaId) || '',
    }));
  }, [precios, zonas]);

  const { mutate: iniciar, isPending: iniciando } = useIniciarEvento(id!);
  const { mutate: finalizar, isPending: finalizando } = useFinalizarEvento(id!);

  const [showEditar, setShowEditar] = useState(false);
  const [showCancelar, setShowCancelar] = useState(false);
  const [showPrecios, setShowPrecios] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !evento) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar el evento.</p>
      </div>
    );
  }

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const puedeEditar = evento.estado !== 'EN_PROGRESO';
  const puedeIniciar = evento.estado === 'ACTIVO';
  const puedeFinalizar = evento.estado === 'EN_PROGRESO';
  const puedeCancelar = evento.estado !== 'CANCELADO' && evento.estado !== 'FINALIZADO';

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/eventos" className="hover:underline">
          Eventos
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">{evento.nombre}</span>
      </nav>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{evento.nombre}</h1>
          <p className="mt-1 text-sm text-gray-500">{evento.tipo}</p>
        </div>
        <div className="flex items-center gap-2">
          <EventoEstadoBadge estado={evento.estado} />
          <button
            onClick={() => setShowPrecios(true)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Precios
          </button>
          <button
            onClick={() => puedeEditar && setShowEditar(true)}
            disabled={!puedeEditar}
            title={!puedeEditar ? 'No se puede editar un evento en progreso' : undefined}
            className={
              puedeEditar
                ? 'rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50'
                : 'cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-300'
            }
          >
            Editar
          </button>
          {puedeIniciar && (
            <button
              onClick={() => iniciar()}
              disabled={iniciando}
              className="rounded-md border border-green-300 px-3 py-1.5 text-sm text-green-700 hover:bg-green-50 disabled:opacity-50"
            >
              {iniciando ? 'Iniciando…' : 'Iniciar'}
            </button>
          )}
          {puedeFinalizar && (
            <button
              onClick={() => finalizar()}
              disabled={finalizando}
              className="rounded-md border border-blue-300 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 disabled:opacity-50"
            >
              {finalizando ? 'Finalizando…' : 'Finalizar'}
            </button>
          )}
          {puedeCancelar && (
            <button
              onClick={() => setShowCancelar(true)}
              className="rounded-md border border-red-300 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Inicio</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">{formatFecha(evento.fechaInicio)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Fin</p>
          <p className="mt-1 text-sm font-semibold text-gray-800">{formatFecha(evento.fechaFin)}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Recinto</p>
          <p className="mt-1 font-mono text-xs text-gray-600">{evento.recintoId}</p>
          <Link
            to={`/admin/recintos/${evento.recintoId}`}
            className="mt-1 block text-xs text-[#413383] hover:underline"
            onClick={e => e.stopPropagation()}
          >
            Ver recinto
          </Link>
        </div>
      </div>

      {evento.motivoCancelacion && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-medium uppercase text-red-500">Motivo de cancelación</p>
          <p className="mt-1 text-sm text-red-700">{evento.motivoCancelacion}</p>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Precios por zona</h2>
          {!loadingPrecios && precios?.length === 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              Sin configurar
            </span>
          )}
        </div>
        {loadingPrecios ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        ) : (
          <PreciosZonaTable mode="view" precios={preciosConNombre} />
        )}
      </div>

      {showEditar && (
        <EditarEventoModal evento={evento} onClose={() => setShowEditar(false)} />
      )}

      {showCancelar && (
        <CancelarEventoModal evento={evento} onClose={() => setShowCancelar(false)} />
      )}

      {showPrecios && (
        <ConfigurarPreciosModal
          eventoId={evento.id}
          recintoId={evento.recintoId}
          onClose={() => setShowPrecios(false)}
        />
      )}
    </div>
  );
}
