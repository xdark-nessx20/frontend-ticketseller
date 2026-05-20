import { useQuery } from '@tanstack/react-query';
import { inventarioService } from '../../services/inventarioService';

export function useVerificarDisponibilidad(eventoId: string, asientoId: string) {
  return useQuery({
    queryKey: ['inventario', 'disponibilidad', eventoId, asientoId],
    queryFn: () => inventarioService.verificarDisponibilidad(eventoId, asientoId),
    enabled: !!asientoId,
    staleTime: 0,
  });
}
