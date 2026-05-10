import { useMutation, useQueryClient } from '@tanstack/react-query';
import { eventoService } from '../../services/eventoService';
import type { ConfigurarPreciosRequest } from '../../types/evento.types';

export function useConfigurarPrecios(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigurarPreciosRequest) => eventoService.configurarPrecios(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId, 'precios'] });
    },
  });
}
