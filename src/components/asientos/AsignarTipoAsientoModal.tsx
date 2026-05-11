import { useState } from 'react';
import axios from 'axios';
import { useZonas } from '../../hooks/recintos/useZonas';
import { useAsignarTipoAsiento } from '../../hooks/asientos/useAsignarTipoAsiento';

interface AsignarTipoAsientoModalProps {
  tipoAsientoId: string;
  recintoId: string;
  onClose: () => void;
}

export function AsignarTipoAsientoModal({ tipoAsientoId, recintoId, onClose }: AsignarTipoAsientoModalProps) {
  const [zonaId, setZonaId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: zonas, isLoading } = useZonas(recintoId);
  const { mutate, isPending } = useAsignarTipoAsiento();

  function handleSubmit() {
    if (!zonaId) return;
    setErrorMsg(null);
    mutate(
      { recintoId, zonaId, data: { tipoAsientoId } },
      {
        onSuccess: onClose,
        onError: err => {
          if (axios.isAxiosError(err) && err.response?.status === 409) {
            setErrorMsg(err.response.data?.message ?? 'Esta zona ya tiene un tipo de asiento asignado.');
          } else {
            setErrorMsg('No se pudo asignar el tipo de asiento. Intente de nuevo.');
          }
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Asignar a zona</h2>
        <p className="mt-1 text-sm text-gray-500">Selecciona la zona del recinto donde se aplicará este tipo de asiento.</p>

        <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Zona</label>
            {isLoading ? (
              <div className="mt-1 h-9 animate-pulse rounded-md bg-gray-100" />
            ) : (
              <select
                value={zonaId}
                onChange={e => setZonaId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
              >
                <option value="">Selecciona una zona…</option>
                {zonas?.map(z => (
                  <option key={z.id} value={z.id}>
                    {z.nombre} ({z.tipo})
                  </option>
                ))}
              </select>
            )}
          </div>

          {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending || !zonaId}
              className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
            >
              {isPending ? 'Asignando…' : 'Asignar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
