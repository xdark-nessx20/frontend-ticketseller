import { useState } from 'react';
import { useOcuparAsiento } from '../../hooks/inventario/useOcuparAsiento';
import { useLiberarAsiento } from '../../hooks/inventario/useLiberarAsiento';

interface GestionarAsientoPanelProps {
  eventoId: string;
}

type Accion = 'ocupar' | 'liberar' | null;

export function GestionarAsientoPanel({ eventoId }: GestionarAsientoPanelProps) {
  const [asientoId, setAsientoId] = useState('');
  const [ultimaAccion, setUltimaAccion] = useState<Accion>(null);

  const ocupar = useOcuparAsiento(eventoId);
  const liberar = useLiberarAsiento(eventoId);

  const isPending = ocupar.isPending || liberar.isPending;

  function handleOcupar() {
    const id = asientoId.trim();
    if (!id) return;
    setUltimaAccion('ocupar');
    ocupar.reset();
    liberar.reset();
    ocupar.mutate(id);
  }

  function handleLiberar() {
    const id = asientoId.trim();
    if (!id) return;
    setUltimaAccion('liberar');
    ocupar.reset();
    liberar.reset();
    liberar.mutate(id);
  }

  const isSuccess = ultimaAccion === 'ocupar' ? ocupar.isSuccess : liberar.isSuccess;
  const isError = ultimaAccion === 'ocupar' ? ocupar.isError : liberar.isError;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="text-base font-semibold text-gray-800">Gestionar asiento</h2>

      <input
        type="text"
        placeholder="ID de asiento"
        value={asientoId}
        onChange={e => setAsientoId(e.target.value)}
        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleOcupar}
          disabled={isPending || !asientoId.trim()}
          className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {ocupar.isPending ? 'Ocupando…' : 'Ocupar'}
        </button>
        <button
          type="button"
          onClick={handleLiberar}
          disabled={isPending || !asientoId.trim()}
          className="flex-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {liberar.isPending ? 'Liberando…' : 'Liberar'}
        </button>
      </div>

      {isSuccess && (
        <p className="text-sm text-emerald-600">
          Asiento {ultimaAccion === 'ocupar' ? 'ocupado' : 'liberado'} correctamente.
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-500">
          No se pudo {ultimaAccion === 'ocupar' ? 'ocupar' : 'liberar'} el asiento. Verifica el ID
          e intenta de nuevo.
        </p>
      )}
    </div>
  );
}
