import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import { postVentaService } from '../../services/postVentaService';
import type { CambiarEstadoTicketRequest } from '../../types/postventa.types';

export function useCambiarEstadoTicketAdmin(ticketId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CambiarEstadoTicketRequest) =>
      postVentaService.cambiarEstadoTicket(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reembolsosPendientes'] });
      sileo.success({ title: 'Estado actualizado', description: 'El estado del ticket fue cambiado exitosamente.' });
    },
    onError: () => {
      sileo.error({ title: 'Error al cambiar estado', description: 'No se pudo cambiar el estado del ticket.' });
    },
  });
}
