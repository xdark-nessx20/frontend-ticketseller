import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '../../services/inventarioService';

export function useLiberarAsiento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asientoId: string) => inventarioService.liberarAsiento(eventoId, asientoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario', 'evento', eventoId] });
    },
  });
}
