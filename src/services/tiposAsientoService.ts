import axios from 'axios';
import type {
  TipoAsientoResponse,
  AsientoResponse,
  CrearTipoAsientoRequest,
  EditarTipoAsientoRequest,
  AsignarTipoAsientoRequest,
  AsignarAsientosZonaRequest,
  CrearMapaAsientosRequest,
  TipoAsientoFiltros,
  Page,
} from '../types/asiento.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const tiposAsientoService = {
  async getTiposAsiento(filtros: TipoAsientoFiltros = {}) {
    const r = await api.get<TipoAsientoResponse[]>('/tipos-asiento', {params: filtros});
    return r.data;
  },

  async getTipoAsiento(id: string) {
    const r = await api.get<TipoAsientoResponse>(`/tipos-asiento/${id}`);
    return r.data;
  },

  async createTipoAsiento(data: CrearTipoAsientoRequest) {
    const r = await api.post<TipoAsientoResponse>('/tipos-asiento', data);
    return r.data;
  },

  async editTipoAsiento(id: string, data: EditarTipoAsientoRequest) {
    const r = await api.put<TipoAsientoResponse>(`/tipos-asiento/${id}`, data);
    return r.data;
  },

  async desactivar(id: string) {
    const r = await api.delete<void>(`/tipos-asiento/${id}/desactivar`);
    return r.data;
  },

  async asignarAZona(recintoId: string, zonaId: string, data: AsignarTipoAsientoRequest) {
    const r = await api
        .post<void>(`/recintos/${recintoId}/zonas/${zonaId}/tipo-asiento`, data);
    return r.data;
  },

  async asignarAsientosAZona(recintoId: string, zonaId: string, data: AsignarAsientosZonaRequest) {
    const r = await api
        .post<void>(`/recintos/${recintoId}/zonas/${zonaId}/asientos`, data);
    return r.data;
  },

  async getMapaAsientos(recintoId: string) {
    const r = await api
        .get<Page<AsientoResponse>>(`/recintos/${recintoId}/mapa/asientos`, {params: {size: 5000}});
    return r.data.content.map(a => ({...a, existente: a.estado !== 'INACTIVO'}));
  },

  async crearMapaAsientos(recintoId: string, data: CrearMapaAsientosRequest) {
    const r = await api
        .post<AsientoResponse[]>(`/recintos/${recintoId}/mapa`, data);
    return r.data.map(a => ({...a, existente: a.estado !== 'INACTIVO'}));
  },

  async marcarEspacioVacio(recintoId: string, asientoId: string) {
    const r = await api
        .patch<AsientoResponse>(`/recintos/${recintoId}/mapa/asientos/${asientoId}`);
    return r.data;
  },
};
