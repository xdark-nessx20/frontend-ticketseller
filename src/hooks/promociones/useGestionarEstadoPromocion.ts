import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { promocionesService } from '../../services/promocionesService';
import type { ActualizarEstadoPromocionRequest, EstadoPromocion } from '../../types/promociones.types';

const ESTADO_LABELS: Record<EstadoPromocion, string> = {
  ACTIVA: 'reanudada',
  PAUSADA: 'pausada',
  FINALIZADA: 'finalizada',
};

export function useGestionarEstadoPromocion(eventoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promocionId, data }: { promocionId: string; data: ActualizarEstadoPromocionRequest }) =>
      promocionesService.actualizarEstado(promocionId, data),
    onSuccess: (_result, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['promociones', eventoId] });
      sileo.success({
        title: 'Estado actualizado',
        description: `La promoción fue ${ESTADO_LABELS[data.estado]} exitosamente.`,
      });
    },
    onError: () => {
      sileo.error({ title: 'Error al actualizar estado', description: 'No se pudo cambiar el estado. Intenta de nuevo.' });
    },
  });
}
