import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { RecintoResponse } from '../../types/recinto.types';
import { StatusBadge } from './StatusBadge';
import { useDesactivarRecinto } from '../../hooks/recintos/useDesactivarRecinto';
import { useReactivarRecinto } from '../../hooks/recintos/useReactivarRecinto';
import axios from 'axios';

interface VenueTableProps {
  recintos: RecintoResponse[];
}

interface ConfirmState {
  recintoId: string;
  accion: 'desactivar' | 'reactivar';
}

export function VenueTable({ recintos }: VenueTableProps) {
  const navigate = useNavigate();
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const desactivar = useDesactivarRecinto();
  const reactivar = useReactivarRecinto();

  function handleConfirm() {
    if (!confirm) return;
    setErrorMsg(null);

    const mutation = confirm.accion === 'desactivar' ? desactivar : reactivar;
    mutation.mutate(confirm.recintoId, {
      onSuccess: () => setConfirm(null),
      onError: err => {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setErrorMsg(err.response.data?.message ?? 'No se puede realizar esta acción.');
        } else {
          setErrorMsg('Error inesperado. Intente de nuevo.');
        }
      },
    });
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nombre</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Ciudad</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Categoría</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Capacidad</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Estado</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {recintos.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{r.nombre}</td>
                <td className="px-4 py-3 text-gray-600">{r.ciudad}</td>
                <td className="px-4 py-3 text-gray-600">{r.categoria ?? '—'}</td>
                <td className="px-4 py-3 text-right text-gray-600">{r.capacidadMaxima.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <StatusBadge activo={r.activo} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      aria-label={`Ver ${r.nombre}`}
                      onClick={() => navigate(`/admin/recintos/${r.id}`)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver
                    </button>
                    <button
                      aria-label={`Editar ${r.nombre}`}
                      onClick={() => navigate(`/admin/recintos/${r.id}/editar`)}
                      className="text-gray-600 hover:underline"
                    >
                      Editar
                    </button>
                    <button
                      aria-label={r.activo ? `Desactivar ${r.nombre}` : `Reactivar ${r.nombre}`}
                      onClick={() =>
                        setConfirm({ recintoId: r.id, accion: r.activo ? 'desactivar' : 'reactivar' })
                      }
                      className={r.activo ? 'text-red-600 hover:underline' : 'text-green-600 hover:underline'}
                    >
                      {r.activo ? 'Desactivar' : 'Reactivar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {recintos.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No se encontraron recintos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800">
              {confirm.accion === 'desactivar' ? 'Desactivar recinto' : 'Reactivar recinto'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              ¿Está seguro de que desea {confirm.accion} este recinto?
            </p>
            {errorMsg && (
              <p className="mt-2 text-sm text-red-600">{errorMsg}</p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setConfirm(null); setErrorMsg(null); }}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={desactivar.isPending || reactivar.isPending}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
