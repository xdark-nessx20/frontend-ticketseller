import { useQuery } from '@tanstack/react-query';
import { promocionesService } from '../../services/promocionesService';

export function usePromociones(eventoId: string) {
  return useQuery({
    queryKey: ['promociones', eventoId],
    queryFn: () => promocionesService.getPromociones(eventoId),
    enabled: !!eventoId,
  });
}
