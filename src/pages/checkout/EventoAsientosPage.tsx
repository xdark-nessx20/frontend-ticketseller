import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useEvento } from '../../hooks/eventos/useEvento';
import { usePreciosZona } from '../../hooks/eventos/usePreciosZona';
import { useReservarAsientos } from '../../hooks/checkout/useReservarAsientos';
import { ZonaSelectorPanel } from '../../components/checkout/ZonaSelectorPanel';
import { ResumenCarrito } from '../../components/checkout/ResumenCarrito';
import type { SeleccionZona } from '../../types/checkout.types';

export function EventoAsientosPage() {
  const { id } = useParams<{ id: string }>();
  const { data: evento, isLoading: loadingEvento } = useEvento(id!);
  const { data: precios, isLoading: loadingPrecios } = usePreciosZona(id!);
  const { mutate: reservar, isPending } = useReservarAsientos();

  const [seleccion, setSeleccion] = useState<SeleccionZona | null>(null);

  if (loadingEvento || loadingPrecios) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!evento) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar el evento.</p>
      </div>
    );
  }

  const resumenItems = seleccion
    ? [
        {
          descripcion: seleccion.zonaNombre,
          cantidad: seleccion.cantidad,
          subtotal: seleccion.cantidad * seleccion.precioUnitario,
        },
      ]
    : [];
  const total = seleccion ? seleccion.cantidad * seleccion.precioUnitario : 0;

  function handleReservar() {
    if (!seleccion) return;
    reservar({ eventoId: id!, zonaId: seleccion.zonaId, cantidad: seleccion.cantidad });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
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
          <ZonaSelectorPanel
            precios={precios ?? []}
            seleccion={seleccion}
            onSeleccion={setSeleccion}
          />
        </div>
        <div className="space-y-4">
          <ResumenCarrito items={resumenItems} total={total} />
          <button
            onClick={handleReservar}
            disabled={!seleccion || isPending}
            className="w-full rounded-md bg-[#413383] px-4 py-3 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
          >
            {isPending ? 'Reservando…' : 'Reservar asientos'}
          </button>
        </div>
      </div>
    </div>
  );
}
