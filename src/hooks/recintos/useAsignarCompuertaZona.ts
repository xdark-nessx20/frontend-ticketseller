import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';

export function useAsignarCompuertaZona(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zonaId, compuertaId }: { zonaId: string; compuertaId: string }) =>
      recintosService.asignarCompuertaZona(zonaId, compuertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'compuertas'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'estructura'] });
    },
  });
}
