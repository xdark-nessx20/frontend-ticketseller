import { useState } from 'react';
import { useZonas } from '../../hooks/recintos/useZonas';
import { useCreateZona } from '../../hooks/recintos/useCreateZona';
import { ZoneForm } from './ZoneForm';
import type { ZoneFormValues } from './ZoneForm';

interface ZonePanelProps {
  recintoId: string;
}

export function ZonePanel({ recintoId }: ZonePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: zonas, isLoading } = useZonas(recintoId);
  const { mutate, isPending } = useCreateZona(recintoId);

  function handleSubmit(data: ZoneFormValues) {
    mutate(data, { onSuccess: () => setShowForm(false) });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Zonas</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#413383]/90"
          >
            Agregar zona
          </button>
        )}
      </div>

      {showForm && (
        <ZoneForm onSubmit={handleSubmit} isPending={isPending} onCancel={() => setShowForm(false)} />
      )}

      {isLoading && <p className="text-sm text-gray-400">Cargando zonas…</p>}

      {zonas && zonas.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">No hay zonas registradas.</p>
      )}

      {zonas && zonas.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {zonas.map(z => (
            <li key={z.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-gray-800">{z.nombre}</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">{z.tipo}</span>
                <span className="text-sm text-gray-500">{(z.capacidad ?? 0).toLocaleString()} personas</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
