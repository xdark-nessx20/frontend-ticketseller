import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { AsientoResponse } from '../../types/asiento.types';
import { MapaAsientosCell } from './MapaAsientosCell';

const ROW_HEIGHT = 40;

interface MapaAsientosGridProps {
  asientos: AsientoResponse[];
  onToggle: (asientoId: string) => void;
  modoSeleccion?: boolean;
  selectedIds?: Set<string>;
  onSelect?: (asientoId: string) => void;
}

export function MapaAsientosGrid({ asientos, onToggle, modoSeleccion, selectedIds, onSelect }: MapaAsientosGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const filas = useMemo(() => {
    const mapa = new Map<number, AsientoResponse[]>();
    for (const a of asientos) {
      if (!mapa.has(a.fila)) mapa.set(a.fila, []);
      mapa.get(a.fila)!.push(a);
    }
    return Array.from(mapa.entries())
      .sort(([a], [b]) => a - b)
      .map(([, celdas]) => celdas.sort((a, b) => a.columna - b.columna));
  }, [asientos]);

  const rowVirtualizer = useVirtualizer({
    count: filas.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-red-300 bg-red-100" />
          Vendido
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-yellow-300 bg-yellow-100" />
          Reservado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-orange-300 bg-orange-100" />
          Bloqueado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-emerald-600 bg-emerald-500" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-dashed border-gray-200 bg-gray-50" />
          Espacio vacío
        </span>
      </div>

      <div
        ref={parentRef}
        className="h-130 overflow-auto rounded-lg border border-gray-200 bg-white p-3"
      >
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const fila = filas[virtualRow.index];
            return (
              <div
                key={virtualRow.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex items-center gap-1"
              >
                <span className="w-6 shrink-0 text-right text-[10px] text-gray-400">
                  {fila[0]?.fila}
                </span>
                <div className="flex gap-1">
                  {fila.map(celda => (
                    <MapaAsientosCell
                      key={celda.id}
                      asiento={celda}
                      onToggle={onToggle}
                      modoSeleccion={modoSeleccion}
                      selected={selectedIds?.has(celda.id) ?? false}
                      onSelect={onSelect}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-400">
        {asientos.filter(a => a.existente).length} asientos activos de {asientos.length} celdas totales. Haz clic en una celda para alternar entre asiento y espacio vacío.
      </p>
    </div>
  );
}
