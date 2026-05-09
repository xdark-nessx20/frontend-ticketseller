import { useNavigate, useParams, Link } from 'react-router-dom';
import { VenueForm } from '../../components/recintos/VenueForm';
import type { VenueFormValues } from '../../components/recintos/VenueForm';
import { useRecinto } from '../../hooks/recintos/useRecinto';
import { useEditRecinto } from '../../hooks/recintos/useEditRecinto';

export function EditVenuePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: recinto, isLoading, error } = useRecinto(id!);
  const { mutate, isPending } = useEditRecinto(id!);

  function handleSubmit(data: VenueFormValues) {
    mutate(data, { onSuccess: () => navigate(`/admin/recintos/${id}`) });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-100" />
        <div className="mt-6 space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />)}
        </div>
      </div>
    );
  }

  if (error || !recinto) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <p className="text-sm text-red-500">No se pudo cargar el recinto.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/recintos" className="hover:underline">Recintos</Link>
        <span className="mx-2">/</span>
        <Link to={`/admin/recintos/${id}`} className="hover:underline">{recinto.nombre}</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">Editar</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">Editar {recinto.nombre}</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <VenueForm
          onSubmit={handleSubmit}
          isPending={isPending}
          mode="edit"
          defaultValues={{
            nombre: recinto.nombre,
            ciudad: recinto.ciudad,
            direccion: recinto.direccion,
            capacidadMaxima: recinto.capacidadMaxima,
            telefono: recinto.telefono,
            compuertasIngreso: recinto.compuertasIngreso,
          }}
        />
      </div>
    </div>
  );
}
