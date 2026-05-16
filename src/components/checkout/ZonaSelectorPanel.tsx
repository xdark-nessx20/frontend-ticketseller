import type { PrecioZonaResponse } from '../../types/evento.types';
import type { SeleccionZona } from '../../types/checkout.types';

interface ZonaSelectorPanelProps {
  precios: PrecioZonaResponse[];
  seleccion: SeleccionZona | null;
  onSeleccion: (seleccion: SeleccionZona | null) => void;
}

export function ZonaSelectorPanel({ precios, seleccion, onSeleccion }: ZonaSelectorPanelProps) {
  function handleSelect(precio: PrecioZonaResponse) {
    if (seleccion?.zonaId === precio.zonaId) {
      onSeleccion(null);
    } else {
      onSeleccion({
        zonaId: precio.zonaId,
        zonaNombre: precio.zonaNombre,
        cantidad: 1,
        precioUnitario: precio.precio,
      });
    }
  }

  function handleCantidad(precio: PrecioZonaResponse, cantidad: number) {
    if (cantidad < 1) return;
    onSeleccion({
      zonaId: precio.zonaId,
      zonaNombre: precio.zonaNombre,
      cantidad,
      precioUnitario: precio.precio,
    });
  }

  if (precios.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-700">Este evento no tiene precios configurados aún.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-700">Seleccionar zona</h3>
      {precios.map(precio => {
        const isSelected = seleccion?.zonaId === precio.zonaId;
        return (
          <div
            key={precio.zonaId}
            onClick={() => handleSelect(precio)}
            className={`cursor-pointer rounded-lg border p-4 transition-colors ${
              isSelected
                ? 'border-[#413383] bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">{precio.zonaNombre}</p>
                <p className="text-sm text-gray-500">
                  ${precio.precio.toLocaleString('es-CO')} por asiento
                </p>
              </div>
              {isSelected && (
                <div className="flex items-center gap-2">
                  <label className="text-xs text-gray-500">Cantidad:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={seleccion.cantidad}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleCantidad(precio, parseInt(e.target.value) || 1)}
                    className="w-20 rounded-md border border-gray-300 px-2 py-1 text-center text-sm focus:border-[#413383] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
