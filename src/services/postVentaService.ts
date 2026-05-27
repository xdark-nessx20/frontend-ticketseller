import axios from 'axios';
import type {
  TicketConReembolsoResponse,
  CancelacionResponse,
  CancelarTicketRequest,
  CambiarEstadoTicketRequest,
  ReembolsoManualRequest,
  ReembolsoAdminResponse,
} from '../types/postventa.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
});

export const postVentaService = {
  async getMisCompras() {
    const r = await api.get<TicketConReembolsoResponse[]>('/compras/mis-compras');
    return r.data;
  },

  async cancelarTickets(data: CancelarTicketRequest) {
    const r = await api.post<CancelacionResponse>('/tickets/cancelar-parcial', data);
    return r.data;
  },

  async cambiarEstadoTicket(ticketId: string, data: CambiarEstadoTicketRequest) {
    const r = await api.patch<TicketConReembolsoResponse>(`/admin/tickets/${ticketId}/estado`, data);
    return r.data;
  },

  async procesarReembolso(ticketId: string, data: ReembolsoManualRequest) {
    const r = await api.post<ReembolsoAdminResponse>(`/admin/tickets/${ticketId}/reembolso`, data);
    return r.data;
  },

  async getReembolsosPendientes() {
    const r = await api.get<ReembolsoAdminResponse[]>('/admin/reembolsos');
    return r.data;
  },
};
