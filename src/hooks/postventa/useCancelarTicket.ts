import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sileo } from 'sileo';
import axios from 'axios';
import { postVentaService } from '../../services/postVentaService';
import type { CancelarTicketRequest } from '../../types/postventa.types';

export function useCancelarTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CancelarTicketRequest) => postVentaService.cancelarTickets(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misCompras'] });
      sileo.success({ title: 'Tickets cancelados', description: 'La solicitud de reembolso fue creada correctamente.' });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 422) return;
      sileo.error({ title: 'Error al cancelar', description: 'No se pudieron cancelar los tickets. Intenta de nuevo.' });
    },
  });
}
