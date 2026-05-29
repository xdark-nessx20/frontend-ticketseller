import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-5xl font-bold text-[#413383]">403</h1>
      <p className="text-gray-600 text-lg">No tienes permiso para acceder a esta página.</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-2 bg-[#413383] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#332970] transition-colors"
      >
        Volver
      </button>
    </div>
  );
}
