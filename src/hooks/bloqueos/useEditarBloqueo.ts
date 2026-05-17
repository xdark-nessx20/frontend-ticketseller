import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { bloqueosService } from '../../services/bloqueosService';
import type { EditarBloqueoRequest } from '../../types/bloqueos.types';

export function useEditarBloqueo(eventoId: string, bloqueoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditarBloqueoRequest) => bloqueosService.editarBloqueo(bloqueoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-bloqueos', eventoId] });
      sileo.success({ title: 'Bloqueo actualizado', description: 'El destinatario fue actualizado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al editar', description: 'No se pudo actualizar el bloqueo. Intenta de nuevo.' });
    },
  });
}
