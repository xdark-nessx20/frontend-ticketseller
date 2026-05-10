import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { eventoService } from '../../services/eventoService';
import type { CrearEventoRequest } from '../../types/evento.types';

export function useCrearEvento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearEventoRequest) => eventoService.crearEvento(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
      sileo.success({ title: 'Evento creado', description: 'El evento fue registrado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear evento', description: 'No se pudo registrar el evento. Intenta de nuevo.' });
    },
  });
}
