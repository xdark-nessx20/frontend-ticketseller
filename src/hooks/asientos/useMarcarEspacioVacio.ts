import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { AsientoResponse } from '../../types/asiento.types';

export function useMarcarEspacioVacio(recintoId: string) {
  const queryClient = useQueryClient();
  const queryKey = ['recintos', recintoId, 'mapa'] as const;

  return useMutation({
    mutationFn: ({ asientoId }: { asientoId: string }) =>
      tiposAsientoService.marcarEspacioVacio(recintoId, asientoId),
    onMutate: async ({ asientoId }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<AsientoResponse[]>(queryKey);
      queryClient.setQueryData<AsientoResponse[]>(queryKey, old =>
        old?.map(a => {
          if (a.id !== asientoId) return a;
          const nuevoEstado = a.estado === 'INACTIVO' ? 'DISPONIBLE' : 'INACTIVO';
          return { ...a, estado: nuevoEstado, existente: nuevoEstado !== 'INACTIVO' };
        }),
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
