import { useQuery } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useCompuertas(recintoId: string) {
  return useQuery({
    queryKey: ['recintos', recintoId, 'compuertas'],
    queryFn: () => recintosService.getCompuertas(recintoId),
    enabled: !!recintoId,
  });
}
