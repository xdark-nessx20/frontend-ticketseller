import axios from 'axios';
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
  //No existe en backend
  getAsientosEvento(eventoId: string) {
    return api
      .get<AsientoConEstadoResponse[]>(`/eventos/${eventoId}/asientos`)
      .then(r => r.data);
  },

  cambiarEstado(eventoId: string, asientoId: string, data: CambiarEstadoRequest) {
    return api
      .patch<AsientoConEstadoResponse>(`/eventos/${eventoId}/asientos/${asientoId}/estado`, data)
      .then(r => r.data);
  },

  cambiarEstadoMasivo(eventoId: string, data: CambiarEstadoMasivoRequest) {
    return api
      .patch<CambiarEstadoMasivoResponse>(`/eventos/${eventoId}/asientos/estado-masivo`, data)
      .then(r => r.data);
  },

  getHistorial(eventoId: string, asientoId: string) {
    return api
      .get<HistorialCambioResponse[]>(`/eventos/${eventoId}/asientos/${asientoId}/historial`)
      .then(r => r.data);
  },
};
