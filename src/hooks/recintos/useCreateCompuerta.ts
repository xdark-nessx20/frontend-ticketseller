import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { CrearCompuertaRequest } from '../../types/recinto.types';

export function useCreateCompuerta(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearCompuertaRequest) => recintosService.createCompuerta(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'compuertas'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'estructura'] });
    },
  });
}
