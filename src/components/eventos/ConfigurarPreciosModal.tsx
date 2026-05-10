import { useState, useMemo } from 'react';
import axios from 'axios';
import { usePreciosZona } from '../../hooks/eventos/usePreciosZona';
import { useConfigurarPrecios } from '../../hooks/eventos/useConfigurarPrecios';
import { useZonas } from '../../hooks/recintos/useZonas';
import { PreciosZonaTable } from './PreciosZonaTable';

interface ConfigurarPreciosModalProps {
  eventoId: string;
  recintoId: string;
  onClose: () => void;
}

export function ConfigurarPreciosModal({ eventoId, recintoId, onClose }: ConfigurarPreciosModalProps) {
  const { data: zonas, isLoading: loadingZonas } = useZonas(recintoId);
  const { data: preciosExistentes, isLoading: loadingPrecios } = usePreciosZona(eventoId);
  const { mutate, isPending } = useConfigurarPrecios(eventoId);

  const initialValores = useMemo<Record<string, number | ''>>(() => {
    if (!zonas || !preciosExistentes) return {};
    const map: Record<string, number | ''> = {};
    zonas.forEach(z => {
      const existing = preciosExistentes.find(p => p.zonaId === z.id);
      map[z.id] = existing ? existing.precio : '';
    });
    return map;
  }, [zonas, preciosExistentes]);

  const [overrides, setOverrides] = useState<Record<string, number | ''>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const valores = { ...initialValores, ...overrides };

  function handleChange(zonaId: string, precio: number | '') {
    setOverrides(prev => ({ ...prev, [zonaId]: precio }));
    setValidationError(null);
  }

  function handleSubmit() {
    const zonasSinPrecio = (zonas ?? []).filter(z => valores[z.id] === '' || valores[z.id] === undefined);
    if (zonasSinPrecio.length > 0) {
      setValidationError(`Falta precio para: ${zonasSinPrecio.map(z => z.nombre).join(', ')}`);
      return;
    }

    const precios = (zonas ?? []).map(z => ({
      zonaId: z.id,
      precio: valores[z.id] as number,
    }));

    mutate(
      { precios },
      {
        onSuccess: onClose,
        onError: err => {
          if (axios.isAxiosError(err) && err.response?.status === 422) {
            setApiError(
              err.response.data?.message ?? 'Todas las zonas deben tener precio configurado.',
            );
          } else {
            setApiError('Error al guardar los precios. Intente de nuevo.');
          }
        },
      },
    );
  }

  const isLoading = loadingZonas || loadingPrecios;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-800">Configurar precios por zona</h2>

        {isLoading && (
          <div className="mt-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded-md bg-gray-100" />
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="mt-4">
            <PreciosZonaTable
              mode="edit"
              zonas={zonas ?? []}
              valores={valores}
              onChange={handleChange}
            />
          </div>
        )}

        {validationError && (
          <p className="mt-3 text-sm text-red-600">{validationError}</p>
        )}

        {apiError && (
          <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{apiError}</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || isLoading}
            className="rounded-md bg-[#413383] px-4 py-2 text-sm font-medium text-white hover:bg-[#413383]/85 disabled:opacity-50"
          >
            {isPending ? 'Guardando…' : 'Guardar precios'}
          </button>
        </div>
      </div>
    </div>
  );
}
