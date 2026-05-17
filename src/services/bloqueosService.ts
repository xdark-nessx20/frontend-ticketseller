import axios from 'axios';
import type {
  BloqueoResponse,
  CortesiaResponse,
  PanelItemResponse,
  PanelFiltros,
  BloquearAsientosRequest,
  CrearCortesiaRequest,
  EditarBloqueoRequest,
} from '../types/bloqueos.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const bloqueosService = {
  async getPanel(eventoId: string, filtros?: PanelFiltros) {
    const r = await api.get<PanelItemResponse[]>(`/admin/eventos/${eventoId}/bloqueos`, { params: filtros });
    return r.data;
  },

  async bloquearAsientos(eventoId: string, data: BloquearAsientosRequest) {
    const r = await api.post<BloqueoResponse>(`/admin/eventos/${eventoId}/bloqueos`, data);
    return r.data;
  },

  async editarBloqueo(bloqueoId: string, data: EditarBloqueoRequest) {
    const r = await api.patch<BloqueoResponse>(`/admin/bloqueos/${bloqueoId}`, data);
    return r.data;
  },

  async liberarBloqueo(bloqueoId: string) {
    await api.delete(`/admin/bloqueos/${bloqueoId}`);
  },

  async crearCortesia(eventoId: string, data: CrearCortesiaRequest) {
    const r = await api.post<CortesiaResponse>(`/admin/eventos/${eventoId}/cortesias`, data);
    return r.data;
  },
};
