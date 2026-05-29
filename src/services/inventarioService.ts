import { api } from '../api/apiClient';
import type { AsientoInventarioResponse, DisponibilidadResponse } from '../types/inventario.types';

export const inventarioService = {
  async getInventarioEvento(eventoId: string) {
    const r = await api.get<AsientoInventarioResponse[]>(`/eventos/${eventoId}/inventario`);
    return r.data;
  },

  async verificarDisponibilidad(eventoId: string, asientoId: string) {
    const r = await api.get<DisponibilidadResponse>(
      `/eventos/${eventoId}/inventario/${asientoId}/disponibilidad`,
    );
    return r.data;
  },

  async ocuparAsiento(eventoId: string, asientoId: string) {
    const r = await api.patch<DisponibilidadResponse>(`/eventos/${eventoId}/inventario/${asientoId}/ocupar`);
    return r.data;
  },

  async liberarAsiento(eventoId: string, asientoId: string) {
    const r = await api.patch<DisponibilidadResponse>(`/eventos/${eventoId}/inventario/${asientoId}/liberar`);
    return r.data;
  },
};
