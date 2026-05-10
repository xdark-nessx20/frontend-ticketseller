import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';

export function useDesactivarRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recintosService.desactivarRecinto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      sileo.warning({ title: 'Recinto desactivado', description: 'El recinto fue desactivado y ya no está disponible.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al desactivar recinto', description: 'No se pudo desactivar el recinto. Intenta de nuevo.' });
    },
  });
}
