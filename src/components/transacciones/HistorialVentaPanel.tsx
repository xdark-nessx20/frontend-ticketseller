import { useHistorialVenta } from '../../hooks/transacciones/useHistorialVenta';

const ESTADO_BADGE: Record<string, string> = {
  PENDIENTE: 'bg-gray-100 text-gray-700',
  RESERVADA: 'bg-blue-100 text-blue-700',
  COMPLETADA: 'bg-green-100 text-green-700',
  EXPIRADA: 'bg-orange-100 text-orange-700',
  FALLIDA: 'bg-red-100 text-red-700',
  REEMBOLSADA: 'bg-purple-100 text-purple-700',
};

function EstadoBadge({ estado }: { estado: string }) {
  const cls = ESTADO_BADGE[estado] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {estado}
    </span>
  );
}

interface HistorialVentaPanelProps {
  ventaId: string;
  onClose: () => void;
}

export function HistorialVentaPanel({ ventaId, onClose }: HistorialVentaPanelProps) {
  const { data: historial, isLoading, error } = useHistorialVenta(ventaId);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Historial de cambios</h2>
            <p className="font-mono text-xs text-gray-400">{ventaId.slice(0, 8)}…</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">Error al cargar el historial.</p>
          )}

          {historial?.length === 0 && (
            <p className="text-sm text-gray-500">Sin cambios registrados.</p>
          )}

          <ol className="space-y-4">
            {historial?.map((entrada, idx) => (
              <li key={entrada.id} className="relative pl-6">
                {idx < historial.length - 1 && (
                  <span className="absolute left-2 top-5 h-full w-0.5 bg-gray-200" />
                )}
                <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full border-2 border-[#413383] bg-white" />

                <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
                  <div className="flex flex-wrap items-center gap-1.5 text-sm">
                    {entrada.estadoAnterior ? (
                      <>
                        <EstadoBadge estado={entrada.estadoAnterior} />
                        <span className="text-gray-400">→</span>
                      </>
                    ) : null}
                    <EstadoBadge estado={entrada.estadoNuevo} />
                  </div>

                  <p className="mt-1.5 text-xs text-gray-500">
                    {new Date(entrada.fechaCambio).toLocaleString('es-CO')}
                    {entrada.actorId && (
                      <>
                        {' · '}
                        <span className="font-mono">{entrada.actorId.slice(0, 8)}…</span>
                      </>
                    )}
                  </p>

                  {entrada.justificacion && (
                    <p className="mt-1.5 text-xs text-gray-700 italic">
                      "{entrada.justificacion}"
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
