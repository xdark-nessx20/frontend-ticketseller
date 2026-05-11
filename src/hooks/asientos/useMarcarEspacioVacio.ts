import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { MarcarEspacioVacioRequest, AsientoResponse } from '../../types/asiento.types';

interface MarcarParams {
  asientoId: string;
  data: MarcarEspacioVacioRequest;
}

export function useMarcarEspacioVacio(recintoId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['recintos', recintoId, 'mapa'] as const;

  return useMutation({
    mutationFn: ({ asientoId, data }: MarcarParams) =>
      tiposAsientoService.marcarEspacioVacio(recintoId, asientoId, data),
    onMutate: async ({ asientoId, data }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AsientoResponse[]>(queryKey);
      queryClient.setQueryData<AsientoResponse[]>(queryKey, old =>
        old?.map(a => a.id === asientoId ? { ...a, existente: data.existente } : a)
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
