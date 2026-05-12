import type { DescuentoAplicadoResponse } from '../../types/promociones.types';

interface DescuentoAplicadoResumenProps {
  descuento: DescuentoAplicadoResponse;
}

function formatCOP(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
}

export function DescuentoAplicadoResumen({ descuento }: DescuentoAplicadoResumenProps) {
  const etiqueta =
    descuento.tipo === 'PORCENTAJE'
      ? `${descuento.valor}% de descuento`
      : `${formatCOP(descuento.valor)} de descuento`;

  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
      <p className="font-medium text-green-800">{etiqueta}</p>
      <div className="mt-1 space-y-0.5 text-green-700">
        <p>
          Descuento: <span className="font-semibold">-{formatCOP(descuento.montoDescuento)}</span>
        </p>
        <p>
          Total con descuento:{' '}
          <span className="font-semibold">{formatCOP(descuento.totalConDescuento)}</span>
        </p>
      </div>
    </div>
  );
}
