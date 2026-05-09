import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { EditarRecintoRequest } from '../../types/recinto.types';

export function useEditRecinto(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditarRecintoRequest) => recintosService.editRecinto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', id] });
    },
  });
}
