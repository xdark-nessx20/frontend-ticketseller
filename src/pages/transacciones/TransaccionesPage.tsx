import { useTransacciones } from '../../hooks/transacciones/useTransacciones';
import { useTransaccionesStore } from '../../stores/transaccionesStore';
import { TransaccionFiltros } from '../../components/transacciones/TransaccionFiltros';
import { TransaccionesTable } from '../../components/transacciones/TransaccionesTable';

export function TransaccionesPage() {
  const { filtros } = useTransaccionesStore();
  const { data: ventas = [], isLoading, error } = useTransacciones(filtros);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">Transacciones</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">Gestión de Transacciones</h1>

      <TransaccionFiltros />

      <TransaccionesTable ventas={ventas} isLoading={isLoading} error={error} />
    </div>
  );
}
