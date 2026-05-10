import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recintosService } from '../../services/recintosService';
import type { CrearZonaRequest } from '../../types/recinto.types';

export function useCreateZona(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CrearZonaRequest) => recintosService.createZona(recintoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'zonas'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'estructura'] });
    },
  });
}
