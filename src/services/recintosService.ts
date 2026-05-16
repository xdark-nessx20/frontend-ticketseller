import axios from 'axios';
import type {
  RecintoResponse,
  RecintoEstructuraResponse,
  ZonaResponse,
  CompuertaResponse,
  CrearRecintoRequest,
  EditarRecintoRequest,
  ConfigurarCapacidadRequest,
  ConfigurarCategoriaRequest,
  CrearZonaRequest,
  CrearCompuertaRequest,
  RecintoFiltros,
  PageResponse,
} from '../types/recinto.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
});

export const recintosService = {
  async getRecintos(filtros: RecintoFiltros = {}) {
    const r = await api.get<PageResponse<RecintoResponse>>('/recintos', {params: filtros});
    return r.data;
  },

  async getRecinto(id: string) {
    const r = await api.get<RecintoResponse>(`/recintos/${id}`);
    return r.data;
  },

  async getEstructura(id: string) {
    const r = await api.get<RecintoEstructuraResponse>(`/recintos/${id}/estructura`);
    return r.data;
  },

  async createRecinto(data: CrearRecintoRequest) {
    const r = await api.post<RecintoResponse>('/recintos', data);
    return r.data;
  },

  async editRecinto(id: string, data: EditarRecintoRequest) {
    const r = await api.put<RecintoResponse>(`/recintos/${id}`, data);
    return r.data;
  },

  async desactivarRecinto(id: string) {
    const r = await api.delete<void>(`/recintos/${id}/desactivar`);
    return r.data;
  },

  async reactivarRecinto(id: string) {
    const r = await api.patch<void>(`/recintos/${id}/reactivar`);
    return r.data;
  },

  async configurarCapacidad(id: string, data: ConfigurarCapacidadRequest) {
    const r = await api.patch<RecintoResponse>(`/recintos/${id}/capacidad`, data);
    return r.data;
  },

  async configurarCategoria(id: string, data: ConfigurarCategoriaRequest) {
    const r = await api.patch<RecintoResponse>(`/recintos/${id}/categoria`, data);
    return r.data;
  },

  async getZonas(recintoId: string) {
    const r = await api.get<ZonaResponse[]>(`/recintos/${recintoId}/zonas`);
    return r.data;
  },

  async createZona(recintoId: string, data: CrearZonaRequest) {
    const r = await api.post<ZonaResponse>(`/recintos/${recintoId}/zonas`, data);
    return r.data;
  },

  async getCompuertas(recintoId: string) {
    const r = await api.get<CompuertaResponse[]>(`/recintos/${recintoId}/compuertas`);
    return r.data;
  },

  async createCompuerta(recintoId: string, data: CrearCompuertaRequest) {
    const r = await api.post<CompuertaResponse>(`/recintos/${recintoId}/compuertas`, data);
    return r.data;
  },

  async asignarCompuertaZona(zonaId: string, compuertaId: string) {
    const r = await api.patch<CompuertaResponse>(`/recintos/zonas/${zonaId}/compuertas/${compuertaId}`);
    return r.data;
  },
};
