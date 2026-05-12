import { useQuery } from '@tanstack/react-query';
import { tiposAsientoService } from '../../services/tiposAsientoService';

export function useMapaAsientos(recintoId: string) {
  return useQuery({
    queryKey: ['recintos', recintoId, 'mapa'],
    queryFn: () => tiposAsientoService.getMapaAsientos(recintoId),
    enabled: !!recintoId,
    staleTime: 30_000,
    retry: 1,
  });
}
