import { useQuery } from '@tanstack/react-query';
import { asientoMantenimientoService } from '../../services/asientoMantenimientoService';

export function useAsientosEvento(eventoId: string) {
  return useQuery({
    queryKey: ['eventos', eventoId, 'asientos'],
    queryFn: () => asientoMantenimientoService.getAsientosEvento(eventoId),
    enabled: !!eventoId,
  });
}
