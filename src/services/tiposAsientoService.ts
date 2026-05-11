import axios from 'axios';
import type {
  TipoAsientoResponse,
  AsientoResponse,
  CrearTipoAsientoRequest,
  EditarTipoAsientoRequest,
  AsignarTipoAsientoRequest,
  AsignarAsientosZonaRequest,
  CrearMapaAsientosRequest,
  MarcarEspacioVacioRequest,
  TipoAsientoFiltros,
} from '../types/asiento.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const tiposAsientoService = {
  getTiposAsiento(filtros: TipoAsientoFiltros = {}) {
    return api.get<TipoAsientoResponse[]>('/tipos-asiento', { params: filtros }).then(r => r.data);
  },

  getTipoAsiento(id: string) {
    return api.get<TipoAsientoResponse>(`/tipos-asiento/${id}`).then(r => r.data);
  },

  createTipoAsiento(data: CrearTipoAsientoRequest) {
    return api.post<TipoAsientoResponse>('/tipos-asiento', data).then(r => r.data);
  },

  editTipoAsiento(id: string, data: EditarTipoAsientoRequest) {
    return api.put<TipoAsientoResponse>(`/tipos-asiento/${id}`, data).then(r => r.data);
  },

  desactivar(id: string) {
    return api.delete<void>(`/tipos-asiento/${id}/desactivar`).then(r => r.data);
  },

  asignarAZona(recintoId: string, zonaId: string, data: AsignarTipoAsientoRequest) {
    return api
      .post<void>(`/recintos/${recintoId}/zonas/${zonaId}/tipo-asiento`, data)
      .then(r => r.data);
  },

  asignarAsientosAZona(recintoId: string, zonaId: string, data: AsignarAsientosZonaRequest) {
    return api
      .post<void>(`/recintos/${recintoId}/zonas/${zonaId}/asientos`, data)
      .then(r => r.data);
  },

  getMapaAsientos(recintoId: string) {
    return api.get<AsientoResponse[]>(`/recintos/${recintoId}/mapa/asientos`).then(r => r.data);
  },

  crearMapaAsientos(recintoId: string, data: CrearMapaAsientosRequest) {
    return api.post<AsientoResponse[]>(`/recintos/${recintoId}/mapa`, data).then(r => r.data);
  },

  marcarEspacioVacio(recintoId: string, asientoId: string, data: MarcarEspacioVacioRequest) {
    return api
      .patch<AsientoResponse>(
        `/recintos/${recintoId}/mapa/asientos/${asientoId}`,
        data,
      )
      .then(r => r.data);
  },
};
