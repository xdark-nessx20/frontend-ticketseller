import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { bloqueosService } from '../../services/bloqueosService';
import type { CrearCortesiaRequest } from '../../types/bloqueos.types';

export function useCrearCortesia(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearCortesiaRequest) => bloqueosService.crearCortesia(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-bloqueos', eventoId] });
      sileo.success({ title: 'Cortesía creada', description: 'El ticket de cortesía fue generado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al crear cortesía', description: 'No se pudo generar la cortesía. Intenta de nuevo.' });
    },
  });
}
