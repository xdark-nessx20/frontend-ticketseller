import { useNavigate, Link } from 'react-router-dom';
import { VenueForm } from '../../components/recintos/VenueForm';
import type { VenueFormValues } from '../../components/recintos/VenueForm';
import { useCreateRecinto } from '../../hooks/recintos/useCreateRecinto';

export function CreateVenuePage() {
  const navigate = useNavigate();
  const { mutate, isPending } = useCreateRecinto();

  function handleSubmit(data: VenueFormValues) {
    mutate(data, { onSuccess: () => navigate('/admin/recintos') });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <nav className="text-sm text-gray-500">
        <Link to="/admin/recintos" className="hover:underline">Recintos</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-gray-800">Nuevo recinto</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900">Nuevo recinto</h1>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <VenueForm onSubmit={handleSubmit} isPending={isPending} mode="create" />
      </div>
    </div>
  );
}
