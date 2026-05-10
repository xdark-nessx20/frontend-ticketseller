import { useQuery } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';

export function usePreciosZona(eventoId: string) {
  return useQuery({
    queryKey: ['eventos', eventoId, 'precios'],
    queryFn: () => eventoService.getPrecios(eventoId),
    enabled: !!eventoId,
  });
}
