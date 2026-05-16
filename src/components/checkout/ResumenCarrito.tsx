import type { DescuentoAplicadoResponse } from '../../types/promociones.types';

interface ResumenItem {
  descripcion: string;
  cantidad: number;
  subtotal: number;
}

interface ResumenCarritoProps {
  items: ResumenItem[];
  total: number;
  descuento?: DescuentoAplicadoResponse | null;
}

export function ResumenCarrito({ items, total, descuento }: ResumenCarritoProps) {
  const totalFinal = descuento ? descuento.totalConDescuento : total;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-3 font-semibold text-gray-800">Resumen</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">Sin asientos seleccionados.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                {item.descripcion} × {item.cantidad}
              </span>
              <span className="font-medium text-gray-800">
                ${item.subtotal.toLocaleString('es-CO')}
              </span>
            </li>
          ))}
        </ul>
      )}

      {descuento && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="text-green-700">Descuento</span>
          <span className="font-medium text-green-700">
            −${descuento.montoDescuento.toLocaleString('es-CO')}
          </span>
        </div>
      )}

      <div className="mt-3 flex justify-between border-t border-gray-100 pt-3">
        <span className="font-semibold text-gray-800">Total</span>
        <span className="font-bold text-[#413383]">${totalFinal.toLocaleString('es-CO')}</span>
      </div>
    </div>
  );
}
