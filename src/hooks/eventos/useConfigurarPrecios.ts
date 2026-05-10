import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { eventoService } from '../../services/eventoService';
import type { ConfigurarPreciosRequest } from '../../types/evento.types';

export function useConfigurarPrecios(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigurarPreciosRequest) => eventoService.configurarPrecios(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId, 'precios'] });
      sileo.success({ title: 'Precios configurados', description: 'Los precios por zona fueron actualizados.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al configurar precios', description: 'No se pudieron guardar los precios. Intenta de nuevo.' });
    },
  });
}
