import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';
import type { CancelarEventoRequest } from '../../types/evento.types';

export function useCancelarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelarEventoRequest) => eventoService.cancelarEvento(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
}
