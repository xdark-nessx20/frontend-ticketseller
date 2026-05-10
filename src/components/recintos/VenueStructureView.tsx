import { useRecintoEstructura } from '../../hooks/recintos/useRecintoEstructura';

interface VenueStructureViewProps {
  recintoId: string;
}

export function VenueStructureView({ recintoId }: VenueStructureViewProps) {
  const { data, isLoading, error } = useRecintoEstructura(recintoId);

  if (isLoading) return <p className="text-sm text-gray-400">Cargando estructura…</p>;
  if (error) return <p className="text-sm text-red-500">Error al cargar la estructura.</p>;
  if (!data) return null;

  const zonas = data.zonas ?? [];
  const compuertas = data.compuertas ?? [];

  return (
    <div className="space-y-4">
      {zonas.map(zona => {
        const compuertasZona = compuertas.filter(c => c.zonaId === zona.id);
        return (
          <div key={zona.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-gray-800">{zona.nombre}</span>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>{zona.tipo}</span>
                <span>{(zona.capacidad ?? 0).toLocaleString()} personas</span>
              </div>
            </div>
            {compuertasZona.length > 0 && (
              <ul className="mt-2 space-y-1 pl-4">
                {compuertasZona.map(c => (
                  <li key={c.id} className="text-sm text-gray-600">
                    {c.nombre}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {compuertas.filter(c => c.esGeneral).length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <span className="font-semibold text-gray-800">Compuertas generales</span>
          <ul className="mt-2 space-y-1 pl-4">
            {compuertas
              .filter(c => c.esGeneral)
              .map(c => (
                <li key={c.id} className="text-sm text-gray-600">{c.nombre}</li>
              ))}
          </ul>
        </div>
      )}

      {zonas.length === 0 && compuertas.length === 0 && (
        <p className="text-sm text-gray-400">
          No hay zonas ni compuertas configuradas para este recinto.
        </p>
      )}
    </div>
  );
}
