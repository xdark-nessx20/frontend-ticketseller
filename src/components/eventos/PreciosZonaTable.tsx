import type { PrecioZonaResponse } from '../../types/evento.types';

interface ViewMode {
  mode: 'view';
  precios: PrecioZonaResponse[];
}

interface EditMode {
  mode: 'edit';
  zonas: { id: string; nombre: string }[];
  valores: Record<string, number | ''>;
  onChange: (zonaId: string, precio: number | '') => void;
}

type PreciosZonaTableProps = ViewMode | EditMode;

export function PreciosZonaTable(props: PreciosZonaTableProps) {
  if (props.mode === 'view') {
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Zona</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Precio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {props.precios.map(p => (
              <tr key={p.id} className="bg-[#F6F3EA]">
                <td className="px-4 py-3 text-gray-800">{p.zonaNombre}</td>
                <td className="px-4 py-3 text-right text-gray-800">
                  ${p.precio.toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
            {props.precios.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-gray-400">
                  Sin precios configurados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-gray-600">Zona</th>
            <th className="px-4 py-3 text-right font-semibold text-gray-600">Precio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {props.zonas.map(z => (
            <tr key={z.id} className="bg-[#F6F3EA]">
              <td className="px-4 py-3 text-gray-800">{z.nombre}</td>
              <td className="px-4 py-3">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={props.valores[z.id] ?? ''}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    props.onChange(z.id, val);
                  }}
                  className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-right focus:border-blue-500 focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
