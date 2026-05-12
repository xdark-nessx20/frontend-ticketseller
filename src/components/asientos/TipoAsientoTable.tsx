import { useState } from 'react';
import axios from 'axios';
import type { TipoAsientoResponse } from '../../types/asiento.types';
import { useEditTipoAsiento } from '../../hooks/asientos/useEditTipoAsiento';
import { useDesactivarTipoAsiento } from '../../hooks/asientos/useDesactivarTipoAsiento';
import { TipoAsientoForm } from './TipoAsientoForm';
import type { TipoAsientoFormValues } from './TipoAsientoForm';
import { AsignarTipoAsientoModal } from './AsignarTipoAsientoModal';

interface TipoAsientoTableProps {
  tipos: TipoAsientoResponse[];
  recintoId: string;
}

function EstadoBadge({ estado }: { estado: TipoAsientoResponse['estado'] }) {
  const clases =
    estado === 'ACTIVO'
      ? 'bg-green-100 text-green-700'
      : 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${clases}`}>
      {estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function EditarModal({ tipo, onClose }: { tipo: TipoAsientoResponse; onClose: () => void }) {
  const { mutate, isPending } = useEditTipoAsiento(tipo.id);

  function handleSubmit(data: TipoAsientoFormValues) {
    mutate(data, { onSuccess: onClose });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Editar tipo de asiento</h2>
        <TipoAsientoForm
          defaultValues={{ nombre: tipo.nombre, descripcion: tipo.descripcion ?? undefined }}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isPending={isPending}
        />
      </div>
    </div>
  );
}

function DesactivarModal({
  tipoId,
  onClose,
}: {
  tipoId: string;
  onClose: () => void;
}) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { mutate, isPending } = useDesactivarTipoAsiento();

  function handleConfirmar() {
    setErrorMsg(null);
    mutate(tipoId, {
      onSuccess: onClose,
      onError: err => {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setErrorMsg(err.response.data?.message ?? 'No se puede desactivar: tiene eventos futuros asociados.');
        } else {
          setErrorMsg('Error inesperado. Intente de nuevo.');
        }
      },
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Desactivar tipo de asiento</h2>
        <p className="mt-2 text-sm text-gray-600">
          ¿Está seguro de que desea desactivar este tipo de asiento? Ya no podrá asignarse a nuevas zonas.
        </p>
        {errorMsg && <p className="mt-2 text-sm text-red-600">{errorMsg}</p>}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={isPending}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending ? 'Desactivando…' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function TipoAsientoTable({ tipos, recintoId }: TipoAsientoTableProps) {
  const [editandoTipo, setEditandoTipo] = useState<TipoAsientoResponse | null>(null);
  const [desactivandoId, setDesactivandoId] = useState<string | null>(null);
  const [asignandoId, setAsignandoId] = useState<string | null>(null);

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Descripción</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tipos.map(t => (
              <tr key={t.id} className="bg-[#F6F3EA] hover:bg-[#EDE9D8]">
                <td className="px-4 py-3 font-medium text-gray-900">{t.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{t.descripcion ?? '—'}</td>
                <td className="px-4 py-3">
                  <EstadoBadge estado={t.estado} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditandoTipo(t)}
                      className="text-gray-600 hover:underline"
                    >
                      Editar
                    </button>
                    {t.estado === 'ACTIVO' && (
                      <>
                        <button
                          onClick={() => setAsignandoId(t.id)}
                          className="text-[#413383] hover:underline"
                        >
                          Asignar
                        </button>
                        <button
                          onClick={() => setDesactivandoId(t.id)}
                          className="text-red-600 hover:underline"
                        >
                          Desactivar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {tipos.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                  No hay tipos de asiento registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editandoTipo && (
        <EditarModal tipo={editandoTipo} onClose={() => setEditandoTipo(null)} />
      )}

      {desactivandoId && (
        <DesactivarModal tipoId={desactivandoId} onClose={() => setDesactivandoId(null)} />
      )}

      {asignandoId && (
        <AsignarTipoAsientoModal
          tipoAsientoId={asignandoId}
          recintoId={recintoId}
          onClose={() => setAsignandoId(null)}
        />
      )}
    </>
  );
}
