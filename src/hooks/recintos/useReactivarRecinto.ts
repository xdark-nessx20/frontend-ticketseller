import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';

export function useReactivarRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recintosService.reactivarRecinto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      sileo.success({ title: 'Recinto reactivado', description: 'El recinto volvió a estar disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al reactivar recinto', description: 'No se pudo reactivar el recinto. Intenta de nuevo.' });
    },
  });
}
