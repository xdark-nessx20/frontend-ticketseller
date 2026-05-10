import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';
import type { EditarRecintoRequest } from '../../types/recinto.types';

export function useEditRecinto(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditarRecintoRequest) => recintosService.editRecinto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', id] });
      sileo.success({ title: 'Recinto actualizado', description: 'Los cambios fueron guardados exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al editar recinto', description: 'No se pudieron guardar los cambios. Intenta de nuevo.' });
    },
  });
}
