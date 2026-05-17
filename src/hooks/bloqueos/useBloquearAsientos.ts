import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { bloqueosService } from '../../services/bloqueosService';
import type { BloquearAsientosRequest } from '../../types/bloqueos.types';

export function useBloquearAsientos(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BloquearAsientosRequest) => bloqueosService.bloquearAsientos(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-bloqueos', eventoId] });
      sileo.success({ title: 'Asientos bloqueados', description: 'Los asientos fueron bloqueados exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al bloquear', description: 'No se pudieron bloquear los asientos. Intenta de nuevo.' });
    },
  });
}
