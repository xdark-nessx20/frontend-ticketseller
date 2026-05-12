import { useState } from 'react';
import type { PromocionResponse, EstadoPromocion } from '../../types/promociones.types';
import { useGestionarEstadoPromocion } from '../../hooks/promociones/useGestionarEstadoPromocion';
import { PromocionEstadoBadge } from './PromocionEstadoBadge';

interface GestionarEstadoModalProps {
  promocion: PromocionResponse;
  eventoId: string;
  onClose: () => void;
}

export function GestionarEstadoModal({ promocion, eventoId, onClose }: GestionarEstadoModalProps) {
  const { mutate, isPending } = useGestionarEstadoPromocion(eventoId);
  const [confirmFinalizar, setConfirmFinalizar] = useState(false);

  function cambiarEstado(estado: EstadoPromocion) {
    mutate(
      { promocionId: promocion.id, data: { estado } },
      { onSuccess: onClose },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Gestionar Estado</h2>
        <p className="mt-1 text-sm text-gray-600">{promocion.nombre}</p>

        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">Estado actual:</span>
          <PromocionEstadoBadge estado={promocion.estado} />
        </div>

        {promocion.estado === 'FINALIZADA' ? (
          <p className="mt-4 rounded-md bg-gray-50 px-3 py-3 text-sm text-gray-500">
            Esta promoción está finalizada y no puede ser reactivada.
          </p>
        ) : (
          <div className="mt-4 space-y-2">
            {promocion.estado === 'ACTIVA' && (
              <button
                onClick={() => cambiarEstado('PAUSADA')}
                disabled={isPending}
                className="w-full rounded-md border border-yellow-300 px-4 py-2 text-sm font-medium text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
              >
                {isPending ? 'Procesando…' : 'Pausar promoción'}
              </button>
            )}

            {promocion.estado === 'PAUSADA' && (
              <button
                onClick={() => cambiarEstado('ACTIVA')}
                disabled={isPending}
                className="w-full rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50 disabled:opacity-50"
              >
                {isPending ? 'Procesando…' : 'Reanudar promoción'}
              </button>
            )}

            {!confirmFinalizar ? (
              <button
                onClick={() => setConfirmFinalizar(true)}
                disabled={isPending}
                className="w-full rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Finalizar promoción
              </button>
            ) : (
              <div className="rounded-md border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">
                  ¿Confirmas finalizar? Esta acción es irreversible.
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => cambiarEstado('FINALIZADA')}
                    disabled={isPending}
                    className="flex-1 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {isPending ? 'Finalizando…' : 'Sí, finalizar'}
                  </button>
                  <button
                    onClick={() => setConfirmFinalizar(false)}
                    disabled={isPending}
                    className="flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            disabled={isPending}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
