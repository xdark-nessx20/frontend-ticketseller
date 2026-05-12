import { useState } from 'react';
import type { PromocionResponse } from '../../types/promociones.types';
import { PromocionEstadoBadge } from './PromocionEstadoBadge';
import { DescuentosPanel } from './DescuentosPanel';
import { GestionarEstadoModal } from './GestionarEstadoModal';

const TIPO_LABELS: Record<string, string> = {
  PREVENTA: 'Preventa',
  DESCUENTO: 'Descuento',
  CODIGOS: 'Códigos',
};

const TIPO_USUARIO_LABELS: Record<string, string> = {
  VIP: 'VIP',
  GENERAL: 'General',
  PRENSA: 'Prensa',
  PATROCINADOR: 'Patrocinador',
};

interface PromocionesTableProps {
  promociones: PromocionResponse[];
  eventoId: string;
  recintoId: string;
}

export function PromocionesTable({ promociones, eventoId, recintoId }: PromocionesTableProps) {
  const [selectedDescuentos, setSelectedDescuentos] = useState<PromocionResponse | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<PromocionResponse | null>(null);

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Inicio</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Fin</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Tipo usuario</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {promociones.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                  Sin promociones registradas.
                </td>
              </tr>
            ) : (
              promociones.map((p) => (
                <tr
                  key={p.id}
                  className={`hover:bg-[#EDE9D8] bg-[#F6F3EA]`}
                >
                  <td className="px-4 py-3 font-medium text-gray-800">{p.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{TIPO_LABELS[p.tipo] ?? p.tipo}</td>
                  <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaInicio)}</td>
                  <td className="px-4 py-3 text-gray-600">{formatFecha(p.fechaFin)}</td>
                  <td className="px-4 py-3">
                    <PromocionEstadoBadge estado={p.estado} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.tipoUsuarioRestringido ? (
                      TIPO_USUARIO_LABELS[p.tipoUsuarioRestringido] ?? p.tipoUsuarioRestringido
                    ) : (
                      <span className="text-gray-400">Todos</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDescuentos(p)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Descuentos
                      </button>
                      <button
                        onClick={() => setSelectedEstado(p)}
                        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Estado
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedDescuentos && (
        <DescuentosPanel
          promocion={selectedDescuentos}
          recintoId={recintoId}
          onClose={() => setSelectedDescuentos(null)}
        />
      )}

      {selectedEstado && (
        <GestionarEstadoModal
          promocion={selectedEstado}
          eventoId={eventoId}
          onClose={() => setSelectedEstado(null)}
        />
      )}
    </>
  );
}
