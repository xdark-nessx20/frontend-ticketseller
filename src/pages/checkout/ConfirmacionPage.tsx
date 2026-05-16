import { useParams, Link } from 'react-router-dom';
import { useVenta } from '../../hooks/checkout/useVenta';
import { useEvento } from '../../hooks/eventos/useEvento';
import { useZonas } from '../../hooks/recintos/useZonas';
import { useCompuertas } from '../../hooks/recintos/useCompuertas';
import { TicketConfirmado } from '../../components/checkout/TicketConfirmado';
import { VentaEstadoBadge } from '../../components/checkout/VentaEstadoBadge';

export function ConfirmacionPage() {
  const { ventaId } = useParams<{ ventaId: string }>();
  const { data: detalle, isLoading } = useVenta(ventaId!);
  const { data: evento } = useEvento(detalle?.eventoId ?? '');
  const { data: zonas } = useZonas(evento?.recintoId ?? '');
  const { data: compuertas } = useCompuertas(evento?.recintoId ?? '');

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar la confirmación.</p>
      </div>
    );
  }

  const zonaMap = new Map((zonas ?? []).map(z => [z.id, z.nombre]));
  const compuertaMap = new Map((compuertas ?? []).map(c => [c.id, c.nombre]));

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="rounded-lg border border-green-200 bg-green-50 p-6 text-center">
        <h1 className="text-2xl font-bold text-green-700">¡Compra exitosa!</h1>
        <p className="mt-1 text-sm text-green-600">
          Tus tickets fueron enviados al correo registrado.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <p className="text-xs font-medium uppercase text-gray-400">Referencia</p>
          <p className="font-mono text-sm font-medium text-gray-800">{detalle.id}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase text-gray-400">Total pagado</p>
          <p className="text-lg font-bold text-[#413383]">${detalle.total.toLocaleString('es-CO')}</p>
        </div>
        <VentaEstadoBadge estado={detalle.estado} />
      </div>

      <div className="space-y-3">
        <h2 className="font-semibold text-gray-800">
          Tus tickets ({detalle.tickets.length})
        </h2>
        {detalle.tickets.map(ticket => (
          <TicketConfirmado
            key={ticket.id}
            ticket={ticket}
            eventoNombre={evento?.nombre}
            zonaName={zonaMap.get(ticket.zonaId)}
            compuertaName={compuertaMap.get(ticket.compuertaId)}
          />
        ))}
      </div>

      <div className="flex items-center justify-center gap-6">
        <Link to="/admin/eventos" className="text-sm text-[#413383] hover:underline">
          Volver a eventos
        </Link>
        {detalle.tickets.some(t => t.codigoQR) && (
          <button
            onClick={() => {
              detalle.tickets.forEach((ticket, index) => {
                if (!ticket.codigoQR) return;
                setTimeout(() => {
                  const link = document.createElement('a');
                  link.href = `data:image/png;base64,${ticket.codigoQR}`;
                  link.download = `ticket-${ticket.id}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }, index * 200);
              });
            }}
            className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#342a6a] active:scale-95"
          >
            Descargar QRs
          </button>
        )}
      </div>
    </div>
  );
}
