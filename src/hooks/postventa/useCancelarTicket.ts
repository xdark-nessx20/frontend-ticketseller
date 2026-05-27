import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import axios from 'axios';
import { postVentaService } from '../../services/postVentaService';
import type { CancelarTicketRequest } from '../../types/postventa.types';

export function useCancelarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelarTicketRequest) =>
      data.ticketIds.length === 1
        ? postVentaService.cancelarTicket(data.ticketIds[0])
        : postVentaService.cancelarVarios(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misTickets'] });
      sileo.success({ title: 'Tickets cancelados', description: 'La solicitud de reembolso fue creada correctamente.' });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 422) return;
      sileo.error({ title: 'Error al cancelar', description: 'No se pudieron cancelar los tickets. Intenta de nuevo.' });
    },
  });
}
