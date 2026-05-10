import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { ConfigurarCategoriaRequest } from '../../types/recinto.types';

export function useConfigurarCategoria(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ConfigurarCategoriaRequest) =>
      recintosService.configurarCategoria(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId] });
    },
  });
}
