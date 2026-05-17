import { useState } from 'react';
import { useLiberarBloqueo } from '../../hooks/bloqueos/useLiberarBloqueo';
import { EditarBloqueoModal } from './EditarBloqueoModal';
import type { PanelItemResponse } from '../../types/bloqueos.types';

function TipoBadge({ tipo }: { tipo: PanelItemResponse['tipo'] }) {
  if (tipo === 'BLOQUEO') {
    return (
      <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
        Bloqueo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-800">
      Cortesía
    </span>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const clases =
    estado === 'ACTIVO' || estado === 'GENERADA'
      ? 'bg-green-100 text-green-800'
      : estado === 'USADA'
        ? 'bg-blue-100 text-blue-800'
        : 'bg-gray-100 text-gray-600';

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${clases}`}>
      {estado.replace('_', ' ')}
    </span>
  );
}

function ConfirmarLiberarModal({
  item,
  isPending,
  onConfirm,
  onCancel,
}: {
  item: PanelItemResponse;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Liberar bloqueo</h2>
        <p className="mt-3 text-sm text-gray-600">
          ¿Estás seguro de liberar el bloqueo de{' '}
          <span className="font-medium">{item.destinatario}</span>? Esta acción es irreversible y
          el asiento volverá a estar disponible.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Liberando…' : 'Liberar'}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface PanelBloqueosTableProps {
  eventoId: string;
  items: PanelItemResponse[];
}

export function PanelBloqueosTable({ eventoId, items }: PanelBloqueosTableProps) {
  const [editando, setEditando] = useState<PanelItemResponse | null>(null);
  const [liberando, setLiberando] = useState<PanelItemResponse | null>(null);

  const { mutate: liberar, isPending: liberandoPending } = useLiberarBloqueo(eventoId);

  function handleConfirmarLiberar() {
    if (!liberando) return;
    liberar(liberando.id, { onSuccess: () => setLiberando(null) });
  }

  if (items.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        No hay bloqueos ni cortesías que coincidan con los filtros.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">Asiento</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">Destinatario</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-600">Fecha creación</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={idx % 2 === 0 ? 'bg-white hover:bg-[#EDE9D8]' : 'bg-[#F6F3EA] hover:bg-[#EDE9D8]'}
              >
                <td className="px-4 py-3">
                  <TipoBadge tipo={item.tipo} />
                </td>
                <td className="px-4 py-3 text-gray-700">
                  {item.asientoId ? (
                    <span className="font-mono text-xs">{item.asientoId}</span>
                  ) : (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                      Acceso general
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-800">{item.destinatario}</td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={item.estado} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-500">
                  {item.fechaCreacion ? formatFecha(item.fechaCreacion) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {item.tipo === 'BLOQUEO' && item.estado === 'ACTIVO' && (
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditando(item)}
                        className="rounded border border-gray-300 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => setLiberando(item)}
                        className="rounded border border-red-200 px-2.5 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Liberar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editando && (
        <EditarBloqueoModal
          eventoId={eventoId}
          item={editando}
          onClose={() => setEditando(null)}
        />
      )}

      {liberando && (
        <ConfirmarLiberarModal
          item={liberando}
          isPending={liberandoPending}
          onConfirm={handleConfirmarLiberar}
          onCancel={() => setLiberando(null)}
        />
      )}
    </>
  );
}
