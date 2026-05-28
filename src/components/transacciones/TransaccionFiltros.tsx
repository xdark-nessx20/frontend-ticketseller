import { useTransaccionesStore } from '../../stores/transaccionesStore';
import type { EstadoVenta } from '../../types/checkout.types';

const ESTADO_OPCIONES: { value: EstadoVenta; label: string }[] = [
  { value: 'PENDIENTE', label: 'Pendiente' },
  { value: 'RESERVADA', label: 'Reservada' },
  { value: 'COMPLETADA', label: 'Completada' },
  { value: 'EXPIRADA', label: 'Expirada' },
  { value: 'FALLIDA', label: 'Fallida' },
  { value: 'REEMBOLSADA', label: 'Reembolsada' },
];

export function TransaccionFiltros() {
  const { filtros, setFiltro, resetFiltros } = useTransaccionesStore();

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-gray-200 bg-white p-4">
      <div className="min-w-[160px] flex-1">
        <label className="block text-xs font-medium text-gray-600">Estado</label>
        <select
          value={filtros.estado ?? ''}
          onChange={e => setFiltro('estado', (e.target.value as EstadoVenta) || undefined)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        >
          <option value="">Todos</option>
          {ESTADO_OPCIONES.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="min-w-[180px] flex-1">
        <label className="block text-xs font-medium text-gray-600">ID de evento</label>
        <input
          type="text"
          value={filtros.eventoId ?? ''}
          onChange={e => setFiltro('eventoId', e.target.value || undefined)}
          placeholder="UUID del evento"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        />
      </div>

      <div className="min-w-[160px] flex-1">
        <label className="block text-xs font-medium text-gray-600">Desde</label>
        <input
          type="date"
          value={filtros.fechaDesde ?? ''}
          onChange={e => setFiltro('fechaDesde', e.target.value || undefined)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        />
      </div>

      <div className="min-w-[160px] flex-1">
        <label className="block text-xs font-medium text-gray-600">Hasta</label>
        <input
          type="date"
          value={filtros.fechaHasta ?? ''}
          onChange={e => setFiltro('fechaHasta', e.target.value || undefined)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#413383] focus:outline-none"
        />
      </div>

      <button
        onClick={resetFiltros}
        className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
