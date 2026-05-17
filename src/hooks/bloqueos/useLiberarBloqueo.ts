import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { bloqueosService } from '../../services/bloqueosService';

export function useLiberarBloqueo(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bloqueoId: string) => bloqueosService.liberarBloqueo(bloqueoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-bloqueos', eventoId] });
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId, 'asientos'] });
      sileo.success({ title: 'Bloqueo liberado', description: 'El asiento volvió a estado disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al liberar', description: 'No se pudo liberar el bloqueo. Intenta de nuevo.' });
    },
  });
}
