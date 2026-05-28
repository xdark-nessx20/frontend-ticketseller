import { Link } from 'react-router-dom';
import { useTransacciones } from '../../hooks/transacciones/useTransacciones';
import { useDiscrepancias } from '../../hooks/transacciones/useDiscrepancias';
import { useTransaccionesStore } from '../../stores/transaccionesStore';
import { TransaccionFiltros } from '../../components/transacciones/TransaccionFiltros';
import { TransaccionesTable } from '../../components/transacciones/TransaccionesTable';

export function TransaccionesPage() {
  const { filtros } = useTransaccionesStore();
  const { data: ventas = [], isLoading, error } = useTransacciones(filtros);
  const { data: discrepancias = [] } = useDiscrepancias();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">Transacciones</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Transacciones</h1>

        <Link
          to="/admin/transacciones/discrepancias"
          className="relative inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          Discrepancias
          {discrepancias.length > 0 && (
            <span className="inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {discrepancias.length}
            </span>
          )}
        </Link>
      </div>

      <TransaccionFiltros />

      <TransaccionesTable ventas={ventas} isLoading={isLoading} error={error} />
    </div>
  );
}
