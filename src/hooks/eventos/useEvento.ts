import { useQuery } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';

export function useEvento(eventoId: string) {
  return useQuery({
    queryKey: ['eventos', eventoId],
    queryFn: () => eventoService.getEvento(eventoId),
    enabled: !!eventoId,
  });
}
