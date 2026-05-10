import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';
import type { EditarEventoRequest } from '../../types/evento.types';

export function useEditarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditarEventoRequest) => eventoService.editarEvento(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId] });
    },
  });
}
