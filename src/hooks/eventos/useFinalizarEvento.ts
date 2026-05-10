import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { eventoService } from '../../services/eventoService';

export function useFinalizarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventoService.finalizarEvento(eventoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento', eventoId] });
      sileo.success({ title: 'Evento finalizado', description: 'El evento fue marcado como finalizado.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al finalizar evento', description: 'No se pudo finalizar el evento. Intenta de nuevo.' });
    },
  });
}
