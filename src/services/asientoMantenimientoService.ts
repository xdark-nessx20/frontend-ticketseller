import { api } from './api';
import type {
  AsientoConEstadoResponse,
  CambiarEstadoRequest,
  CambiarEstadoMasivoRequest,
  CambiarEstadoMasivoResponse,
  HistorialCambioResponse,
} from '../types/mantenimiento.types';

export const asientoMantenimientoService = {
  async getAsientosEvento(eventoId: string) {
    const r = await api
        .get<AsientoConEstadoResponse[]>(`/eventos/${eventoId}/asientos`);
    return r.data;
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
