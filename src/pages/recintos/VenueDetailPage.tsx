import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRecinto } from '../../hooks/recintos/useRecinto';
import { StatusBadge } from '../../components/recintos/StatusBadge';
import { CapacityConfigModal } from '../../components/recintos/CapacityConfigModal';
import { CategoryConfigModal } from '../../components/recintos/CategoryConfigModal';
import { ZonePanel } from '../../components/recintos/ZonePanel';
import { GatePanel } from '../../components/recintos/GatePanel';
import { VenueStructureView } from '../../components/recintos/VenueStructureView';

export function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: recinto, isLoading, error } = useRecinto(id!);

  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 p-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error || !recinto) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar el recinto.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/recintos" className="hover:underline">Recintos</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">{recinto.nombre}</span>
      </nav>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{recinto.nombre}</h1>
          <p className="mt-1 text-sm text-gray-500">{recinto.ciudad} · {recinto.direccion}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge activo={recinto.activo} />
          <Link
            to={`/admin/recintos/${id}/editar`}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Editar
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Capacidad</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{recinto.capacidadMaxima.toLocaleString()}</p>
          <button
            onClick={() => setShowCapacityModal(true)}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Configurar
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Categoría</p>
          <p className="mt-1 text-lg font-semibold text-gray-800">{recinto.categoria ?? '—'}</p>
          <button
            onClick={() => setShowCategoryModal(true)}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Configurar
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Compuertas</p>
          <p className="mt-1 text-xl font-bold text-gray-900">{recinto.compuertasIngreso}</p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs font-medium uppercase text-gray-400">Teléfono</p>
          <p className="mt-1 text-sm text-gray-800">{recinto.telefono}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ZonePanel recintoId={id!} />
        <GatePanel recintoId={id!} />
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Estructura del recinto</h2>
        <VenueStructureView recintoId={id!} />
      </div>

      {showCapacityModal && (
        <CapacityConfigModal
          recintoId={id!}
          capacidadActual={recinto.capacidadMaxima}
          onClose={() => setShowCapacityModal(false)}
        />
      )}

      {showCategoryModal && (
        <CategoryConfigModal
          recintoId={id!}
          categoriaActual={recinto.categoria}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
}
