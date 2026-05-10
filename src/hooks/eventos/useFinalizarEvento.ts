import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';

export function useFinalizarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventoService.finalizarEvento(eventoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento', eventoId] });
    },
  });
}
