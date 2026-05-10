import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { EventoResponse } from '../../types/evento.types';
import { EventoEstadoBadge } from './EventoEstadoBadge';
import { EditarEventoModal } from './EditarEventoModal';
import { CancelarEventoModal } from './CancelarEventoModal';
import { ConfigurarPreciosModal } from './ConfigurarPreciosModal';

interface EventosTableProps {
  eventos: EventoResponse[];
}

export function EventosTable({ eventos }: EventosTableProps) {
  const navigate = useNavigate();
  const [editando, setEditando] = useState<EventoResponse | null>(null);
  const [cancelando, setCancelando] = useState<EventoResponse | null>(null);
  const [configurandoPrecios, setConfigurandoPrecios] = useState<EventoResponse | null>(null);

  function formatFecha(iso: string) {
    return new Date(iso).toLocaleString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Recinto</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Inicio</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {eventos.map(ev => {
              const puedeEditar = ev.estado !== 'EN_PROGRESO';
              const puedeCancelar = ev.estado !== 'CANCELADO' && ev.estado !== 'FINALIZADO';
              return (
                <tr
                  key={ev.id}
                  onClick={() => navigate(`/admin/eventos/${ev.id}`)}
                  className="cursor-pointer bg-[#F6F3EA] hover:bg-[#EDE9D8]"
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{ev.nombre}</td>
                  <td className="px-4 py-3 text-gray-600">{ev.tipo}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">
                    {ev.recintoId.slice(0, 8)}…
                  </td>
                  <td className="px-4 py-3 text-gray-600">{formatFecha(ev.fechaInicio)}</td>
                  <td className="px-4 py-3">
                    <EventoEstadoBadge estado={ev.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setConfigurandoPrecios(ev)}
                        className="text-[#413383] hover:underline"
                      >
                        Precios
                      </button>
                      <button
                        onClick={() => puedeEditar && setEditando(ev)}
                        disabled={!puedeEditar}
                        className={puedeEditar ? 'text-gray-600 hover:underline' : 'cursor-not-allowed text-gray-300'}
                        title={!puedeEditar ? 'No se puede editar un evento en progreso' : undefined}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => puedeCancelar && setCancelando(ev)}
                        disabled={!puedeCancelar}
                        className={puedeCancelar ? 'text-red-600 hover:underline' : 'cursor-not-allowed text-gray-300'}
                      >
                        Cancelar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {eventos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron eventos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {eventos.some(ev => ev.estado === 'ACTIVO') && (
        <p className="text-xs text-amber-600">
          Los eventos ACTIVO sin precios configurados no permiten la venta de entradas. Use la acción "Precios" para configurarlos.
        </p>
      )}

      {editando && (
        <EditarEventoModal evento={editando} onClose={() => setEditando(null)} />
      )}

      {cancelando && (
        <CancelarEventoModal evento={cancelando} onClose={() => setCancelando(null)} />
      )}

      {configurandoPrecios && (
        <ConfigurarPreciosModal
          eventoId={configurandoPrecios.id}
          recintoId={configurandoPrecios.recintoId}
          onClose={() => setConfigurandoPrecios(null)}
        />
      )}
    </>
  );
}
