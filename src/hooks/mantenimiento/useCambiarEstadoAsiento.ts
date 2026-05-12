import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import axios from 'axios';
import { asientoMantenimientoService } from '../../services/asientoMantenimientoService';
import type { CambiarEstadoRequest } from '../../types/mantenimiento.types';

export function useCambiarEstadoAsiento(eventoId: string, asientoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CambiarEstadoRequest) =>
      asientoMantenimientoService.cambiarEstado(eventoId, asientoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos', eventoId, 'asientos'] });
      queryClient.invalidateQueries({ queryKey: ['historial', eventoId, asientoId] });
      sileo.success({ title: 'Estado actualizado', description: 'El estado del asiento fue cambiado exitosamente.' });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 409) return;
      sileo.error({ title: 'Error al cambiar estado', description: 'No se pudo cambiar el estado del asiento.' });
    },
  });
}
