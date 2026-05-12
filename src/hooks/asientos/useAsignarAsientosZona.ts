import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { tiposAsientoService } from '../../services/tiposAsientoService';
import type { AsignarAsientosZonaRequest } from '../../types/asiento.types';

export function useAsignarAsientosZona(recintoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ zonaId, data }: { zonaId: string; data: AsignarAsientosZonaRequest }) =>
      tiposAsientoService.asignarAsientosAZona(recintoId, zonaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'mapa'] });
      sileo.success({ title: 'Asientos asignados', description: 'Los asientos se asignaron correctamente a la zona.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al asignar', description: 'No se pudieron asignar los asientos. Intenta de nuevo.' });
    },
  });
}
