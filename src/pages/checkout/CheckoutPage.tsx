import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useVenta } from '../../hooks/checkout/useVenta';
import { useProcesarPago } from '../../hooks/checkout/useProcesarPago';
import { usePreciosZona } from '../../hooks/eventos/usePreciosZona';
import { useAplicarCodigo } from '../../hooks/checkout/useAplicarCodigo';
import { useCarritoStore } from '../../stores/carritoStore';
import { CarritoCountdown } from '../../components/checkout/CarritoCountdown';
import { ResumenCarrito } from '../../components/checkout/ResumenCarrito';
import { FormularioPago } from '../../components/checkout/FormularioPago';
import { VentaEstadoBadge } from '../../components/checkout/VentaEstadoBadge';
import { CodigoPromocion } from '../../components/checkout/CodigoPromocion';
import type { ProcesarPagoRequest } from '../../types/checkout.types';
import type { DescuentoAplicadoResponse } from '../../types/promociones.types';

export function CheckoutPage() {
  const { ventaId } = useParams<{ ventaId: string }>();
  const navigate = useNavigate();

  const { data: detalle, isLoading } = useVenta(ventaId!);
  const { data: precios } = usePreciosZona(detalle?.eventoId ?? '');
  const { mutate: pagar, isPending } = useProcesarPago(ventaId!);
  const carritoSelecciones = useCarritoStore(s => s.asientosSeleccionados);

  const { mutate: aplicarCodigo, isPending: isApplyingCode } = useAplicarCodigo(ventaId!);
  const [descuentoAplicado, setDescuentoAplicado] = useState<DescuentoAplicadoResponse | null>(null);
  const [codigoError, setCodigoError] = useState<string | undefined>();
  const [backendError, setBackendError] = useState<string | undefined>();

  if (detalle?.estado === 'COMPLETADA') {
    navigate(`/checkout/${ventaId}/confirmacion`, { replace: true });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (!detalle) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar la venta.</p>
      </div>
    );
  }

  if (detalle.estado === 'EXPIRADA') {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <h2 className="text-lg font-semibold text-red-700">Reserva expirada</h2>
          <p className="mt-2 text-sm text-red-600">
            El tiempo para completar el pago ha expirado y los asientos fueron liberados.
          </p>
          <button
            onClick={() => navigate(`/eventos/${detalle.eventoId}/asientos`)}
            className="mt-5 rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E]"
          >
            Volver a seleccionar asientos
          </button>
        </div>
      </div>
    );
  }

  const zonaMap = new Map((precios ?? []).map(p => [p.zonaId, p.zonaNombre]));
  const tickets = detalle.tickets ?? [];
  const ticketGroups = tickets.reduce<Map<string, { nombre: string; count: number; total: number }>>(
    (acc, t) => {
      const entry = acc.get(t.zonaId) ?? {
        nombre: zonaMap.get(t.zonaId) ?? t.zonaId,
        count: 0,
        total: 0,
      };
      entry.count += 1;
      entry.total += t.precio;
      acc.set(t.zonaId, entry);
      return acc;
    },
    new Map(),
  );

  const fromTickets = [...ticketGroups.values()].map(g => ({
    descripcion: g.nombre,
    cantidad: g.count,
    subtotal: g.total,
  }));
  const resumenItems =
    fromTickets.length > 0
      ? fromTickets
      : carritoSelecciones.map(s => ({
          descripcion: s.zonaNombre,
          cantidad: s.cantidad,
          subtotal: s.cantidad * s.precioUnitario,
        }));

  function handleAplicarCodigo(codigo: string) {
    setCodigoError(undefined);
    aplicarCodigo(codigo, {
      onSuccess: data => setDescuentoAplicado(data),
      onError: err => {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setCodigoError('Código no encontrado o inválido.');
          } else if (err.response?.status === 409) {
            setCodigoError('El código ya fue utilizado o no aplica para esta compra.');
          } else {
            setCodigoError('No se pudo aplicar el código. Intenta de nuevo.');
          }
        }
      },
    });
  }

  function handlePagar(data: ProcesarPagoRequest) {
    setBackendError(undefined);
    pagar(data, {
      onError: err => {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 402) {
            setBackendError('Fondos insuficientes. Intenta con otro método de pago.');
          } else if (err.response?.status === 503) {
            setBackendError('El servicio de pagos no está disponible. Intenta más tarde.');
          } else {
            setBackendError('Error inesperado al procesar el pago. Intenta de nuevo.');
          }
        }
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <VentaEstadoBadge estado={detalle.estado} />
      </div>

      <CarritoCountdown fechaExpiracion={detalle.fechaExpiracion} />

      <ResumenCarrito items={resumenItems} total={detalle.total} descuento={descuentoAplicado} />

      <CodigoPromocion
        onAplicar={handleAplicarCodigo}
        isPending={isApplyingCode}
        descuento={descuentoAplicado}
        error={codigoError}
      />

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Datos de pago</h2>
        <FormularioPago
          onSubmit={handlePagar}
          isPending={isPending}
          backendError={backendError}
        />
      </div>
    </div>
  );
}
