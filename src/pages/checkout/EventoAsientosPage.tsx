import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvento } from '../../hooks/eventos/useEvento';
import { usePreciosZona } from '../../hooks/eventos/usePreciosZona';
import { useReservarAsientos } from '../../hooks/checkout/useReservarAsientos';
import { useAsientosEvento } from '../../hooks/mantenimiento/useAsientosEvento';
import { useZonas } from '../../hooks/recintos/useZonas';
import { ZonaSelectorPanel } from '../../components/checkout/ZonaSelectorPanel';
import { ResumenCarrito } from '../../components/checkout/ResumenCarrito';
import { MapaAsientosPanel } from '../../components/checkout/MapaAsientosPanel';
import type { SeleccionZona, TipoUsuario } from '../../types/checkout.types';
import type { AsientoConEstadoResponse } from '../../types/mantenimiento.types';

export function EventoAsientosPage() {
  const { id } = useParams<{ id: string }>();
  const { data: evento, isLoading: loadingEvento } = useEvento(id!);
  const { data: precios, isLoading: loadingPrecios } = usePreciosZona(id!);
  const {
    data: asientosEvento,
    isLoading: loadingAsientos,
    isError: errorAsientos,
    error: asientosError,
  } = useAsientosEvento(id!);
  const { data: zonas } = useZonas(evento?.recintoId ?? '');
  const { mutate: reservar, isPending } = useReservarAsientos();

  const [seleccion, setSeleccion] = useState<SeleccionZona | null>(null);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<AsientoConEstadoResponse[]>([]);
  const [compradorId, setCompradorId] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>('GENERAL');

  const hasMapa =
    !errorAsientos && !loadingAsientos && (asientosEvento?.length ?? 0) > 0;

  if (loadingEvento || loadingPrecios || loadingAsientos) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar el evento.</p>
      </div>
    );
  }

  const zonaNameMap = new Map((zonas ?? []).map(z => [z.id, z.nombre]));
  const preciosEnriquecidos = (precios ?? []).map(p => ({
    ...p,
    zonaNombre: p.zonaNombre || zonaNameMap.get(p.zonaId) || p.zonaId,
  }));

  function handleToggleAsiento(asiento: AsientoConEstadoResponse) {
    if (asiento.estado !== 'DISPONIBLE') return;

    const isSelected = asientosSeleccionados.some(a => a.id === asiento.id);
    let next: AsientoConEstadoResponse[];

    if (isSelected) {
      next = asientosSeleccionados.filter(a => a.id !== asiento.id);
    } else if (
      asientosSeleccionados.length > 0 &&
      asientosSeleccionados[0].zonaId !== asiento.zonaId
    ) {
      next = [asiento];
    } else {
      next = [...asientosSeleccionados, asiento];
    }

    setAsientosSeleccionados(next);

    if (next.length === 0) {
      setSeleccion(null);
      return;
    }

    const zonaId = next[0].zonaId;
    const precio = preciosEnriquecidos.find(p => p.zonaId === zonaId);
    setSeleccion({
      zonaId,
      zonaNombre: precio?.zonaNombre ?? zonaId,
      cantidad: next.length,
      precioUnitario: precio?.precio ?? 0,
      asientoIds: next.map(a => a.id),
      asientosNumeros: next.map(a => a.numero),
    });
  }

  const resumenItems = seleccion
    ? hasMapa
      ? (seleccion.asientosNumeros ?? []).map(num => ({
          descripcion: `Asiento ${num}`,
          cantidad: 1,
          subtotal: seleccion.precioUnitario,
        }))
      : [
          {
            descripcion: seleccion.zonaNombre,
            cantidad: seleccion.cantidad,
            subtotal: seleccion.cantidad * seleccion.precioUnitario,
          },
        ]
    : [];

  const total = seleccion ? seleccion.cantidad * seleccion.precioUnitario : 0;

  function handleReservar() {
    if (!seleccion || !compradorId.trim()) return;
    reservar({
      eventoId: id!,
      compradorId: compradorId.trim(),
      zonaId: seleccion.zonaId,
      cantidad: seleccion.cantidad,
      esCortesia: false,
      asientoIds: seleccion.asientoIds,
      tipoUsuario,
    });
  }

  const puedeReservar = !!seleccion && !!compradorId.trim() && !isPending;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/eventos" className="hover:underline">
          Eventos
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/admin/eventos/${id}`} className="hover:underline">
          {evento.nombre}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">Selección de asientos</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">{evento.nombre}</h1>
        <p className="mt-1 text-sm text-gray-500">{evento.tipo}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {hasMapa ? (
            <MapaAsientosPanel
              asientos={asientosEvento!}
              precios={preciosEnriquecidos}
              seleccionados={asientosSeleccionados.map(a => a.id)}
              zonaSeleccionadaId={seleccion?.zonaId ?? null}
              onToggle={handleToggleAsiento}
            />
          ) : (
            <>
              {errorAsientos && (
                <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  Error al cargar el mapa de asientos:{' '}
                  {(asientosError as Error)?.message ?? 'Error desconocido'}
                </p>
              )}
              <ZonaSelectorPanel
                precios={preciosEnriquecidos}
                seleccion={seleccion}
                onSeleccion={setSeleccion}
              />
            </>
          )}
        </div>

        <div className="space-y-4">
          <ResumenCarrito items={resumenItems} total={total} />

          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="text-sm font-semibold text-gray-700">Datos del comprador</h3>
            <div>
              <label className="mb-1 block text-xs text-gray-500">ID del comprador</label>
              <input
                type="text"
                value={compradorId}
                onChange={e => setCompradorId(e.target.value)}
                placeholder="UUID del comprador"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-500">Tipo de usuario</label>
              <select
                value={tipoUsuario}
                onChange={e => setTipoUsuario(e.target.value as TipoUsuario)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              >
                <option value="GENERAL">General</option>
                <option value="VIP">VIP</option>
                <option value="PRENSA">Prensa</option>
                <option value="PATROCINADOR">Patrocinador</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleReservar}
            disabled={!puedeReservar}
            className="w-full rounded-md bg-[#413383] px-4 py-3 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
          >
            {isPending ? 'Reservando…' : 'Reservar asientos'}
          </button>

          {seleccion && !compradorId.trim() && (
            <p className="text-xs text-amber-600">Ingresa el ID del comprador para continuar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
