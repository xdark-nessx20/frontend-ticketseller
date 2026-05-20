import { useQuery } from '@tanstack/react-query';
import { inventarioService } from '../../services/inventarioService';

export function useInventarioEvento(eventoId: string) {
  return useQuery({
    queryKey: ['inventario', 'evento', eventoId],
    queryFn: () => inventarioService.getInventarioEvento(eventoId),
    refetchInterval: 30_000,
  });
}
