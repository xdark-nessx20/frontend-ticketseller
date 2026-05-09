import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useReactivarRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recintosService.reactivarRecinto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
    },
  });
}
