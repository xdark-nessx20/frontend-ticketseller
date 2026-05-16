import { useState } from 'react';
import type { DescuentoAplicadoResponse } from '../../types/promociones.types';

interface CodigoPromocionProps {
  onAplicar: (codigo: string) => void;
  isPending: boolean;
  descuento?: DescuentoAplicadoResponse | null;
  error?: string;
}

export function CodigoPromocion({ onAplicar, isPending, descuento, error }: CodigoPromocionProps) {
  const [codigo, setCodigo] = useState('');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h3 className="mb-3 font-semibold text-gray-800">Código promocional</h3>

      {descuento ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-sm font-medium text-green-700">
            Descuento aplicado: −${descuento.montoDescuento.toLocaleString('es-CO')}
          </p>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              value={codigo}
              onChange={e => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ej: PROMO2024"
              className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => onAplicar(codigo)}
              disabled={isPending || !codigo.trim()}
              className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isPending ? '…' : 'Aplicar'}
            </button>
          </div>
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </>
      )}
    </div>
  );
}
