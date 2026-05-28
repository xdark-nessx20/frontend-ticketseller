import { useDiscrepancias } from '../../hooks/transacciones/useDiscrepancias';
import { DiscrepanciasTable } from '../../components/transacciones/DiscrepanciasTable';

export function DiscrepanciasPage() {
  const { data: pagos = [], isLoading, error } = useDiscrepancias();

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <span
          className="cursor-pointer hover:text-gray-700"
          onClick={() => window.history.back()}
        >
          Transacciones
        </span>
        <span className="mx-1">›</span>
        <span className="font-medium text-gray-800">Discrepancias</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Discrepancias de pago</h1>
          {!isLoading && !error && pagos.length > 0 && (
            <p className="mt-1 text-sm text-gray-500">
              {pagos.length} discrepancia{pagos.length !== 1 ? 's' : ''} pendiente{pagos.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      <DiscrepanciasTable pagos={pagos} isLoading={isLoading} error={error} />
    </div>
  );
}
