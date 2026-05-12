import { useQuery } from '@tanstack/react-query';
import { promocionesService } from '../../services/promocionesService';

export function useObtenerCodigos(promocionId: string) {
  return useQuery({
    queryKey: ['codigos', promocionId],
    queryFn: () => promocionesService.obtenerCodigos(promocionId),
    enabled: !!promocionId,
  });
}
