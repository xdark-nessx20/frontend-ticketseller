import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePromociones } from '../../hooks/promociones/usePromociones';
import { useEvento } from '../../hooks/eventos/useEvento';
import { PromocionesTable } from '../../components/promociones/PromocionesTable';
import { CrearPromocionModal } from '../../components/promociones/CrearPromocionModal';

export function PromocionesPage() {
  const { eventoId } = useParams<{ eventoId: string }>();
  const { data: evento } = useEvento(eventoId!);
  const { data: promociones, isLoading } = usePromociones(eventoId!);
  const [showCrear, setShowCrear] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/eventos" className="hover:underline">
          Eventos
        </Link>
        <span className="mx-2">/</span>
        <Link to={`/admin/eventos/${eventoId}`} className="hover:underline">
          {evento?.nombre ?? '…'}
        </Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">Promociones</span>
      </nav>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Campañas y Descuentos</h1>
        <button
          onClick={() => setShowCrear(true)}
          className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#362B6E]"
        >
          Nueva Promoción
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      ) : (
        <PromocionesTable
          promociones={promociones ?? []}
          eventoId={eventoId!}
          recintoId={evento?.recintoId ?? ''}
        />
      )}

      {showCrear && (
        <CrearPromocionModal eventoId={eventoId!} onClose={() => setShowCrear(false)} />
      )}
    </div>
  );
}
