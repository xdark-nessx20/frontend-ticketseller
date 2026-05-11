import { useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { AsignarAsientosZonaRequest } from '../../types/asiento.types';

export function useAsignarAsientosZona(recintoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zonaId, data }: { zonaId: string; data: AsignarAsientosZonaRequest }) =>
      tiposAsientoService.asignarAsientosAZona(recintoId, zonaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'mapa'] });
    },
  });
}
