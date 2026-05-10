import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { eventoService } from '../../services/eventoService';

export function useIniciarEvento(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => eventoService.iniciarEvento(eventoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      queryClient.invalidateQueries({ queryKey: ['evento', eventoId] });
      sileo.success({ title: 'Evento iniciado', description: 'El evento fue puesto en marcha exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al iniciar evento', description: 'No se pudo iniciar el evento. Intenta de nuevo.' });
    },
  });
}
