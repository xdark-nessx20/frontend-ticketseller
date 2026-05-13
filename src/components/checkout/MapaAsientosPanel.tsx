import type { AsientoConEstadoResponse } from '../../types/mantenimiento.types';
import type { PrecioZonaResponse } from '../../types/evento.types';

const ZONA_PALETTE = ['#3b82f6', '#ec4899', '#14b8a6', '#f59e0b', '#6366f1', '#ef4444'];

interface Props {
  asientos: AsientoConEstadoResponse[];
  precios: PrecioZonaResponse[];
  seleccionados: string[];
  zonaSeleccionadaId: string | null;
  onToggle: (asiento: AsientoConEstadoResponse) => void;
}

function getSeatClasses(
  estado: AsientoConEstadoResponse['estado'],
  isSelected: boolean,
  dimmed: boolean,
): string {
  const base = 'h-7 w-7 shrink-0 rounded border transition-all ';
  const dim = dimmed ? 'opacity-20 ' : '';

  if (isSelected) {
    return base + 'bg-[#413383] border-[#413383] scale-105 cursor-pointer';
  }

  switch (estado) {
    case 'DISPONIBLE':
      return base + dim + 'bg-green-50 cursor-pointer hover:bg-green-200 hover:scale-105';
    case 'RESERVADO':
      return base + dim + 'bg-amber-100 border-amber-300 cursor-not-allowed';
    case 'VENDIDO':
      return base + dim + 'bg-gray-300 border-gray-400 cursor-not-allowed';
    case 'BLOQUEADO':
      return base + dim + 'bg-gray-100 border-gray-300 cursor-not-allowed';
    case 'MANTENIMIENTO':
      return base + dim + 'bg-orange-100 border-orange-300 cursor-not-allowed';
    default:
      return base + dim + 'bg-gray-50 border-gray-200 cursor-not-allowed';
  }
}

export function MapaAsientosPanel({
  asientos,
  precios,
  seleccionados,
  zonaSeleccionadaId,
  onToggle,
}: Props) {
  const zonaColorMap: Record<string, string> = {};
  precios.forEach((p, i) => {
    zonaColorMap[p.zonaId] = ZONA_PALETTE[i % ZONA_PALETTE.length];
  });

  const validSeats = asientos.filter(a => a.estado !== 'INACTIVO' && a.estado !== 'ANULADO');

  if (validSeats.length === 0) {
    return <p className="text-sm text-gray-500">No se pudo cargar el mapa de asientos.</p>;
  }

  // Group valid seats by fila, sorted by fila and columna
  const filaMap = new Map<number, AsientoConEstadoResponse[]>();
  for (const a of validSeats) {
    if (!filaMap.has(a.fila)) filaMap.set(a.fila, []);
    filaMap.get(a.fila)!.push(a);
  }
  const filas = Array.from(filaMap.entries())
    .sort(([a], [b]) => String(a).localeCompare(String(b), undefined, { numeric: true }))
    .map(([fila, seats]) => ({
      fila,
      seatByCol: new Map(seats.map(s => [s.columna, s])),
    }));

  const allColumnas = validSeats.map(a => a.columna);
  const minColumna = Math.min(...allColumnas);
  const maxColumna = Math.max(...allColumnas);

  return (
    <div className="space-y-4">
      <div className="rounded bg-gray-200 py-1.5 text-center text-xs font-semibold uppercase tracking-widest text-gray-500">
        Escenario / Pantalla
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block space-y-1 pb-2">
          {filas.map(({ fila, seatByCol }) => (
            <div key={fila} className="flex items-center gap-1">
              <span className="w-5 shrink-0 text-right text-[10px] text-gray-400">{fila}</span>
              {Array.from({ length: maxColumna - minColumna + 1 }, (_, j) => minColumna + j).map(col => {
                const asiento = seatByCol.get(col);
                if (!asiento) {
                  return <div key={col} className="h-7 w-7 shrink-0" />;
                }

                const isSelected = seleccionados.includes(asiento.id);
                const dimmed =
                  zonaSeleccionadaId !== null &&
                  asiento.zonaId !== zonaSeleccionadaId &&
                  !isSelected;
                const zoneColor = zonaColorMap[asiento.zonaId] ?? '#9ca3af';
                const zonaNombre =
                  precios.find(p => p.zonaId === asiento.zonaId)?.zonaNombre ?? asiento.zonaId;

                return (
                  <button
                    key={col}
                    title={`Asiento ${asiento.numero} · ${zonaNombre}`}
                    className={getSeatClasses(asiento.estado, isSelected, dimmed)}
                    style={!isSelected ? { borderColor: zoneColor } : undefined}
                    onClick={() => onToggle(asiento)}
                    disabled={asiento.estado !== 'DISPONIBLE'}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
        {[
          { border: '#413383', bg: '#413383', label: 'Seleccionado' },
          { border: '#4ade80', bg: '#f0fdf4', label: 'Disponible' },
          { border: '#fcd34d', bg: '#fef3c7', label: 'Reservado' },
          { border: '#9ca3af', bg: '#d1d5db', label: 'Vendido' },
          { border: '#d1d5db', bg: '#f3f4f6', label: 'Bloqueado' },
          { border: '#fdba74', bg: '#fff7ed', label: 'Mantenimiento' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 shrink-0 rounded border"
              style={{ borderColor: item.border, backgroundColor: item.bg }}
            />
            <span className="text-xs text-gray-600">{item.label}</span>
          </div>
        ))}
      </div>

      {precios.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {precios.map((precio, i) => (
            <div key={precio.zonaId} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 shrink-0 rounded-full"
                style={{ backgroundColor: ZONA_PALETTE[i % ZONA_PALETTE.length] }}
              />
              <span className="text-xs font-medium text-gray-700">{precio.zonaNombre}</span>
              <span className="text-xs text-gray-500">${precio.precio.toLocaleString('es-CO')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
