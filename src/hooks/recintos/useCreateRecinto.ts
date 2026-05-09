import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { CrearRecintoRequest } from '../../types/recinto.types';

export function useCreateRecinto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearRecintoRequest) => recintosService.createRecinto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
    },
  });
}
