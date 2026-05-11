import { useState } from 'react';
import { useTiposAsiento } from '../../hooks/asientos/useTiposAsiento';
import { useCreateTipoAsiento } from '../../hooks/asientos/useCreateTipoAsiento';
import { TipoAsientoForm } from './TipoAsientoForm';
import type { TipoAsientoFormValues } from './TipoAsientoForm';
import { TipoAsientoTable } from './TipoAsientoTable';
import type { TipoAsientoFiltros } from '../../types/asiento.types';

interface TipoAsientoPanelProps {
  recintoId: string;
}

export function TipoAsientoPanel({ recintoId }: TipoAsientoPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [filtros, setFiltros] = useState<TipoAsientoFiltros>({});

  const { data: tipos, isLoading } = useTiposAsiento(filtros);
  const { mutate, isPending } = useCreateTipoAsiento();

  function handleSubmit(data: TipoAsientoFormValues) {
    mutate(data, { onSuccess: () => setShowForm(false) });
  }

  function toggleFiltroActivos(checked: boolean) {
    setFiltros({ estado: checked ? 'ACTIVO' : undefined });
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-800">Tipos de Asiento</h3>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={filtros.estado === 'ACTIVO'}
              onChange={e => toggleFiltroActivos(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-[#413383]"
            />
            Solo activos
          </label>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#362B6E]"
            >
              Nuevo tipo
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <TipoAsientoForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          isPending={isPending}
        />
      )}

      {isLoading && (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {!isLoading && tipos && <TipoAsientoTable tipos={tipos} recintoId={recintoId} />}
    </section>
  );
}
