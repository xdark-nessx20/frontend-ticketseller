import { useState } from 'react';
import { useCompuertas } from '../../hooks/recintos/useCompuertas';
import { useCreateCompuerta } from '../../hooks/recintos/useCreateCompuerta';
import { useZonas } from '../../hooks/recintos/useZonas';
import { GateForm } from './GateForm';
import type { CrearCompuertaRequest } from '../../types/recinto.types';

interface GatePanelProps {
  recintoId: string;
}

export function GatePanel({ recintoId }: GatePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const { data: compuertas, isLoading } = useCompuertas(recintoId);
  const { data: zonas = [] } = useZonas(recintoId);
  const { mutate, isPending } = useCreateCompuerta(recintoId);

  function handleSubmit(data: CrearCompuertaRequest) {
    const payload: CrearCompuertaRequest = {
      nombre: data.nombre,
      ...(data.zonaId ? { zonaId: data.zonaId } : {}),
    };
    mutate(payload, { onSuccess: () => setShowForm(false) });
  }

  function zonaNombre(zonaId: string | null) {
    if (!zonaId) return null;
    return zonas.find(z => z.id === zonaId)?.nombre ?? zonaId;
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Compuertas</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Agregar compuerta
          </button>
        )}
      </div>

      {showForm && (
        <GateForm
          zonas={zonas}
          onSubmit={handleSubmit}
          isPending={isPending}
          onCancel={() => setShowForm(false)}
        />
      )}

      {isLoading && <p className="text-sm text-gray-400">Cargando compuertas…</p>}

      {compuertas && compuertas.length === 0 && !showForm && (
        <p className="text-sm text-gray-400">No hay compuertas registradas.</p>
      )}

      {compuertas && compuertas.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
          {compuertas.map(c => (
            <li key={c.id} className="flex items-center justify-between px-4 py-3">
              <span className="font-medium text-gray-800">{c.nombre}</span>
              {c.esGeneral ? (
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">General</span>
              ) : (
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs text-blue-700">
                  {zonaNombre(c.zonaId)}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
