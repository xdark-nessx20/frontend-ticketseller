import { useState } from 'react';
import type { PromocionResponse, EstadoCodigoPromocional } from '../../types/promociones.types';
import { useObtenerCodigos } from '../../hooks/promociones/useObtenerCodigos';
import { GenerarCodigosModal } from './GenerarCodigosModal';

const ESTADO_STYLES: Record<EstadoCodigoPromocional, string> = {
  ACTIVO: 'text-green-600',
  AGOTADO: 'text-orange-500',
  EXPIRADO: 'text-gray-400',
};

const ESTADO_LABELS: Record<EstadoCodigoPromocional, string> = {
  ACTIVO: 'Activo',
  AGOTADO: 'Agotado',
  EXPIRADO: 'Expirado',
};

interface CodigosPanelProps {
  promocion: PromocionResponse;
  onClose: () => void;
}

export function CodigosPanel({ promocion, onClose }: CodigosPanelProps) {
  const { data: codigos, isLoading } = useObtenerCodigos(promocion.id);
  const [showGenerar, setShowGenerar] = useState(false);

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Códigos — {promocion.nombre}</h2>
            <button
              onClick={() => setShowGenerar(true)}
              className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#362B6E]"
            >
              Generar Códigos
            </button>
          </div>

          <div className="mt-4">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
                ))}
              </div>
            ) : !codigos || codigos.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">Sin códigos generados.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Código</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Usos</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Vence</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-600">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {codigos.map((c, i) => (
                      <tr key={c.codigo} className={i % 2 === 0 ? 'bg-white' : 'bg-[#F6F3EA]'}>
                        <td className="px-3 py-2 font-mono text-gray-800">{c.codigo}</td>
                        <td className="px-3 py-2 text-gray-700">
                          {c.usosActuales} / {c.usosMaximos}
                        </td>
                        <td className="px-3 py-2 text-gray-700">{formatFecha(c.fechaFin)}</td>
                        <td className={`px-3 py-2 font-medium ${ESTADO_STYLES[c.estado]}`}>
                          {ESTADO_LABELS[c.estado]}
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

      {showGenerar && (
        <GenerarCodigosModal promocionId={promocion.id} onClose={() => setShowGenerar(false)} />
      )}
    </>
  );
}
