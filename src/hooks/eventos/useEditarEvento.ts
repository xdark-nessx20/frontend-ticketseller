import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { eventoService } from '../../services/eventoService';
import type { EditarEventoRequest } from '../../types/evento.types';

export function useEditarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditarEventoRequest) => eventoService.editarEvento(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId] });
      sileo.success({ title: 'Evento actualizado', description: 'Los cambios del evento fueron guardados exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al editar evento', description: 'No se pudieron guardar los cambios. Intenta de nuevo.' });
    },
  });
}
