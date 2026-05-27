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
  async getMisTickets(userId: string) {
    const r = await api.get<TicketConReembolsoResponse[]>('/compras/mis-compras', {
      headers: { 'X-Comprador-Id': userId },
    });
    return r.data;
  },

  async cancelarTicket(ticketId: string) {
    const r = await api.delete<CancelacionResponse>(`/tickets/${ticketId}/cancelar`);
    return r.data;
  },

  async cancelarVarios(data: CancelarTicketRequest) {
    const r = await api.delete<CancelacionResponse>('/tickets/cancelar-varios', { data });
    return r.data;
  },

  async cancelarPorEvento(eventoId: string) {
    await api.delete(`/tickets/eventos/${eventoId}/cancelar`);
  },

  async cambiarEstadoTicket(ticketId: string, data: CambiarEstadoTicketRequest) {
    const r = await api.patch<TicketConReembolsoResponse>(`/admin/tickets/${ticketId}/estado`, data);
    return r.data;
  },

  async procesarReembolso(ticketId: string, data: ReembolsoManualRequest) {
    const r = await api.post<ReembolsoAdminResponse>(`/admin/tickets/${ticketId}/reembolso`, data);
    return r.data;
  },

  async procesarColaReembolsos() {
    await api.post('/admin/reembolsos/procesar-cola');
  },

  async getReembolsosPendientes() {
    const r = await api.get<ReembolsoAdminResponse[]>('/admin/reembolsos/cola');
    return r.data;
  },
};
