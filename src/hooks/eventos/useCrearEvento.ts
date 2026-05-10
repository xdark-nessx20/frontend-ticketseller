import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';
import type { CrearEventoRequest } from '../../types/evento.types';

export function useCrearEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearEventoRequest) => eventoService.crearEvento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
}
