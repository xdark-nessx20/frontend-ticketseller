import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { AsientoInventarioResponse } from '../../types/inventario.types';
import { AsientoInventarioCelda } from './AsientoInventarioCelda';

type VirtualRow =
  | { type: 'zone-header'; zonaId: string }
  | { type: 'seats'; zonaId: string; seats: AsientoInventarioResponse[] };

const ZONE_HEADER_HEIGHT = 32;
const SEAT_ROW_HEIGHT = 48;
const SEATS_PER_ROW_ESTIMATE = 12;

interface InventarioMapaGridProps {
  asientos: AsientoInventarioResponse[];
}

export function InventarioMapaGrid({ asientos }: InventarioMapaGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<VirtualRow[]>(() => {
    const zonas = new Map<string, AsientoInventarioResponse[]>();
    for (const a of asientos) {
      if (!zonas.has(a.zonaId)) zonas.set(a.zonaId, []);
      zonas.get(a.zonaId)!.push(a);
    }
    const result: VirtualRow[] = [];
    for (const [zonaId, seats] of zonas) {
      result.push({ type: 'zone-header', zonaId });
      result.push({ type: 'seats', zonaId, seats });
    }
    return result;
  }, [asientos]);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: i => {
      const row = rows[i];
      if (row.type === 'zone-header') return ZONE_HEADER_HEIGHT;
      return Math.ceil(row.seats.length / SEATS_PER_ROW_ESTIMATE) * SEAT_ROW_HEIGHT;
    },
    overscan: 4,
  });

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-emerald-600 bg-emerald-500" />
          Disponible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-yellow-300 bg-yellow-100" />
          Reservado (hold)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-red-300 bg-red-100" />
          Vendido / Ocupado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-orange-300 bg-orange-100" />
          Bloqueado
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded border border-gray-400 bg-gray-200" />
          Mantenimiento
        </span>
      </div>

      <div
        ref={parentRef}
        className="h-130 overflow-auto rounded-lg border border-gray-200 bg-white p-3"
      >
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(virtualRow => {
            const row = rows[virtualRow.index];
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
              >
                {row.type === 'zone-header' ? (
                  <div className="flex h-full items-center border-b border-gray-100 pb-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Zona: {row.zonaId}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {row.seats.map(celda => (
                      <AsientoInventarioCelda key={celda.asientoId} asiento={celda} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
