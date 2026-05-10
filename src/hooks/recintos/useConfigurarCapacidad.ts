import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { ConfigurarCapacidadRequest } from '../../types/recinto.types';

export function useConfigurarCapacidad(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigurarCapacidadRequest) =>
      recintosService.configurarCapacidad(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId] });
    },
  });
}
