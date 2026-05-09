import { Link } from 'react-router-dom';
import { useRecintos } from '../../hooks/recintos/useRecintos';
import { useRecintosStore } from '../../stores/recintosStore';
import { VenueTable } from '../../components/recintos/VenueTable';
import { VenueFilters } from '../../components/recintos/VenueFilters';

export function VenueListPage() {
  const { filtros, setPage } = useRecintosStore();
  const { data, isLoading, error } = useRecintos(filtros);

  const recintos = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const currentPage = filtros.page ?? 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <span className="font-medium text-gray-800">Recintos</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Recintos</h1>
        <Link
          to="/admin/recintos/nuevo"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Nuevo recinto
        </Link>
      </div>

      <VenueFilters />

      {isLoading && (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-md bg-gray-100" />
          ))}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">Error al cargar los recintos. Intente de nuevo.</p>
      )}

      {!isLoading && !error && <VenueTable recintos={recintos} />}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Página {currentPage + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage === 0}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
