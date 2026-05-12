import type { CambiarEstadoMasivoResponse } from '../../types/mantenimiento.types';

interface ResultadoMasivoAlertProps {
  resultado: CambiarEstadoMasivoResponse;
}

export function ResultadoMasivoAlert({ resultado }: ResultadoMasivoAlertProps) {
  const tieneOmitidos = resultado.omitidos > 0;

  return (
    <div className="mt-4 space-y-3">
      <div
        className={`rounded-md border px-4 py-3 ${
          tieneOmitidos ? 'border-amber-200 bg-amber-50' : 'border-green-200 bg-green-50'
        }`}
      >
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-700">{resultado.modificados}</p>
            <p className="text-xs text-gray-500">modificados</p>
          </div>
          {tieneOmitidos && (
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-700">{resultado.omitidos}</p>
              <p className="text-xs text-gray-500">omitidos</p>
            </div>
          )}
        </div>
      </div>

      {resultado.mensajes.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-gray-600">Detalles:</p>
          <ul className="space-y-0.5">
            {resultado.mensajes.map((msg, i) => (
              <li key={i} className="text-xs text-gray-600">
                · {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
