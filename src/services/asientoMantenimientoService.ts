import axios from 'axios';
import type { Page } from '../types/asiento.types';
import type {
  AsientoConEstadoResponse,
  CambiarEstadoRequest,
  CambiarEstadoMasivoRequest,
  CambiarEstadoMasivoResponse,
  HistorialCambioResponse,
} from '../types/mantenimiento.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const asientoMantenimientoService = {
  async getAsientosEvento(eventoId: string) {
    const r = await api
        .get<AsientoConEstadoResponse[] | Page<AsientoConEstadoResponse>>(`/eventos/${eventoId}/asientos`, {
          params: {size: 5000},
        });
    return (Array.isArray(r.data) ? r.data : r.data.content);
  },

  async cambiarEstado(eventoId: string, asientoId: string, data: CambiarEstadoRequest) {
    const r = await api
        .patch<AsientoConEstadoResponse>(`/eventos/${eventoId}/asientos/${asientoId}/estado`, data);
    return r.data;
  },

  async cambiarEstadoMasivo(eventoId: string, data: CambiarEstadoMasivoRequest) {
    const r = await api
        .patch<CambiarEstadoMasivoResponse>(`/eventos/${eventoId}/asientos/estado-masivo`, data);
    return r.data;
  },

  async getHistorial(eventoId: string, asientoId: string) {
    const r = await api
        .get<HistorialCambioResponse[]>(`/eventos/${eventoId}/asientos/${asientoId}/historial`);
    return r.data;
  },
};
