import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { eventoService } from '../../services/eventoService';
import type { CancelarEventoRequest } from '../../types/evento.types';

export function useCancelarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelarEventoRequest) => eventoService.cancelarEvento(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      sileo.warning({ title: 'Evento cancelado', description: 'El evento fue cancelado correctamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al cancelar evento', description: 'No se pudo cancelar el evento. Intenta de nuevo.' });
    },
  });
}
