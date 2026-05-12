import { useState } from 'react';
import { useCompuertas } from '../../hooks/recintos/useCompuertas';
import { useCreateCompuerta } from '../../hooks/recintos/useCreateCompuerta';
import { useZonas } from '../../hooks/recintos/useZonas';
import { useAsignarCompuertaZona } from '../../hooks/recintos/useAsignarCompuertaZona';
import { GateForm } from './GateForm';
import type { CrearCompuertaRequest } from '../../types/recinto.types';

interface GatePanelProps {
  recintoId: string;
}

export function GatePanel({ recintoId }: GatePanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const { data: compuertas, isLoading } = useCompuertas(recintoId);
  const { data: zonas = [] } = useZonas(recintoId);
  const { mutate, isPending } = useCreateCompuerta(recintoId);
  const asignar = useAsignarCompuertaZona(recintoId);

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

  function handleAsignar(compuertaId: string, zonaId: string) {
    asignar.mutate({ zonaId, compuertaId }, { onSuccess: () => setAssigningId(null) });
  }

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">Compuertas</h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#413383]/90"
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
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">General</span>
                  {assigningId === c.id ? (
                    <select
                      autoFocus
                      className="rounded border border-gray-300 px-1 py-0.5 text-xs"
                      defaultValue=""
                      disabled={asignar.isPending}
                      onChange={e => { if (e.target.value) handleAsignar(c.id, e.target.value); }}
                      onBlur={() => setAssigningId(null)}
                    >
                      <option value="" disabled>Seleccionar zona…</option>
                      {zonas.map(z => (
                        <option key={z.id} value={z.id}>{z.nombre}</option>
                      ))}
                    </select>
                  ) : (
                    <button
                      onClick={() => setAssigningId(c.id)}
                      disabled={zonas.length === 0}
                      className="text-xs text-indigo-600 hover:underline disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Asignar zona
                    </button>
                  )}
                </div>
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
