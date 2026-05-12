import { useQuery } from '@tanstack/react-query';
import { promocionesService } from '../../services/promocionesService';

export function useDescuentos(promocionId: string) {
  return useQuery({
    queryKey: ['descuentos', promocionId],
    queryFn: () => promocionesService.getDescuentos(promocionId),
    enabled: !!promocionId,
  });
}
