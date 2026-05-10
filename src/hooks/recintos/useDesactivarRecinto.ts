import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useDesactivarRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recintosService.desactivarRecinto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
    },
  });
}
