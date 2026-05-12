import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { asientoMantenimientoService } from '../../services/asientoMantenimientoService';
import type { CambiarEstadoMasivoRequest } from '../../types/mantenimiento.types';

export function useCambiarEstadoMasivo(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CambiarEstadoMasivoRequest) =>
      asientoMantenimientoService.cambiarEstadoMasivo(eventoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId, 'asientos'] });
    },
    onError: () => {
      sileo.error({ title: 'Error en cambio masivo', description: 'No se pudo procesar el cambio de estado en masa.' });
    },
  });
}
