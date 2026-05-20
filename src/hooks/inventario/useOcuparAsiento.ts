import { useMutation, useQueryClient } from '@tanstack/react-query';
import { inventarioService } from '../../services/inventarioService';

export function useOcuparAsiento(eventoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (asientoId: string) => inventarioService.ocuparAsiento(eventoId, asientoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario', 'evento', eventoId] });
    },
  });
}
