import { useQuery } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useZonas(recintoId: string) {
  return useQuery({
    queryKey: ['recintos', recintoId, 'zonas'],
    queryFn: () => recintosService.getZonas(recintoId),
    enabled: !!recintoId,
  });
}
