import { useQuery } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useRecintoEstructura(id: string) {
  return useQuery({
    queryKey: ['recintos', id, 'estructura'],
    queryFn: () => recintosService.getEstructura(id),
    enabled: !!id,
  });
}
