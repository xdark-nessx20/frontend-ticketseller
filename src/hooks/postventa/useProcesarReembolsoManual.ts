import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { postVentaService } from '../../services/postVentaService';
import type { ReembolsoManualRequest } from '../../types/postventa.types';

export function useProcesarReembolsoManual(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReembolsoManualRequest) =>
      postVentaService.procesarReembolso(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsosPendientes'] });
      sileo.success({ title: 'Reembolso procesado', description: 'El reembolso fue procesado correctamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al procesar', description: 'No se pudo procesar el reembolso. Intenta de nuevo.' });
    },
  });
}
