import { useState } from 'react';
import type { PagoResponse } from '../../types/transacciones.types';
import { ResolverDiscrepanciaModal } from './ResolverDiscrepanciaModal';

interface DiscrepanciasTableProps {
  pagos: PagoResponse[];
  isLoading: boolean;
  error: unknown;
}

export function DiscrepanciasTable({ pagos, isLoading, error }: DiscrepanciasTableProps) {
  const [resolviendo, setResolviendo] = useState<PagoResponse | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-500">Error al cargar las discrepancias. Intenta de nuevo.</p>;
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-200">
            <tr>
              {['ID Venta', 'Monto esperado', 'Monto pasarela', 'ID Pasarela', 'Estado', 'Acciones'].map(col => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 last:text-right"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pagos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                  No hay discrepancias pendientes.
                </td>
              </tr>
            )}
            {pagos.map(pago => (
              <tr key={pago.id} className="bg-[#F6F3EA] hover:bg-[#EDE9D8]">
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{pago.ventaId.slice(0, 8)}…</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ${pago.montoEsperado.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ${pago.montoPasarela.toLocaleString('es-CO')}
                </td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-gray-500">{pago.idExternoPasarela ?? '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
                    EN_DISCREPANCIA
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setResolviendo(pago)}
                    className="rounded-md bg-[#413383] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#362B6E]"
                  >
                    Resolver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {resolviendo && (
        <ResolverDiscrepanciaModal
          pago={resolviendo}
          onClose={() => setResolviendo(null)}
        />
      )}
    </>
  );
}
