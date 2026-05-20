import type { AsientoInventarioResponse } from '../../types/inventario.types';

interface InventarioResumenProps {
  asientos: AsientoInventarioResponse[];
}

interface TarjetaConteoProps {
  label: string;
  valor: number;
  colorTexto: string;
  colorFondo: string;
}

function TarjetaConteo({ label, valor, colorTexto, colorFondo }: TarjetaConteoProps) {
  return (
    <div className={`rounded-lg border border-gray-200 ${colorFondo} p-4`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold ${colorTexto}`}>{valor}</p>
    </div>
  );
}

export function InventarioResumen({ asientos }: InventarioResumenProps) {
  const totalAsientos = asientos.length;
  const disponibles = asientos.filter(a => a.estado === 'DISPONIBLE').length;
  const reservados = asientos.filter(a => a.estado === 'RESERVADO').length;
  const ocupados = asientos.filter(a => a.estado === 'OCUPADO' || a.estado === 'VENDIDO').length;
  const bloqueados = asientos.filter(a => a.estado === 'BLOQUEADO').length;
  const ocupacionPct =
    totalAsientos > 0 ? Math.round(((ocupados + reservados) / totalAsientos) * 100) : 0;

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <TarjetaConteo
        label="Disponibles"
        valor={disponibles}
        colorTexto="text-emerald-600"
        colorFondo="bg-emerald-50"
      />
      <TarjetaConteo
        label="Reservados (hold)"
        valor={reservados}
        colorTexto="text-yellow-700"
        colorFondo="bg-yellow-50"
      />
      <TarjetaConteo
        label="Vendidos / Ocupados"
        valor={ocupados}
        colorTexto="text-red-600"
        colorFondo="bg-red-50"
      />
      <TarjetaConteo
        label="Bloqueados"
        valor={bloqueados}
        colorTexto="text-orange-600"
        colorFondo="bg-orange-50"
      />
      <div className="col-span-2 rounded-lg border border-gray-200 bg-white p-4 sm:col-span-4">
        <p className="text-sm text-gray-500">Ocupación total</p>
        <p className="text-2xl font-bold text-gray-900">{ocupacionPct}%</p>
        <p className="text-xs text-gray-400">{totalAsientos} asientos en total</p>
      </div>
    </div>
  );
}
