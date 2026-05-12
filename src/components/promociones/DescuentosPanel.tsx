import { useState } from 'react';
import type { PromocionResponse } from '../../types/promociones.types';
import { useDescuentos } from '../../hooks/promociones/useDescuentos';
import { useZonas } from '../../hooks/recintos/useZonas';
import { CrearDescuentoModal } from './CrearDescuentoModal';

interface DescuentosPanelProps {
  promocion: PromocionResponse;
  recintoId: string;
  onClose: () => void;
}

export function DescuentosPanel({ promocion, recintoId, onClose }: DescuentosPanelProps) {
  const { data: descuentos, isLoading } = useDescuentos(promocion.id);
  const { data: zonas } = useZonas(recintoId);
  const [showCrear, setShowCrear] = useState(false);

  const zonaMap = new Map((zonas ?? []).map(z => [z.id, z.nombre]));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Descuentos — {promocion.nombre}</h2>
            <button
              onClick={() => setShowCrear(true)}
              className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#362B6E]"
            >
              Agregar Descuento
            </button>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
                ))}
              </div>
            ) : !descuentos || descuentos.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Sin descuentos configurados.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Tipo</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Valor</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Zona</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Acumulable</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {descuentos.map((d, i) => (
                      <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F6F3EA]'}>
                        <td className="px-3 py-2 text-gray-700">
                          {d.tipo === 'PORCENTAJE' ? 'Porcentaje' : 'Monto fijo'}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {d.tipo === 'PORCENTAJE'
                            ? `${d.valor}%`
                            : `$${d.valor.toLocaleString('es-CO')}`}
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {d.zonaId ? (
                            zonaMap.get(d.zonaId) ?? d.zonaId
                          ) : (
                            <span className="text-gray-400">Todas las zonas</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {d.acumulable ? (
                            <span className="text-green-600">Sí</span>
                          ) : (
                            <span className="text-gray-400">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {showCrear && (
        <CrearDescuentoModal
          promocionId={promocion.id}
          recintoId={recintoId}
          onClose={() => setShowCrear(false)}
        />
      )}
    </>
  );
}
