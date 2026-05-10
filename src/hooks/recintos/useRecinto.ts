import { useQuery } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useRecinto(id: string) {
  return useQuery({
    queryKey: ['recintos', id],
    queryFn: () => recintosService.getRecinto(id),
    enabled: !!id,
  });
}
