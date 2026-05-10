import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { recintosService } from '../../services/recintosService';

export function useAsignarCompuertaZona(recintoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ zonaId, compuertaId }: { zonaId: string; compuertaId: string }) =>
      recintosService.asignarCompuertaZona(zonaId, compuertaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'compuertas'] });
      queryClient.invalidateQueries({ queryKey: ['recintos', recintoId, 'estructura'] });
      sileo.success({ title: 'Compuerta asignada', description: 'La compuerta fue asignada a la zona correctamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al asignar compuerta', description: 'No se pudo asignar la compuerta a la zona. Intenta de nuevo.' });
    },
  });
}
