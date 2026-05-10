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
  getRecintos(filtros: RecintoFiltros = {}) {
    return api.get<PageResponse<RecintoResponse>>('/recintos', { params: filtros }).then(r => r.data);
  },

  getRecinto(id: string) {
    return api.get<RecintoResponse>(`/recintos/${id}`).then(r => r.data);
  },

  getEstructura(id: string) {
    return api.get<RecintoEstructuraResponse>(`/recintos/${id}/estructura`).then(r => r.data);
  },

  createRecinto(data: CrearRecintoRequest) {
    return api.post<RecintoResponse>('/recintos', data).then(r => r.data);
  },

  editRecinto(id: string, data: EditarRecintoRequest) {
    return api.put<RecintoResponse>(`/recintos/${id}`, data).then(r => r.data);
  },

  desactivarRecinto(id: string) {
    return api.delete<void>(`/recintos/${id}/desactivar`).then(r => r.data);
  },

  reactivarRecinto(id: string) {
    return api.patch<void>(`/recintos/${id}/reactivar`).then(r => r.data);
  },

  configurarCapacidad(id: string, data: ConfigurarCapacidadRequest) {
    return api.patch<RecintoResponse>(`/recintos/${id}/capacidad`, data).then(r => r.data);
  },

  configurarCategoria(id: string, data: ConfigurarCategoriaRequest) {
    return api.patch<RecintoResponse>(`/recintos/${id}/categoria`, data).then(r => r.data);
  },

  getZonas(recintoId: string) {
    return api.get<ZonaResponse[]>(`/recintos/${recintoId}/zonas`).then(r => r.data);
  },

  createZona(recintoId: string, data: CrearZonaRequest) {
    return api.post<ZonaResponse>(`/recintos/${recintoId}/zonas`, data).then(r => r.data);
  },

  getCompuertas(recintoId: string) {
    return api.get<CompuertaResponse[]>(`/recintos/${recintoId}/compuertas`).then(r => r.data);
  },

  createCompuerta(recintoId: string, data: CrearCompuertaRequest) {
    return api.post<CompuertaResponse>(`/recintos/${recintoId}/compuertas`, data).then(r => r.data);
  },

  asignarCompuertaZona(zonaId: string, compuertaId: string) {
    return api.patch<CompuertaResponse>(`/recintos/zonas/${zonaId}/compuertas/${compuertaId}`).then(r => r.data);
  },
};
