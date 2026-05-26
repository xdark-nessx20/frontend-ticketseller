import type { DescuentoAplicadoResponse } from '../../types/promociones.types';

interface DescuentoAplicadoResumenProps {
  descuento: DescuentoAplicadoResponse;
}

function formatCOP(value: number) {
  return value.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
}

export function DescuentoAplicadoResumen({ descuento }: DescuentoAplicadoResumenProps) {
  const porcentaje = Math.round((descuento.montoDescuento / descuento.subtotalOriginal) * 100);

  return (
    <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm">
      <p className="font-medium text-green-800">{porcentaje}% de descuento aplicado</p>
      <div className="mt-1 space-y-0.5 text-green-700">
        <p>
          Subtotal original:{' '}
          <span className="line-through">{formatCOP(descuento.subtotalOriginal)}</span>
        </p>
        <p>
          Descuento: <span className="font-semibold">-{formatCOP(descuento.montoDescuento)}</span>
        </p>
        <p>
          Total final: <span className="font-semibold">{formatCOP(descuento.totalFinal)}</span>
        </p>
      </div>
    </div>
  );
}
