import { useState, useMemo } from 'react';
import { useAsientosEvento } from '../../hooks/mantenimiento/useAsientosEvento';
import { CambiarEstadoModal } from './CambiarEstadoModal';
import { CambiarEstadoMasivoModal } from './CambiarEstadoMasivoModal';
import { BloquearAsientosModal } from '../bloqueos/BloquearAsientosModal';
import type { AsientoConEstadoResponse, EstadoAsiento } from '../../types/mantenimiento.types';

const CELDA_CLASES: Record<EstadoAsiento, string> = {
  DISPONIBLE: 'bg-emerald-500 border border-emerald-600 text-white hover:bg-emerald-600',
  BLOQUEADO: 'bg-orange-100 border border-orange-300 text-orange-700 hover:bg-orange-200',
  RESERVADO: 'bg-yellow-100 border border-yellow-300 text-yellow-700 hover:bg-yellow-200',
  VENDIDO: 'bg-red-100 border border-red-300 text-red-700 hover:bg-red-200',
  MANTENIMIENTO: 'bg-gray-200 border border-gray-400 text-gray-600 hover:bg-gray-300',
  ANULADO: 'bg-gray-100 border border-gray-300 text-gray-400 line-through hover:bg-gray-200',
  INACTIVO: 'bg-gray-50 border border-dashed border-gray-200 text-gray-300 hover:bg-gray-100',
};

const CELDA_SELECCIONADA = 'bg-[#413383] border border-[#413383] text-white ring-2 ring-[#413383]/40';

interface CeldaProps {
  asiento: AsientoConEstadoResponse;
  modoSeleccion: boolean;
  selected: boolean;
  onAbrir: (asiento: AsientoConEstadoResponse) => void;
  onToggle: (id: string) => void;
}

function Celda({ asiento, modoSeleccion, selected, onAbrir, onToggle }: CeldaProps) {
  function handleClick() {
    if (modoSeleccion) onToggle(asiento.id);
    else onAbrir(asiento);
  }

  const clases = selected ? CELDA_SELECCIONADA : (CELDA_CLASES[asiento.estado] ?? CELDA_CLASES.DISPONIBLE);

  return (
    <button
      type="button"
      title={`${asiento.numero} — ${asiento.estado}`}
      onClick={handleClick}
      className={`flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded text-[9px] font-medium transition-colors ${clases}`}
    >
      {asiento.numero}
    </button>
  );
}

interface MantenimientoAsientosSectionProps {
  eventoId: string;
}

export function MantenimientoAsientosSection({ eventoId }: MantenimientoAsientosSectionProps) {
  const [modoSeleccion, setModoSeleccion] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [asientoDetalle, setAsientoDetalle] = useState<AsientoConEstadoResponse | null>(null);
  const [showMasivoModal, setShowMasivoModal] = useState(false);
  const [showBloqueoModal, setShowBloqueoModal] = useState(false);

  const { data: asientos, isLoading, isError } = useAsientosEvento(eventoId);

  const filas = useMemo(() => {
    if (!asientos) return [];
    const mapa = new Map<string | number, AsientoConEstadoResponse[]>();
    for (const a of asientos) {
      if (!mapa.has(a.fila)) mapa.set(a.fila, []);
      mapa.get(a.fila)!.push(a);
    }
    return Array.from(mapa.entries())
      .sort(([a], [b]) => String(a).localeCompare(String(b), undefined, { numeric: true }))
      .map(([, celdas]) => celdas.sort((x, y) => x.columna - y.columna));
  }, [asientos]);

  function handleToggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleCancelarSeleccion() {
    setModoSeleccion(false);
    setSelectedIds(new Set());
  }

  function handleCloseMasivoModal() {
    setShowMasivoModal(false);
    setModoSeleccion(false);
    setSelectedIds(new Set());
  }

  function handleCloseBloqueoModal() {
    setShowBloqueoModal(false);
    setModoSeleccion(false);
    setSelectedIds(new Set());
  }

  const asientosSeleccionados = asientos?.filter(a => selectedIds.has(a.id)) ?? [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Gestión de asientos</h2>
        <div className="flex gap-2">
          {modoSeleccion ? (
            <>
              <button
                type="button"
                onClick={handleCancelarSeleccion}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar selección
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setShowMasivoModal(true)}
                className="rounded-md border border-[#413383] px-3 py-1.5 text-sm text-[#413383] hover:bg-[#413383]/5 disabled:opacity-50"
              >
                Cambiar estado ({selectedIds.size})
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={() => setShowBloqueoModal(true)}
                className="rounded-md bg-[#413383] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#362B6E] disabled:opacity-50"
              >
                Bloquear seleccionados ({selectedIds.size})
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setModoSeleccion(true)}
              className="rounded-md border border-[#413383] px-3 py-1.5 text-sm text-[#413383] hover:bg-[#413383]/5"
            >
              Cambio masivo
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-9 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500">No se pudieron cargar los asientos del evento.</p>
      )}

      {!isLoading && !isError && asientos?.length === 0 && (
        <p className="text-sm text-gray-500">Este evento aún no tiene asientos configurados.</p>
      )}

      {filas.length > 0 && (
        <>
          <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded border border-emerald-600 bg-emerald-500" />
              Disponible
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded border border-orange-300 bg-orange-100" />
              Bloqueado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded border border-yellow-300 bg-yellow-100" />
              Reservado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded border border-red-300 bg-red-100" />
              Vendido
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded border border-gray-400 bg-gray-200" />
              Mantenimiento
            </span>
          </div>

          <div className="max-h-128 overflow-auto rounded-lg border border-gray-200 bg-white p-3">
            <div className="space-y-1">
              {filas.map(fila => (
                <div key={fila[0].fila} className="flex items-center gap-1">
                  <span className="w-6 shrink-0 text-right text-[10px] text-gray-400">
                    {fila[0].fila}
                  </span>
                  <div className="flex gap-1">
                    {fila.map(asiento => (
                      <Celda
                        key={asiento.id}
                        asiento={asiento}
                        modoSeleccion={modoSeleccion}
                        selected={selectedIds.has(asiento.id)}
                        onAbrir={setAsientoDetalle}
                        onToggle={handleToggleSelect}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            {asientos?.length ?? 0} asientos totales. Haz clic en un asiento para cambiar su estado.
          </p>
        </>
      )}

      {asientoDetalle && (
        <CambiarEstadoModal
          eventoId={eventoId}
          asiento={asientoDetalle}
          onClose={() => setAsientoDetalle(null)}
        />
      )}

      {showMasivoModal && (
        <CambiarEstadoMasivoModal
          eventoId={eventoId}
          asientos={asientosSeleccionados}
          onClose={handleCloseMasivoModal}
        />
      )}

      {showBloqueoModal && (
        <BloquearAsientosModal
          eventoId={eventoId}
          asientoIds={Array.from(selectedIds)}
          onClose={handleCloseBloqueoModal}
        />
      )}
    </div>
  );
}
