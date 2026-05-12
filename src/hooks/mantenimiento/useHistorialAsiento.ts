import { useQuery } from '@tanstack/react-query';
import { asientoMantenimientoService } from '../../services/asientoMantenimientoService';

export function useHistorialAsiento(eventoId: string, asientoId: string) {
  return useQuery({
    queryKey: ['historial', eventoId, asientoId],
    queryFn: () => asientoMantenimientoService.getHistorial(eventoId, asientoId),
    enabled: !!eventoId && !!asientoId,
  });
}
